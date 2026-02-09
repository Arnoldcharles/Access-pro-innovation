'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion, cubicBezier } from 'framer-motion';
import { collection, doc, getDoc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ScanResult = {
  status: 'idle' | 'scanning' | 'success' | 'error';
  message: string;
};

export default function ScanPage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string }>();
  const [result, setResult] = useState<ScanResult>({ status: 'idle', message: '' });
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [toast, setToast] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [scanStart, setScanStart] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [uid, setUid] = useState('');
  const [orgPlan, setOrgPlan] = useState<'free' | 'pro'>('free');
  const isFree = orgPlan !== 'pro';
  const maxScans = isFree ? 5 : Number.MAX_SAFE_INTEGER;
  const maxScansLabel = isFree ? String(maxScans) : 'unlimited';
  const [blockedOrgOpen, setBlockedOrgOpen] = useState(false);

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  useEffect(() => {
    const checkRole = async () => {
      const orgSlug = params?.org;
      if (!orgSlug) return;
      const authUser = (await import('firebase/auth')).getAuth().currentUser;
      if (!authUser) {
        router.replace('/sign-in');
        return;
      }
      setUid(authUser.uid);
      const userSnap = await getDoc(doc(db, 'users', authUser.uid));
      const userBlocked = userSnap.exists() ? Boolean((userSnap.data() as { blocked?: boolean }).blocked) : false;
      if (userBlocked) {
        await (await import('firebase/auth')).getAuth().signOut();
        router.replace('/sign-in');
        return;
      }
      if (orgSlug) {
        const orgSnap = await getDoc(doc(db, 'orgs', orgSlug));
        if (orgSnap.exists()) {
          const orgData = orgSnap.data() as { plan?: 'free' | 'pro'; blocked?: boolean };
          if (orgData.blocked) {
            setBlockedOrgOpen(true);
            setTimeout(() => router.replace('/onboarding'), 1200);
            return;
          }
          setOrgPlan(orgData.plan === 'pro' ? 'pro' : 'free');
        }
      }
    };
    checkRole();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [params, router]);

  const parseCode = (code: string) => {
    const [namePart] = code.split('|');
    return namePart?.trim();
  };

  const markCheckedIn = async (guestName: string, durationMs?: number) => {
    if (!guestName) return false;
    const guestsQuery = query(
      collection(db, 'orgs', params.org, 'events', params.event, 'guests'),
      where('name', '==', guestName)
    );
    const guestsSnap = await getDocs(guestsQuery);
    for (const guestDoc of guestsSnap.docs) {
      const data = guestDoc.data() as { checkInCount?: number; checkedIn?: boolean };
      const currentCount = data.checkInCount ?? 0;
      if (currentCount >= maxScans) {
        setResult({ status: 'error', message: 'Already inside (max scans reached).' });
        return false;
      }
      const nextCount = currentCount + 1;
      await updateDoc(guestDoc.ref, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkInCount: nextCount,
      });
      if (typeof durationMs === 'number') {
        await updateDoc(doc(db, 'orgs', params.org, 'events', params.event), {
          scanTotalMs: increment(durationMs),
          scanCount: increment(1),
        });
      }
      setResult({
        status: 'success',
        message:
          nextCount === 1
            ? `Checked in ${guestName}`
            : `Re-entry granted for ${guestName} (${Math.min(nextCount, maxScans)}/${maxScansLabel})`,
      });
      return true;
    }
    return false;
  };

  const handleManualCheckIn = async () => {
    if (isFree) {
      setUpgradeOpen(true);
      return;
    }
    const guestName = parseCode(manualCode);
    if (!guestName) {
      setResult({ status: 'error', message: 'Invalid code.' });
      return;
    }
    const ok = await markCheckedIn(guestName);
    if (!ok) {
      setResult({ status: 'error', message: 'Guest not found.' });
      setToastType('error');
      setToast('Guest not found');
      setTimeout(() => setToast(''), 1200);
    } else {
      setToastType('success');
      setToast(`${guestName} checked in successfully`);
      setTimeout(() => setToast(''), 1200);
    }
  };

  const startScan = async () => {
    if (isFree) {
      setUpgradeOpen(true);
      return;
    }
    if (!('BarcodeDetector' in window)) {
      setResult({ status: 'error', message: 'Barcode detector not supported on this browser.' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities ? track.getCapabilities() : undefined;
      if (capabilities && 'zoom' in capabilities) {
        const zoomCaps = capabilities.zoom as { min: number; max: number };
        try {
          await track.applyConstraints({ advanced: [{ zoom: Math.min(zoomCaps.max, 2) }] } as unknown as MediaTrackConstraints);
        } catch {
          // ignore if not supported
        }
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setResult({ status: 'scanning', message: 'Scanning...' });
      setScanStart(performance.now());
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

      const scanLoop = async () => {
        if (!videoRef.current) return;
        if (result.status !== 'scanning') return;
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue as string;
          const guestName = parseCode(code);
          const durationMs = scanStart ? Math.max(0, Math.round(performance.now() - scanStart)) : undefined;
          const ok = await markCheckedIn(guestName, durationMs);
          if (!ok) {
            setResult({ status: 'error', message: 'Guest not found.' });
            setToastType('error');
            setToast('Guest not found');
            setTimeout(() => setToast(''), 1200);
          } else {
            setToastType('success');
            setToast(`${guestName} checked in successfully`);
            setTimeout(() => setToast(''), 1200);
          }
          if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
          return;
        }
        requestAnimationFrame(scanLoop);
      };
      requestAnimationFrame(scanLoop);
    } catch {
      setResult({ status: 'error', message: 'Unable to access camera.' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { ease: easeOut } }}>
          <Link className="text-sm text-slate-600 hover:text-slate-900" href={`/${params.org}/${params.event}`}>
            Back to event
          </Link>
          <h1 className="text-3xl font-black mt-4">QR Check-in</h1>
          <p className="text-slate-600 mt-2">Scan guest QR codes to check them in live.</p>
        </motion.div>

        <div className="mt-8 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="border border-slate-200 rounded-3xl p-4 bg-white shadow-sm">
            <div className="relative">
              <video ref={videoRef} className="w-full rounded-2xl bg-slate-100" />
              {result.status === 'scanning' || result.status === 'success' || result.status === 'error' ? (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  <div
                    className={`scan-line ${
                      result.status === 'success' ? 'scan-line-success' : result.status === 'error' ? 'scan-line-error' : ''
                    }`}
                  />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className={`mt-4 px-5 py-3 rounded-2xl font-semibold ${
                isFree ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white'
              }`}
              onClick={startScan}
            >
              {isFree ? 'QR scanning disabled' : 'Start scanning'}
            </button>
          </div>
          <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Manual check-in</h2>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Paste QR code value"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              disabled={isFree}
            />
            <button
              type="button"
              className={`px-4 py-2 rounded-2xl text-sm ${
                isFree ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white'
              }`}
              onClick={handleManualCheckIn}
            >
              {isFree ? 'Manual check-in disabled' : 'Check in guest'}
            </button>
            {isFree ? <div className="text-xs text-slate-500">QR check-in is disabled in free mode.</div> : null}
            {result.message ? (
              <div
                className={`text-sm ${
                  result.status === 'success' ? 'text-emerald-600' : result.status === 'error' ? 'text-red-500' : 'text-slate-500'
                }`}
              >
                {result.message}
              </div>
            ) : null}
          </div>
        </div>
        {toast ? (
          <div
            className={`fixed top-6 right-6 text-white px-4 py-2 rounded-2xl shadow-lg animate-pop ${
              toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toast}
          </div>
        ) : null}
      </div>
      <AnimatePresence>
        {upgradeOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/60"
              onClick={() => setUpgradeOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Upgrade required</h3>
              <p className="text-sm text-slate-600 mb-4">
                QR scanning is disabled in free mode. Upgrade to unlock QR check-in and smart invitations.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                  onClick={() => setUpgradeOpen(false)}
                >
                  Not now
                </button>
                <Link className="px-4 py-2 rounded-2xl bg-blue-600 text-white" href={`/${params.org}/pricing`}>
                  View pricing
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {blockedOrgOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/60"
              onClick={() => setBlockedOrgOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Organization blocked</h3>
              <p className="text-sm text-slate-600 mb-4">
                This organization has been blocked by an administrator. You will be redirected.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                onClick={() => setBlockedOrgOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

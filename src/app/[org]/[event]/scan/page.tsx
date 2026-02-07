'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ScanResult = {
  status: 'idle' | 'scanning' | 'success' | 'error';
  message: string;
};

export default function ScanPage() {
  const params = useParams<{ org: string; event: string }>();
  const [result, setResult] = useState<ScanResult>({ status: 'idle', message: '' });
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [toast, setToast] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const parseCode = (code: string) => {
    const [namePart] = code.split('|');
    return namePart?.trim();
  };

  const markCheckedIn = async (guestName: string) => {
    if (!guestName) return false;
    const guestsQuery = query(
      collection(db, 'orgs', params.org, 'events', params.event, 'guests'),
      where('name', '==', guestName)
    );
    const guestsSnap = await getDocs(guestsQuery);
    for (const guestDoc of guestsSnap.docs) {
      const data = guestDoc.data() as { checkInCount?: number; checkedIn?: boolean };
      const currentCount = data.checkInCount ?? 0;
      if (currentCount >= 2) {
        setResult({ status: 'error', message: 'Already inside (max scans reached).' });
        return false;
      }
      const nextCount = currentCount + 1;
      await updateDoc(guestDoc.ref, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkInCount: nextCount,
      });
      setResult({
        status: 'success',
        message: nextCount === 1 ? `Checked in ${guestName}` : `Re-entry granted for ${guestName} (2/2)`,
      });
      return true;
    }
    return false;
  };

  const handleManualCheckIn = async () => {
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
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

      const scanLoop = async () => {
        if (!videoRef.current) return;
        if (result.status !== 'scanning') return;
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue as string;
          const guestName = parseCode(code);
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
              className="mt-4 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
              onClick={startScan}
            >
              Start scanning
            </button>
          </div>
          <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Manual check-in</h2>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Paste QR code value"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
            />
            <button
              type="button"
              className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm"
              onClick={handleManualCheckIn}
            >
              Check in guest
            </button>
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
    </div>
  );
}

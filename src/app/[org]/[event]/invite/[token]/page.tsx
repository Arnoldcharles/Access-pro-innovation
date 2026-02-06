'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type InviteData = {
  token: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  imageDataUrl?: string;
  used: boolean;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string; token: string }>();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [phoneCheck, setPhoneCheck] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      const { org, event, token } = params;
      if (!org || !event || !token) return;
      const snap = await getDoc(doc(db, 'orgs', org, 'events', event, 'invites', token));
      if (!snap.exists()) {
        setError('Invite not found.');
        setLoading(false);
        return;
      }
      const data = snap.data() as InviteData;
      if (data.used) {
        setError('This invite link has already been used.');
      } else {
        setInvite(data);
      }
      setLoading(false);
    };
    loadInvite();
  }, [params]);

  const handleVerify = () => {
    if (!invite) return;
    if (phoneCheck.trim() === invite.guestPhone) {
      setVerified(true);
      setError('');
    } else {
      setError('Phone number does not match the invite.');
    }
  };

  const handleAccept = async () => {
    if (!invite) return;
    setAccepting(true);
    try {
      await updateDoc(doc(db, 'orgs', params.org, 'events', params.event, 'invites', invite.token), {
        used: true,
        acceptedAt: new Date().toISOString(),
      });
      setInvite({ ...invite, used: true });
      router.replace(`/${params.org}/${params.event}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to accept invite';
      setError(message);
    } finally {
      setAccepting(false);
    }
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center">
        Loading invite...
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <div className="max-w-[620px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-2xl font-black mb-2">
            {invite?.guestName || 'Guest'}, you are invited to {invite?.eventName}
          </h1>
          <p className="text-slate-400 mb-6">
            Date: {invite?.eventDate || 'TBD'} - Location: {invite?.eventLocation || 'TBD'}
          </p>

          {!verified ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Confirm your phone number to open this invite.</p>
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Phone number"
                value={phoneCheck}
                onChange={(event) => setPhoneCheck(event.target.value)}
              />
              <button className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold" onClick={handleVerify}>
                Verify
              </button>
              {error ? <div className="text-sm text-red-400">{error}</div> : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-slate-400">Message:</div>
              <div className="text-sm bg-white/5 border border-white/10 rounded-xl p-4">{invite?.message}</div>
              {invite?.imageDataUrl ? (
                <img src={invite.imageDataUrl} alt="Invite" className="rounded-2xl border border-white/10" />
              ) : null}
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                  <img
                    alt="QR code"
                    className="w-full h-full object-cover rounded-xl"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `${invite?.guestName ?? ''}|${params.org}/${params.event}`
                    )}`}
                  />
                </div>
                <div className="text-xs text-slate-500">QR contains guest name + event ID.</div>
              </div>
              <button
                className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold"
                disabled={accepting}
                onClick={handleAccept}
              >
                {accepting ? 'Accepting...' : 'I accept'}
              </button>
              {error ? <div className="text-sm text-red-400">{error}</div> : null}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

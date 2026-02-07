'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
  const [finalStatus, setFinalStatus] = useState<'accepted' | 'declined' | null>(null);

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
        status: 'accepted',
      });
      if (invite?.guestEmail) {
        const guestsQuery = query(
          collection(db, 'orgs', params.org, 'events', params.event, 'guests'),
          where('email', '==', invite.guestEmail)
        );
        const guestsSnap = await getDocs(guestsQuery);
        for (const guestDoc of guestsSnap.docs) {
          await updateDoc(guestDoc.ref, { status: 'accepted' });
        }
      }
      setInvite({ ...invite, used: true });
      setFinalStatus('accepted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to accept invite';
      setError(message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    setAccepting(true);
    try {
      await updateDoc(doc(db, 'orgs', params.org, 'events', params.event, 'invites', invite.token), {
        used: true,
        declinedAt: new Date().toISOString(),
        status: 'declined',
      });
      if (invite?.guestEmail) {
        const guestsQuery = query(
          collection(db, 'orgs', params.org, 'events', params.event, 'guests'),
          where('email', '==', invite.guestEmail)
        );
        const guestsSnap = await getDocs(guestsQuery);
        for (const guestDoc of guestsSnap.docs) {
          await updateDoc(guestDoc.ref, { status: 'declined' });
        }
      }
      setInvite({ ...invite, used: true });
      setFinalStatus('declined');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to decline invite';
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
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-r-blue-600 animate-spin" />
          Loading invite...
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[620px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {finalStatus ? (
            <div className="text-center py-8 relative overflow-hidden">
              {finalStatus === 'accepted' ? (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(14)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute h-2 w-2 rounded-full animate-confetti"
                      style={{
                        left: `${(i * 7) % 100}%`,
                        animationDelay: `0s, ${1.2 + i * 0.23}s`,
                        animationDuration: `0.6s, ${3.6 + (i % 5) * 0.5}s`,
                        backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#ef4444'][i % 4],
                      }}
                    />
                  ))}
                </div>
              ) : null}
              <div className="relative mx-auto mb-6 h-24 w-24">
                <span className={`absolute inset-0 rounded-full ${finalStatus === 'accepted' ? 'bg-emerald-100' : 'bg-rose-100'} animate-ping`}></span>
                <span className={`absolute inset-2 rounded-full ${finalStatus === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <motion.h2
                className="text-2xl font-black mb-2"
                initial={finalStatus === 'accepted' ? { x: 40, opacity: 0 } : false}
                animate={finalStatus === 'accepted' ? { x: 0, opacity: 1 } : false}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {finalStatus === 'accepted' ? 'Invite accepted' : 'Invite declined'}
              </motion.h2>
              <motion.p
                className="text-slate-600"
                initial={finalStatus === 'accepted' ? { x: 40, opacity: 0 } : false}
                animate={finalStatus === 'accepted' ? { x: 0, opacity: 1 } : false}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.05 }}
              >
                {finalStatus === 'accepted'
                  ? 'You are confirmed for this event. Your QR code will be sent.'
                  : 'We have recorded your response. Thank you.'}
              </motion.p>
            </div>
          ) : (
            <>
          <h1 className="text-2xl font-black mb-2">
            {invite?.guestName || 'Guest'}, you are invited to {invite?.eventName}
          </h1>
          <p className="text-slate-600 mb-6">
            Date: {invite?.eventDate || 'TBD'} - Location: {invite?.eventLocation || 'TBD'}
          </p>

          {!verified ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Confirm your phone number to open this invite.</p>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
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
              <div className="text-sm text-slate-600">Message:</div>
              <div className="text-sm bg-slate-50 border border-slate-200 rounded-xl p-4">{invite?.message}</div>
              {invite?.imageDataUrl ? (
                <img src={invite.imageDataUrl} alt="Invite" className="rounded-2xl border border-white/10" />
              ) : null}
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500">
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
              <div className="flex items-center gap-3">
                <button
                  className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold"
                  disabled={accepting}
                  onClick={handleAccept}
                >
                  {accepting ? 'Accepting...' : 'I accept'}
                </button>
                <button
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold"
                  disabled={accepting}
                  onClick={handleDecline}
                >
                  Decline
                </button>
              </div>
              {error ? <div className="text-sm text-red-400">{error}</div> : null}
            </div>
          )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

type OrgItem = { slug: string; name?: string };

export default function OrgDeletedPage() {
  const router = useRouter();
  const [deletedSlug, setDeletedSlug] = useState('');
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setDeletedSlug(params.get('org') ?? '');
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }
      const orgsQuery = query(collection(db, 'orgs'), where('ownerId', '==', user.uid));
      const unsubOrgs = onSnapshot(orgsQuery, (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => ({
            slug: docSnap.id,
            ...(docSnap.data() as object),
          }))
          .filter((item) => !(item as { deletedAt?: unknown }).deletedAt) as OrgItem[];
        setOrgs(items);
        setLoading(false);
        if (items.length === 0) router.replace('/onboarding');
      });
      return () => unsubOrgs();
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!deletedSlug) return;
    setCountdown(10);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handlePermanentDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [deletedSlug]);

  const handlePermanentDelete = async () => {
    if (!deletedSlug || deleting) return;
    setDeleting(true);
    const orgRef = doc(db, 'orgs', deletedSlug);
    const orgSnap = await getDoc(orgRef);
    if (!orgSnap.exists()) return;
    const eventsSnap = await getDocs(collection(db, 'orgs', deletedSlug, 'events'));
    for (const eventDoc of eventsSnap.docs) {
      const eventId = eventDoc.id;
      const guestsSnap = await getDocs(collection(db, 'orgs', deletedSlug, 'events', eventId, 'guests'));
      for (const guest of guestsSnap.docs) {
        await deleteDoc(guest.ref);
      }
      const invitesSnap = await getDocs(collection(db, 'orgs', deletedSlug, 'events', eventId, 'invites'));
      for (const invite of invitesSnap.docs) {
        await deleteDoc(invite.ref);
      }
      await deleteDoc(eventDoc.ref);
    }
    await deleteDoc(orgRef);
    const currentUserId = auth.currentUser?.uid;
    if (currentUserId) {
      const userSnap = await getDoc(doc(db, 'users', currentUserId));
      const currentCount = userSnap.exists() ? ((userSnap.data().orgCount as number) ?? 0) : 0;
      await updateDoc(doc(db, 'users', currentUserId), { orgCount: Math.max(0, currentCount - 1) });
    }
    const orgsQuery = query(collection(db, 'orgs'), where('ownerId', '==', auth.currentUser?.uid ?? ''));
    const remainingSnap = await getDocs(orgsQuery);
    const remaining = remainingSnap.docs
      .map((docSnap) => ({ slug: docSnap.id, ...(docSnap.data() as object) }))
      .filter((item) => !(item as { deletedAt?: unknown }).deletedAt)
      .filter((item) => item.slug !== deletedSlug);
    if (remaining.length === 0) router.replace('/onboarding');
  };

  const handleRestore = async () => {
    if (!deletedSlug || restoring) return;
    setRestoring(true);
    if (timerRef.current) clearInterval(timerRef.current);
    await updateDoc(doc(db, 'orgs', deletedSlug), { deletedAt: null });
    router.replace(`/${deletedSlug}`);
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
          Loading organizations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { ease: easeOut } }}>
          <h1 className="text-2xl font-black mb-2">Organization deleted</h1>
          <p className="text-slate-600 mb-6">
            {deletedSlug ? `"${deletedSlug}" was deleted.` : 'The organization was deleted.'} Choose where to go next.
          </p>
          <div className="mb-6 flex items-center justify-between text-sm text-slate-600">
            <div>
              Auto delete in <span className="font-semibold">{countdown}s</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-2xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
              onClick={handleRestore}
              disabled={restoring || deleting}
            >
              {restoring ? 'Restoring...' : 'Restore org'}
            </button>
          </div>
          <div className="space-y-2">
            <div className="w-full text-left px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{deletedSlug || 'Deleted organization'}</div>
                  <div className="text-xs">Deletion in progress</div>
                </div>
                <div className="text-sm font-semibold">{countdown}s</div>
              </div>
            </div>
            {orgs.map((item) => (
              <button
                key={item.slug}
                type="button"
                className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50"
                onClick={() => router.replace(`/${item.slug}`)}
              >
                {item.name ?? item.slug}
              </button>
            ))}
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-blue-600"
              onClick={() => router.replace('/onboarding?newOrg=1')}
            >
              + Create new org
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

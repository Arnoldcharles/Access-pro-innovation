'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [role, setRole] = useState('');
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [showOrgTaken, setShowOrgTaken] = useState(false);
  const [orgCount, setOrgCount] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const siteOwnerUid = 'krpJL2xq7Rf1NUumK3G6nzpZWsM2';
  const isFree = uid !== siteOwnerUid;
  const maxOrgs = 2;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }

      setUid(user.uid);
      setEmail(user.email ?? '');
      setName(user.displayName ?? '');
      setPhone(user.phoneNumber ?? '');

      const allowNewOrg = typeof window !== 'undefined' && window.location.search.includes('newOrg=1');
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName((data.name as string) ?? user.displayName ?? '');
        setPhone((data.phone as string) ?? user.phoneNumber ?? '');
        setOrgName((data.orgName as string) ?? '');
        setOrgSize((data.orgSize as string) ?? '');
        setRole((data.role as string) ?? '');
        if (data.orgSlug && !allowNewOrg) {
          const orgSnap = await getDoc(doc(db, 'orgs', data.orgSlug as string));
          const orgData = orgSnap.exists() ? orgSnap.data() : null;
          if (orgSnap.exists() && !(orgData as { deletedAt?: unknown })?.deletedAt) {
            router.replace(`/${data.orgSlug}`);
            return;
          }
        }
      }
      const orgsQuery = query(collection(db, 'orgs'), where('ownerId', '==', user.uid));
      const orgsSnap = await getDocs(orgsQuery);
      const activeCount = orgsSnap.docs.filter((docSnap) => !(docSnap.data() as { deletedAt?: unknown }).deletedAt).length;
      setOrgCount(activeCount);

      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const orgSlugPreview = useMemo(() => slugify(orgName || 'your-organization'), [orgName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!uid) return;
    const baseSlug = slugify(orgName);
    if (!baseSlug) {
      setError('Please enter your organization name.');
      return;
    }

    setSaving(true);
    try {
      if (isFree && orgCount >= maxOrgs) {
        setUpgradeOpen(true);
        setSaving(false);
        return;
      }
      let slug = baseSlug;
      const orgSnap = await getDoc(doc(db, 'orgs', slug));
      if (orgSnap.exists()) {
        setShowOrgTaken(true);
        setSaving(false);
        return;
      }

      const now = serverTimestamp();
      const batch = writeBatch(db);
      batch.set(doc(db, 'orgs', slug), {
        name: orgName,
        slug,
        ownerId: uid,
        createdAt: now,
        updatedAt: now,
        eventCount: 0,
        plan: 'free',
      });
      batch.set(doc(db, 'orgs', slug, 'members', uid), {
        role: 'owner',
        email,
        name,
        createdAt: now,
        updatedAt: now,
      });
      batch.set(
        doc(db, 'users', uid),
        {
          uid,
          email,
          name,
          phone,
          orgName,
          orgSlug: slug,
          orgSize,
          role,
          updatedAt: now,
          createdAt: now,
          orgCount: increment(1),
        },
        { merge: true }
      );
      await batch.commit();

      router.replace(`/${slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to complete onboarding';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="flex items-center gap-3 mb-10" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="font-bold text-xl tracking-tight">AccessPro Innovation</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-black mb-3">Set up your organization</h1>
          <p className="text-slate-600 mb-8">
            Confirm your details and create your organization workspace. Your dashboard URL will be:
            <span className="text-blue-400 font-semibold"> /{orgSlugPreview}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Organization name"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Organization size"
                value={orgSize}
                onChange={(event) => setOrgSize(event.target.value)}
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Your role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                'Save and continue'
              )}
            </button>
          </form>

          {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
        </motion.div>
      </div>
      <AnimatePresence>
        {showOrgTaken ? (
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
              onClick={() => setShowOrgTaken(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Organization name taken</h3>
              <p className="text-sm text-slate-600 mb-4">
                That organization name is already in use. Please choose another.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold"
                onClick={() => setShowOrgTaken(false)}
              >
                Okay
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
                Free mode allows up to {maxOrgs} organizations. Upgrade to create more.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                  onClick={() => setUpgradeOpen(false)}
                >
                  Not now
                </button>
                <Link className="px-4 py-2 rounded-2xl bg-blue-600 text-white" href="/pricing">
                  View pricing
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

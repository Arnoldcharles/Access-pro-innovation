'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName((data.name as string) ?? user.displayName ?? '');
        setPhone((data.phone as string) ?? user.phoneNumber ?? '');
        setOrgName((data.orgName as string) ?? '');
        setOrgSize((data.orgSize as string) ?? '');
        setRole((data.role as string) ?? '');
        if (data.orgSlug) {
          router.replace(`/${data.orgSlug}`);
          return;
        }
      }

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
      let slug = baseSlug;
      for (let i = 2; i < 50; i += 1) {
        const orgSnap = await getDoc(doc(db, 'orgs', slug));
        if (!orgSnap.exists()) break;
        slug = `${baseSlug}-${i}`;
      }

      const now = serverTimestamp();
      await setDoc(doc(db, 'orgs', slug), {
        name: orgName,
        slug,
        ownerId: uid,
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(
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
        },
        { merge: true }
      );

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
            <span className="font-bold text-xl tracking-tight">AccessPro</span>
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors"
            >
              Save and continue
            </button>
          </form>

          {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}

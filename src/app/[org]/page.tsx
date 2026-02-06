'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type OrgData = {
  name?: string;
  slug?: string;
};

type UserData = {
  name?: string;
  orgSlug?: string;
};

export default function OrgDashboardPage() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/sign-in');
        return;
      }
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userSnap.exists() ? (userSnap.data() as UserData) : null;
      setUser(userData);

      const slug = params?.org;
      if (!slug) return;

      const orgSnap = await getDoc(doc(db, 'orgs', slug));
      if (!orgSnap.exists()) {
        router.replace('/onboarding');
        return;
      }

      setOrg(orgSnap.data() as OrgData);
      if (userData?.orgSlug && userData.orgSlug !== slug) {
        router.replace(`/${userData.orgSlug}`);
        return;
      }

      setLoading(false);
    });
    return () => unsub();
  }, [params, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/sign-in');
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.nav initial="hidden" animate="show" variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">A</div>
            <div>
              <div className="font-bold text-xl tracking-tight">{org?.name ?? 'Organization'}</div>
              <div className="text-xs text-slate-500">Dashboard</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="px-4 py-2 rounded-full bg-slate-900 text-slate-300" href="/">
              Marketing site
            </Link>
            <button className="px-4 py-2 rounded-full bg-slate-800 text-slate-200" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </motion.nav>

        <motion.section initial="hidden" animate="show" variants={fadeUp} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3">Welcome{user?.name ? `, ${user.name}` : ''}.</h1>
          <p className="text-slate-400">Here is your live event overview for {org?.name ?? 'your organization'}.</p>
        </motion.section>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Active events', value: '2', note: '1 starting today' },
            { label: 'Guests checked in', value: '418', note: '+12 in last 30 min' },
            { label: 'Team members', value: '8', note: 'All devices synced' },
          ].map((card) => (
            <div key={card.label} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <div className="text-xs uppercase tracking-widest text-slate-500">{card.label}</div>
              <div className="text-3xl font-black mt-2">{card.value}</div>
              <div className="text-sm text-slate-500 mt-2">{card.note}</div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Today’s check-in flow</h2>
            <div className="space-y-4 text-sm text-slate-400">
              <div className="flex items-center justify-between">
                <span>Gates open</span>
                <span>5:30 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Peak window</span>
                <span>7:00 PM - 8:15 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average scan time</span>
                <span>4.1 sec</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Next steps</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <div>Upload today’s guest list</div>
              <div>Assign staff to scan lanes</div>
              <div>Enable SMS reminders</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

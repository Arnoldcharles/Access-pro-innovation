'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type EventData = {
  name?: string;
  date?: string;
  time?: string;
  location?: string;
  status?: string;
};

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string }>();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }
      const orgSlug = params?.org;
      const eventSlug = params?.event;
      if (!orgSlug || !eventSlug) return;

      const orgSnap = await getDoc(doc(db, 'orgs', orgSlug));
      if (!orgSnap.exists()) {
        router.replace('/onboarding');
        return;
      }
      setOrgName((orgSnap.data().name as string) ?? '');

      const eventSnap = await getDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug));
      if (!eventSnap.exists()) {
        router.replace(`/${orgSlug}`);
        return;
      }
      setEventData(eventSnap.data() as EventData);
      setLoading(false);
    });
    return () => unsub();
  }, [params, router]);

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased flex items-center justify-center">
        Loading event...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="text-sm text-slate-400 hover:text-white" href={`/${params.org}`}>
            Back to {orgName || 'dashboard'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-3">{eventData?.name ?? 'Event'}</h1>
          <p className="text-slate-400 mb-8">
            {eventData?.date ? `Date: ${eventData.date}` : 'Date: TBD'}
            {eventData?.time ? ` · Time: ${eventData.time}` : ' · Time: TBD'} ·{' '}
            {eventData?.location ?? 'Location: TBD'}
          </p>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Registrations', value: '0', note: 'Import guest list to begin' },
            { label: 'Checked-in', value: '0', note: 'Check-in opens on event day' },
            { label: 'Staff assigned', value: '0', note: 'Assign your team' },
          ].map((card) => (
            <div key={card.label} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <div className="text-xs uppercase tracking-widest text-slate-500">{card.label}</div>
              <div className="text-3xl font-black mt-2">{card.value}</div>
              <div className="text-sm text-slate-500 mt-2">{card.note}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

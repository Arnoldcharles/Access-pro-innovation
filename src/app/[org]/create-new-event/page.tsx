'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion, cubicBezier } from 'framer-motion';
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

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }
      const orgSlug = params?.org;
      if (!orgSlug) return;
      const orgSnap = await getDoc(doc(db, 'orgs', orgSlug));
      if (!orgSnap.exists()) {
        router.replace('/onboarding');
        return;
      }
      setOrgName((orgSnap.data().name as string) ?? '');
      setLoading(false);
    });
    return () => unsub();
  }, [params, router]);

  const eventSlugPreview = useMemo(() => slugify(eventName || 'new-event'), [eventName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const orgSlug = params?.org;
    if (!orgSlug) return;

    const baseSlug = slugify(eventName);
    if (!baseSlug) {
      setError('Please enter an event name.');
      return;
    }

    setSaving(true);
    try {
      let slug = baseSlug;
      for (let i = 2; i < 50; i += 1) {
        const eventSnap = await getDoc(doc(db, 'orgs', orgSlug, 'events', slug));
        if (!eventSnap.exists()) break;
        slug = `${baseSlug}-${i}`;
      }

      const now = serverTimestamp();
      await setDoc(doc(db, 'orgs', orgSlug, 'events', slug), {
        name: eventName,
        slug,
        date: eventDate,
        time: eventTime,
        location,
        createdAt: now,
        updatedAt: now,
        status: 'draft',
      });
      setTransitioning(true);
      setTimeout(() => {
        router.replace(`/${orgSlug}/${slug}/design`);
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create event';
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
          Loading create event...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="text-sm text-slate-600 hover:text-slate-900" href={`/${params.org}`}>
            Back to {orgName || 'dashboard'}
          </Link>

          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-3">Create a new event</h1>
          <p className="text-slate-600 mb-8">
            This event will live at: <span className="text-blue-400 font-semibold">/{params.org}/{eventSlugPreview}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Event name"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Event date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Event time"
                type="time"
                value={eventTime}
                onChange={(event) => setEventTime(event.target.value)}
              />
            </div>
            <div>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors"
            >
              Create event
            </button>
          </form>

          {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
        </motion.div>
      </div>
      <AnimatePresence>
        {transitioning ? (
          <motion.div
            className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-slate-600"
            >
              Preparing design view...
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

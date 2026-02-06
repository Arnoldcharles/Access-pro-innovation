'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
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
  const searchParams = useSearchParams();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [events, setEvents] = useState<Array<{ id: string; name?: string; date?: string; time?: string; location?: string }>>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [eventsUnsub, setEventsUnsub] = useState<null | (() => void)>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');

  const showCreateEvent = searchParams?.has('create-new-event');

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const eventSlugPreview = useMemo(() => slugify(eventName || 'new-event'), [eventName]);

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
      setEventsLoading(true);
      if (eventsUnsub) eventsUnsub();
      const unsubEvents = onSnapshot(collection(db, 'orgs', slug, 'events'), (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as object) })) as Array<{
          id: string;
          name?: string;
          date?: string;
          time?: string;
          location?: string;
        }>;
        setEvents(items);
        setEventsLoading(false);
      });
      setEventsUnsub(() => unsubEvents);
    });
    return () => {
      unsub();
      if (eventsUnsub) eventsUnsub();
    };
  }, [params, router]);

  useEffect(() => {
    if (!showCreateEvent) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseModal();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [showCreateEvent]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/sign-in');
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
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

      router.replace(`/${orgSlug}/${slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create event';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const orgSlug = params?.org;
    if (!orgSlug) return;
    const confirmed = window.confirm('Delete this event? This cannot be undone.');
    if (!confirmed) return;
    await deleteDoc(doc(db, 'orgs', orgSlug, 'events', eventId));
    setEvents((prev) => prev.filter((item) => item.id !== eventId));
  };

  const handleCloseModal = () => {
    if (!params?.org) return;
    router.replace(`/${params.org}`);
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const filteredEvents = events
    .filter((event) => {
      if (!search.trim()) return true;
      const haystack = `${event.name ?? ''} ${event.location ?? ''}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    })
    .filter((event) => {
      if (filter === 'all') return true;
      if (!event.date) return false;
      const eventTime = new Date(event.date).getTime();
      if (Number.isNaN(eventTime)) return false;
      return filter === 'upcoming' ? eventTime >= normalizedToday : eventTime < normalizedToday;
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
    });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalEvents = events.length;
  const upcomingEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventTime = new Date(event.date).getTime();
    return !Number.isNaN(eventTime) && eventTime >= normalizedToday;
  }).length;
  const pastEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventTime = new Date(event.date).getTime();
    return !Number.isNaN(eventTime) && eventTime < normalizedToday;
  }).length;
  const nextEvent = filteredEvents.find((event) => event.date);

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

        <motion.section initial="hidden" animate="show" variants={fadeUp} className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Welcome{user?.name ? `, ${user.name}` : ''}.</h1>
          <p className="text-slate-400">Here is your live event overview for {org?.name ?? 'your organization'}.</p>
          </div>
          <Link
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
            href={`/${params.org}?create-new-event`}
          >
            Create event
          </Link>
        </motion.section>

        <AnimatePresence>
          {showCreateEvent ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
              />
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: easeOut } }}
                exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } }}
                className="relative z-10 w-full max-w-[640px] bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Create a new event</h2>
                    <p className="text-sm text-slate-400">
                      This event will live at{' '}
                      <span className="text-blue-400 font-semibold">/{params.org}/{eventSlugPreview}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-slate-400 hover:text-white"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <input
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                    placeholder="Event name"
                    value={eventName}
                    onChange={(event) => setEventName(event.target.value)}
                    required
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                      placeholder="Event date"
                      type="date"
                      value={eventDate}
                      onChange={(event) => setEventDate(event.target.value)}
                    />
                    <input
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                      placeholder="Event time"
                      type="time"
                      value={eventTime}
                      onChange={(event) => setEventTime(event.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                      placeholder="Location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create event'
                    )}
                  </button>
                  {error ? <div className="text-sm text-red-400">{error}</div> : null}
                </form>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Total events', value: String(totalEvents), note: `${upcomingEvents} upcoming` },
            { label: 'Upcoming events', value: String(upcomingEvents), note: nextEvent?.name ? `Next: ${nextEvent.name}` : 'No upcoming events' },
            { label: 'Past events', value: String(pastEvents), note: pastEvents ? 'Archived and searchable' : 'No past events' },
          ].map((card) => (
            <div key={card.label} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <div className="text-xs uppercase tracking-widest text-slate-500">{card.label}</div>
              <div className="text-3xl font-black mt-2">{card.value}</div>
              <div className="text-sm text-slate-500 mt-2">{card.note}</div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your events</h2>
            <Link className="text-sm text-blue-400 hover:text-blue-300" href={`/${params.org}?create-new-event`}>
              Create another event
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <input
              className="w-full sm:max-w-sm bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2 text-sm"
              placeholder="Search events"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <div className="flex items-center gap-2 text-sm">
              {(['all', 'upcoming', 'past'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`px-3 py-2 rounded-full border ${
                    filter === item ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-400'
                  }`}
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                >
                  {item === 'all' ? 'All' : item === 'upcoming' ? 'Upcoming' : 'Past'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className="px-3 py-2 rounded-full border border-slate-800 text-slate-400 hover:text-white"
                onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              >
                Sort: {sortDir === 'asc' ? 'Date ↑' : 'Date ↓'}
              </button>
            </div>
          </div>
          {eventsLoading ? (
            <div className="text-sm text-slate-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-sm text-slate-500">No events yet. Create your first event.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pagedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-blue-500/40 transition-colors"
                >
                  <Link href={`/${params.org}/${event.id}`}>
                    <div className="text-lg font-bold mb-1">{event.name ?? event.id}</div>
                    <div className="text-sm text-slate-400">
                      {event.date ? `Date: ${event.date}` : 'Date: TBD'}
                      {event.time ? ` · Time: ${event.time}` : ' · Time: TBD'}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{event.location ?? 'Location: TBD'}</div>
                  </Link>
                  <div className="flex items-center gap-3 mt-4 text-sm">
                    <Link className="text-blue-400 hover:text-blue-300" href={`/${params.org}/${event.id}`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredEvents.length > 0 ? (
            <div className="flex items-center justify-between mt-6 text-sm text-slate-400">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-full border border-slate-800 disabled:opacity-40"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-full border border-slate-800 disabled:opacity-40"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
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

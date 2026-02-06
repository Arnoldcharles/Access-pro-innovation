'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type EventData = {
  name?: string;
  date?: string;
  time?: string;
  location?: string;
  gatesOpen?: string;
  peakStart?: string;
  peakEnd?: string;
  avgScanSeconds?: number;
  status?: string;
};

type Guest = {
  id?: string;
  name: string;
  phone: string;
  email: string;
};

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string }>();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [orgName, setOrgName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [gatesOpen, setGatesOpen] = useState('');
  const [peakStart, setPeakStart] = useState('');
  const [peakEnd, setPeakEnd] = useState('');
  const [avgScanSeconds, setAvgScanSeconds] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestError, setGuestError] = useState('');
  const [guestSaving, setGuestSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

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
      const data = eventSnap.data() as EventData;
      setEventData(data);
      setName(data.name ?? '');
      setDate(data.date ?? '');
      setTime(data.time ?? '');
      setLocation(data.location ?? '');
      setGatesOpen(data.gatesOpen ?? '');
      setPeakStart(data.peakStart ?? '');
      setPeakEnd(data.peakEnd ?? '');
      setAvgScanSeconds(data.avgScanSeconds ? String(data.avgScanSeconds) : '');
      const guestsRef = collection(db, 'orgs', orgSlug, 'events', eventSlug, 'guests');
      const unsubGuests = onSnapshot(guestsRef, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as object),
        })) as Guest[];
        setGuests(items);
      });

      setLoading(false);
      return () => unsubGuests();
    });
    return () => unsub();
  }, [params, router]);

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const combinedGuests = useMemo(() => [...guests, ...pendingGuests], [guests, pendingGuests]);

  const handleAddGuest = () => {
    setGuestError('');
    if (!guestName.trim() || !guestEmail.trim()) {
      setGuestError('Name and email are required.');
      return;
    }
    setPendingGuests((prev) => [
      ...prev,
      { name: guestName.trim(), phone: guestPhone.trim(), email: guestEmail.trim() },
    ]);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
  };

  const parseCsv = (text: string): Guest[] => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('name') || header.includes('email') || header.includes('phone');
    const startIndex = hasHeader ? 1 : 0;
    return lines.slice(startIndex).map((line) => {
      const [name = '', phone = '', email = ''] = line.split(',').map((value) => value.trim());
      return { name, phone, email };
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuestError('');
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      setGuestError('PDF import is not supported yet. Please upload a CSV file.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setGuestError('Please upload a CSV file.');
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text).filter((guest) => guest.name || guest.email || guest.phone);
    if (parsed.length === 0) {
      setGuestError('No guests found in the CSV.');
      return;
    }
    setPendingGuests((prev) => [...prev, ...parsed]);
  };

  const handleSaveGuests = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (pendingGuests.length === 0) return;
    setGuestSaving(true);
    setGuestError('');
    try {
      const batch = writeBatch(db);
      const guestsRef = collection(db, 'orgs', orgSlug, 'events', eventSlug, 'guests');
      pendingGuests.forEach((guest) => {
        const guestDoc = doc(guestsRef);
        batch.set(guestDoc, {
          name: guest.name,
          phone: guest.phone,
          email: guest.email,
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      setPendingGuests([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save guests';
      setGuestError(message);
    } finally {
      setGuestSaving(false);
    }
  };

  const startEdit = (guest: Guest) => {
    if (!guest.id) return;
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditPhone(guest.phone);
    setEditEmail(guest.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPhone('');
    setEditEmail('');
  };

  const handleSaveEdit = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug || !editingId) return;
    setGuestError('');
    if (!editName.trim() || !editEmail.trim()) {
      setGuestError('Name and email are required.');
      return;
    }
    try {
      await updateDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug, 'guests', editingId), {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      });
      cancelEdit();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update guest';
      setGuestError(message);
    }
  };

  const handleDeleteGuest = async (guest: Guest, index?: number) => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (guest.id && orgSlug && eventSlug) {
      const confirmed = window.confirm('Delete this guest?');
      if (!confirmed) return;
      await deleteDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug, 'guests', guest.id));
      return;
    }
    if (typeof index === 'number') {
      setPendingGuests((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug), {
        name,
        date,
        time,
        location,
        gatesOpen,
        peakStart,
        peakEnd,
        avgScanSeconds: avgScanSeconds ? Number(avgScanSeconds) : 0,
      });
      setEventData((prev) => ({ ...(prev ?? {}), name, date, time, location, gatesOpen, peakStart, peakEnd, avgScanSeconds: avgScanSeconds ? Number(avgScanSeconds) : 0 }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update event';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    const confirmed = window.confirm('Delete this event? This cannot be undone.');
    if (!confirmed) return;
    await deleteDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug));
    router.replace(`/${orgSlug}`);
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
            {eventData?.time ? ` - Time: ${eventData.time}` : ' - Time: TBD'} -{' '}
            {eventData?.location ?? 'Location: TBD'}
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-500">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              Gates open: {eventData?.gatesOpen || '0'}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              Peak window: {eventData?.peakStart || '0'} - {eventData?.peakEnd || '0'}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              Avg scan: {eventData?.avgScanSeconds ? `${eventData.avgScanSeconds} sec` : '0'}
            </div>
          </div>
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

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Edit event details</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Event name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <input
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <input
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Gates open"
                  type="time"
                  value={gatesOpen}
                  onChange={(event) => setGatesOpen(event.target.value)}
                />
                <input
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Peak start"
                  type="time"
                  value={peakStart}
                  onChange={(event) => setPeakStart(event.target.value)}
                />
                <input
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Peak end"
                  type="time"
                  value={peakEnd}
                  onChange={(event) => setPeakEnd(event.target.value)}
                />
              </div>
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Avg scan seconds"
                type="number"
                min="0"
                value={avgScanSeconds}
                onChange={(event) => setAvgScanSeconds(event.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" className="text-red-400 hover:text-red-300 text-sm" onClick={handleDelete}>
                  Delete event
                </button>
              </div>
              {error ? <div className="text-sm text-red-400">{error}</div> : null}
            </form>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Quick actions</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <div>Import guest list</div>
              <div>Assign staff</div>
              <div>Generate QR passes</div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Guest list</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Name"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Phone number"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
              <input
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                placeholder="Email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-sm"
                onClick={handleAddGuest}
              >
                Add guest
              </button>
              <label className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-sm cursor-pointer">
                Import CSV or PDF
                <input type="file" accept=".csv,.pdf" className="hidden" onChange={handleImportFile} />
              </label>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm"
                disabled={guestSaving || pendingGuests.length === 0}
                onClick={handleSaveGuests}
              >
                {guestSaving ? 'Saving...' : `Save ${pendingGuests.length} guest${pendingGuests.length === 1 ? '' : 's'}`}
              </button>
            </div>
            {guestError ? <div className="text-sm text-red-400 mb-4">{guestError}</div> : null}
            <div className="space-y-2">
              {combinedGuests.length === 0 ? (
                <div className="text-sm text-slate-500">No guests added yet.</div>
              ) : (
                combinedGuests.map((guest, index) => {
                  const isPending = !guest.id;
                  const isEditing = editingId === guest.id;
                  return (
                    <div
                      key={`${guest.email}-${index}`}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <input
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-sm"
                              value={editName}
                              onChange={(event) => setEditName(event.target.value)}
                            />
                            <input
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-sm"
                              value={editPhone}
                              onChange={(event) => setEditPhone(event.target.value)}
                            />
                            <input
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-sm"
                              value={editEmail}
                              onChange={(event) => setEditEmail(event.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <button type="button" className="text-blue-400 hover:text-blue-300" onClick={handleSaveEdit}>
                              Save
                            </button>
                            <button type="button" className="text-slate-400 hover:text-white" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-3 gap-3 text-sm items-center">
                          <div>{guest.name || 'Unnamed'}</div>
                          <div className="text-slate-400">{guest.phone || 'No phone'}</div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400">{guest.email || 'No email'}</span>
                            <div className="flex items-center gap-3 text-sm">
                              {!isPending ? (
                                <button
                                  type="button"
                                  className="text-blue-400 hover:text-blue-300"
                                  onClick={() => startEdit(guest)}
                                >
                                  Edit
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteGuest(guest, index)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Import tips</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <div>CSV columns supported: name, phone, email</div>
              <div>Header row is optional.</div>
              <div>PDF import is not available yet.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

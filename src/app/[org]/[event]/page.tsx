'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion, cubicBezier } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type EventData = {
  name?: string;
  date?: string;
  time?: string;
  location?: string;
  gatesOpenAt?: string;
  scanTotalMs?: number;
  scanCount?: number;
  imageDataUrl?: string;
  qrX?: number;
  qrY?: number;
  qrSize?: number;
  nameX?: number;
  nameY?: number;
  nameColor?: string;
  nameSize?: number;
  nameFont?: string;
  nameBg?: boolean;
  status?: string;
};

type Guest = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone: string;
  email: string;
  status?: 'invited' | 'accepted' | 'declined';
  checkedIn?: boolean;
  checkedInAt?: string;
  checkInCount?: number;
};

type InviteTarget = {
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
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestError, setGuestError] = useState('');
  const [guestSaving, setGuestSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<'single' | 'all'>('single');
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardGuest, setCardGuest] = useState<Guest | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [uid, setUid] = useState('');
  const isFree = uid !== 'krpJL2xq7Rf1NUumK3G6nzpZWsM2';
  const maxGuests = 500;
  const maxScans = isFree ? 5 : Number.MAX_SAFE_INTEGER;
  const maxScansLabel = isFree ? String(maxScans) : '∞';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }
      setUid(user.uid);
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
      if (!data.gatesOpenAt) {
        await updateDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug), { gatesOpenAt: new Date().toISOString() });
      }
      const guestsRef = collection(db, 'orgs', orgSlug, 'events', eventSlug, 'guests');
      const unsubGuests = onSnapshot(
        guestsRef,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as object),
          })) as Guest[];
          setGuests(items);
        },
        (err) => {
          const code = (err as { code?: string }).code;
          if (code === 'permission-denied') return;
          console.error(err);
        }
      );

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
  const totalGuestCount = guests.length + pendingGuests.length;

  const handleAddGuest = () => {
    setGuestError('');
    if (isFree && totalGuestCount >= maxGuests) {
      setUpgradeOpen(true);
      return;
    }
    if (!guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim()) {
      setGuestError('First name, last name, and phone number are required.');
      return;
    }
    const fullName = `${guestFirstName.trim()} ${guestLastName.trim()}`.trim();
    setPendingGuests((prev) => [
      ...prev,
      {
        firstName: guestFirstName.trim(),
        lastName: guestLastName.trim(),
        name: fullName,
        phone: guestPhone.trim(),
        email: guestEmail.trim(),
        status: 'invited',
        checkedIn: false,
        checkInCount: 0,
      },
    ]);
    setGuestFirstName('');
    setGuestLastName('');
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
      const [firstName = '', lastName = '', phone = '', email = ''] = line.split(',').map((value) => value.trim());
      const name = `${firstName} ${lastName}`.trim();
      return { firstName, lastName, name, phone, email, status: 'invited', checkedIn: false, checkInCount: 0 };
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
    if (isFree) {
      const remaining = Math.max(0, maxGuests - totalGuestCount);
      if (remaining <= 0) {
        setUpgradeOpen(true);
        return;
      }
      const sliced = parsed.slice(0, remaining);
      if (sliced.length < parsed.length) {
        setGuestError('Guest list truncated to fit free mode limit (500).');
      }
      setPendingGuests((prev) => [...prev, ...sliced]);
      return;
    }
    setPendingGuests((prev) => [...prev, ...parsed]);
  };

  const handleSaveGuests = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (pendingGuests.length === 0) return;
    if (isFree && totalGuestCount > maxGuests) {
      setUpgradeOpen(true);
      return;
    }
    setGuestSaving(true);
    setGuestError('');
    try {
      const batch = writeBatch(db);
      const guestsRef = collection(db, 'orgs', orgSlug, 'events', eventSlug, 'guests');
      pendingGuests.forEach((guest) => {
        const guestDoc = doc(guestsRef);
        batch.set(guestDoc, {
          firstName: guest.firstName ?? '',
          lastName: guest.lastName ?? '',
          name: guest.name,
          phone: guest.phone,
          email: guest.email,
          status: guest.status ?? 'invited',
          checkedIn: guest.checkedIn ?? false,
          checkInCount: guest.checkInCount ?? 0,
          createdAt: new Date().toISOString(),
        });
      });
      batch.set(doc(db, 'orgs', orgSlug, 'events', eventSlug), { guestCount: increment(pendingGuests.length) }, { merge: true });
      await batch.commit();
      setPendingGuests([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save guests';
      setGuestError(message);
    } finally {
      setGuestSaving(false);
    }
  };

  const buildInviteMessage = (name: string) =>
    `Hi ${name}, you are invited to ${eventData?.name ?? 'our event'} on ${eventData?.date ?? 'TBD'} at ${
      eventData?.location ?? 'TBD'
    }.`;

  const openInviteModal = (mode: 'single' | 'all', target?: InviteTarget) => {
    setInviteMode(mode);
    setInviteTarget(target ?? null);
    setInviteMessage(buildInviteMessage(target?.name ?? 'there'));
    setInviteLink('');
    setInviteStatus('');
    setInviteOpen(true);
  };

  const openGuestCard = (guest: Guest) => {
    setCardGuest(guest);
    setCardOpen(true);
    setMenuOpenId(null);
  };

  const closeInviteModal = () => {
    setInviteOpen(false);
  };

  const createToken = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const sendWhatsAppPlaceholder = async (phone: string, message: string, link: string) => {
    // Placeholder only. Replace with WhatsApp Business API/Twilio integration.
    console.log('Send WhatsApp to', phone, message, link);
  };

  const handleSendInvites = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (inviteMode === 'single' && !inviteTarget) return;
    setInviteLoading(true);
    setInviteStatus('');
    try {
      const batch = writeBatch(db);
      const invitesRef = collection(db, 'orgs', orgSlug, 'events', eventSlug, 'invites');

      if (inviteMode === 'single' && inviteTarget) {
        const token = createToken();
        const link = `/${orgSlug}/${eventSlug}/invite/${token}`;
        batch.set(doc(invitesRef, token), {
          token,
          guestName: inviteTarget.name,
          guestPhone: inviteTarget.phone,
          guestEmail: inviteTarget.email,
          eventName: eventData?.name ?? '',
          eventDate: eventData?.date ?? '',
          eventLocation: eventData?.location ?? '',
          message: inviteMessage,
          imageDataUrl: eventData?.imageDataUrl ?? '',
          qrX: eventData?.qrX ?? 0.1,
          qrY: eventData?.qrY ?? 0.1,
          qrSize: eventData?.qrSize ?? 96,
          nameX: eventData?.nameX ?? 0.1,
          nameY: eventData?.nameY ?? 0.3,
          nameColor: eventData?.nameColor ?? '#111827',
          nameSize: eventData?.nameSize ?? 16,
          nameFont: eventData?.nameFont ?? 'Arial, sans-serif',
          used: false,
          createdAt: serverTimestamp(),
        });
        await batch.commit();
        setInviteLink(link);
        await sendWhatsAppPlaceholder(inviteTarget.phone, inviteMessage, link);
        setInviteStatus('Invite created and queued for WhatsApp (placeholder).');
      }

      if (inviteMode === 'all') {
        if (guests.length === 0) {
          setInviteStatus('No saved guests to invite. Save guests first.');
          setInviteLoading(false);
          return;
        }
        guests.forEach((guest) => {
          const token = createToken();
          const link = `/${orgSlug}/${eventSlug}/invite/${token}`;
          batch.set(doc(invitesRef, token), {
            token,
            guestName: guest.name,
            guestPhone: guest.phone,
            guestEmail: guest.email,
            eventName: eventData?.name ?? '',
            eventDate: eventData?.date ?? '',
            eventLocation: eventData?.location ?? '',
            message: buildInviteMessage(guest.name),
            imageDataUrl: eventData?.imageDataUrl ?? '',
            qrX: eventData?.qrX ?? 0.1,
            qrY: eventData?.qrY ?? 0.1,
            qrSize: eventData?.qrSize ?? 96,
            nameX: eventData?.nameX ?? 0.1,
            nameY: eventData?.nameY ?? 0.3,
            nameColor: eventData?.nameColor ?? '#111827',
            nameSize: eventData?.nameSize ?? 16,
            nameFont: eventData?.nameFont ?? 'Arial, sans-serif',
            used: false,
            createdAt: serverTimestamp(),
          });
        });
        await batch.commit();
        setInviteStatus(`Invites created for ${guests.length} guests (placeholder WhatsApp send).`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create invites';
      setInviteStatus(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const startEdit = (guest: Guest) => {
    if (!guest.id) return;
    setEditingId(guest.id);
    const fallbackName = guest.name ?? '';
    setEditFirstName(guest.firstName ?? fallbackName.split(' ')[0] ?? '');
    setEditLastName(guest.lastName ?? fallbackName.split(' ').slice(1).join(' ') ?? '');
    setEditPhone(guest.phone);
    setEditEmail(guest.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFirstName('');
    setEditLastName('');
    setEditPhone('');
    setEditEmail('');
  };

  const handleSaveEdit = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug || !editingId) return;
    setGuestError('');
    if (!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()) {
      setGuestError('First name, last name, and phone number are required.');
      return;
    }
    try {
      const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
      await updateDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug, 'guests', editingId), {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: fullName,
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
      const batch = writeBatch(db);
      batch.delete(doc(db, 'orgs', orgSlug, 'events', eventSlug, 'guests', guest.id));
      batch.set(doc(db, 'orgs', orgSlug, 'events', eventSlug), { guestCount: increment(-1) }, { merge: true });
      await batch.commit();
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
      });
      setEventData((prev) => ({ ...(prev ?? {}), name, date, time, location }));
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
    const batch = writeBatch(db);
    batch.delete(doc(db, 'orgs', orgSlug, 'events', eventSlug));
    batch.set(doc(db, 'orgs', orgSlug), { eventCount: increment(-1) }, { merge: true });
    await batch.commit();
    router.replace(`/${orgSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
          Loading event...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="text-sm text-slate-600 hover:text-slate-900" href={`/${params.org}`}>
            Back to {orgName || 'dashboard'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-3">{eventData?.name ?? 'Event'}</h1>
          <p className="text-slate-600 mb-8">
            {eventData?.date ? `Date: ${eventData.date}` : 'Date: TBD'}
            {eventData?.time ? ` - Time: ${eventData.time}` : ' - Time: TBD'} -{' '}
            {eventData?.location ?? 'Location: TBD'}
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-500">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Gates open:{' '}
              {eventData?.gatesOpenAt
                ? new Date(eventData.gatesOpenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : '0'}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Peak window:{' '}
              {(() => {
                const checked = guests.filter((g) => g.checkedInAt);
                if (checked.length === 0) return '0';
                const counts: Record<number, number> = {};
                checked.forEach((g) => {
                  const d = new Date(g.checkedInAt as string);
                  const hour = d.getHours();
                  counts[hour] = (counts[hour] ?? 0) + 1;
                });
                const top = Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
                if (!top) return '0';
                const hour = Number(top[0]);
                const start = new Date();
                start.setHours(hour, 0, 0, 0);
                const end = new Date();
                end.setHours(hour + 1, 0, 0, 0);
                const fmt = (value: Date) => value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                return `${fmt(start)} - ${fmt(end)}`;
              })()}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Avg scan:{' '}
              {eventData?.scanCount
                ? `${Math.round((eventData.scanTotalMs ?? 0) / eventData.scanCount)} ms`
                : '0'}
            </div>
          </div>
          <div className="mt-4">
            <Link
              className="inline-flex items-center px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold"
              href={`/${params.org}/${params.event}/design`}
            >
              Design invite
            </Link>
            <Link
              className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold ml-3 ${
                isFree ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white'
              }`}
              href={`/${params.org}/${params.event}/scan`}
              onClick={(event) => {
                if (isFree) {
                  event.preventDefault();
                  setUpgradeOpen(true);
                }
              }}
            >
              {isFree ? 'QR scanning disabled' : 'Open scanner'}
            </Link>
          </div>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Registrations', value: '0', note: 'Import guest list to begin' },
            { label: 'Checked-in', value: '0', note: 'Check-in opens on event day' },
            { label: 'Staff assigned', value: '0', note: 'Assign your team' },
          ].map((card) => (
            <div key={card.label} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-xs uppercase tracking-widest text-slate-500">{card.label}</div>
              <div className="text-3xl font-black mt-2">{card.value}</div>
              <div className="text-sm text-slate-500 mt-2">{card.note}</div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Edit event details</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Event name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
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
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Quick actions</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>Import guest list</div>
              <div>Assign staff</div>
              <div>Generate QR passes</div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Guest list</h2>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="First name"
                value={guestFirstName}
                onChange={(event) => setGuestFirstName(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Last name"
                value={guestLastName}
                onChange={(event) => setGuestLastName(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Phone number"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm"
                onClick={handleAddGuest}
              >
                Add guest
              </button>
              <label className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm cursor-pointer">
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
              {isFree ? (
                <div className="text-xs text-slate-500">
                  Free mode: {totalGuestCount}/{maxGuests} guests
                </div>
              ) : null}
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-sm"
                onClick={() => openInviteModal('all')}
              >
                Invite all via WhatsApp
              </button>
            </div>
            {guestError ? <div className="text-sm text-red-500 mb-4">{guestError}</div> : null}
            <div className="space-y-2">
              {combinedGuests.length === 0 ? (
                <div className="text-sm text-slate-500">No guests added yet.</div>
              ) : (
                <>
                  <div className="hidden sm:grid sm:grid-cols-4 gap-3 text-xs uppercase tracking-widest text-slate-500 px-2">
                    <div>First / Last</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Status</div>
                  </div>
                  {combinedGuests.map((guest, index) => {
                  const isPending = !guest.id;
                  const isEditing = editingId === guest.id;
                  return (
                    <div key={`${guest.email}-${index}`} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid sm:grid-cols-4 gap-3">
                            <input
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                              value={editFirstName}
                              onChange={(event) => setEditFirstName(event.target.value)}
                            />
                            <input
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                              value={editLastName}
                              onChange={(event) => setEditLastName(event.target.value)}
                            />
                            <input
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                              value={editPhone}
                              onChange={(event) => setEditPhone(event.target.value)}
                            />
                            <input
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
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
                        <div className="grid sm:grid-cols-4 gap-3 text-sm items-center">
                          <div>
                            {(guest.firstName || guest.lastName)
                              ? `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim()
                              : guest.name || 'Unnamed'}
                          </div>
                          <div className="text-slate-400">{guest.phone || 'No phone'}</div>
                          <div className="text-slate-400">{guest.email || 'No email'}</div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">
                              {guest.status ?? 'invited'}{' '}
                              {guest.checkedIn ? `· Checked-in (${guest.checkInCount ?? 0}/${maxScansLabel})` : ''}
                            </div>
                            <div className="relative">
                              <button
                                type="button"
                                className="px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900"
                                onClick={() => setMenuOpenId((prev) => (prev === guest.id ? null : guest.id ?? null))}
                              >
                                ⋮
                              </button>
                              {menuOpenId === guest.id ? (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg text-sm z-10">
                                  {!isPending ? (
                                    <button
                                      type="button"
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                      onClick={() =>
                                        openInviteModal('single', {
                                          name: guest.name,
                                          phone: guest.phone,
                                          email: guest.email,
                                        })
                                      }
                                    >
                                      Invite guest
                                    </button>
                                  ) : null}
                                  {!isPending ? (
                                    <button
                                      type="button"
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                      onClick={() => openGuestCard(guest)}
                                    >
                                      View guest image card
                                    </button>
                                  ) : null}
                                  {!isPending ? (
                                    <button
                                      type="button"
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                      onClick={() => startEdit(guest)}
                                    >
                                      Edit guest
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-500"
                                    onClick={() => handleDeleteGuest(guest, index)}
                                  >
                                    Delete guest
                                  </button>
                                  <div className="px-4 py-2 text-xs text-slate-400">More options coming soon</div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </>
              )}
            </div>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Import tips</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>CSV columns supported: firstName, lastName, phone, email</div>
              <div>Header row is optional.</div>
              <div>PDF import is not available yet.</div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {inviteOpen ? (
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
                onClick={closeInviteModal}
              />
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: easeOut } }}
                exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } }}
                className="relative z-10 w-full max-w-[680px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">
                      {inviteMode === 'single' ? 'Invite guest via WhatsApp' : 'Invite all guests via WhatsApp'}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {inviteMode === 'single'
                        ? `Sending to ${inviteTarget?.name ?? ''} (${inviteTarget?.phone ?? ''})`
                        : `Sending to ${guests.length} saved guests`}
                    </p>
                  </div>
                  <button type="button" className="text-sm text-slate-500 hover:text-slate-900" onClick={closeInviteModal}>
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500">Message</label>
                    <textarea
                      className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[120px]"
                      value={inviteMessage}
                      onChange={(event) => setInviteMessage(event.target.value)}
                    />
                  </div>
                  {inviteMode === 'single' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="text-xs text-slate-500 mb-2">Invite link</div>
                      <div className="text-sm text-blue-400">{inviteLink || 'Link will appear after send.'}</div>
                      <div className="mt-4">
                        <div className="text-xs text-slate-500 mb-2">Preview image</div>
                        <div className="relative w-full h-48 rounded-xl border border-slate-200 overflow-hidden bg-white">
                          {eventData?.imageDataUrl ? (
                            <img
                              src={eventData.imageDataUrl}
                              alt="Invite preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 bg-slate-50">
                              No design image yet
                            </div>
                          )}
                          {!isFree ? (
                            <div
                              className="absolute"
                              style={{
                                left: `${(eventData?.qrX ?? 0.1) * 100}%`,
                                top: `${(eventData?.qrY ?? 0.1) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                width: eventData?.qrSize ?? 96,
                                height: eventData?.qrSize ?? 96,
                              }}
                            >
                              <img
                                alt="QR code"
                                className="w-full h-full object-cover rounded-xl border border-slate-200 bg-white"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                  `${inviteTarget?.name ?? ''}|${params.org}/${params.event}`
                                )}`}
                                onError={(event) => {
                                  (event.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="absolute left-4 top-4 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1">
                              QR disabled in free mode
                            </div>
                          )}
                          <div
                            className={`absolute px-3 py-2 rounded-xl border border-slate-200 shadow text-sm font-semibold ${
                              eventData?.nameBg === false ? 'bg-transparent border-transparent shadow-none' : 'bg-white/90'
                            }`}
                            style={{
                              left: `${(eventData?.nameX ?? 0.1) * 100}%`,
                              top: `${(eventData?.nameY ?? 0.3) * 100}%`,
                              transform: 'translate(-50%, -50%)',
                              color: eventData?.nameColor ?? '#111827',
                              fontSize: `${eventData?.nameSize ?? 16}px`,
                              fontFamily: eventData?.nameFont ?? 'Arial, sans-serif',
                            }}
                          >
                            {inviteTarget?.name ?? 'Guest'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {inviteStatus ? <div className="text-sm text-slate-400">{inviteStatus}</div> : null}
                  <button
                    type="button"
                    className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold"
                    onClick={handleSendInvites}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? 'Sending...' : 'Send WhatsApp invite'}
                  </button>
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {cardOpen && cardGuest ? (
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
                onClick={() => setCardOpen(false)}
              />
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: easeOut } }}
                exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } }}
                className="relative z-10 w-full max-w-[520px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Guest image card</h2>
                    <p className="text-sm text-slate-600">
                      {cardGuest.name} - {eventData?.name ?? ''}
                    </p>
                  </div>
                  <button type="button" className="text-sm text-slate-500 hover:text-slate-900" onClick={() => setCardOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="relative w-full h-64 bg-slate-50">
                    {eventData?.imageDataUrl ? (
                      <img src={eventData.imageDataUrl} alt="Guest card" className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    {!isFree ? (
                      <div
                        className="absolute"
                        style={{
                          left: `${(eventData?.qrX ?? 0.1) * 100}%`,
                          top: `${(eventData?.qrY ?? 0.1) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          width: eventData?.qrSize ?? 96,
                          height: eventData?.qrSize ?? 96,
                        }}
                      >
                        <img
                          alt="QR code"
                          className="w-full h-full object-cover rounded-xl border border-slate-200 bg-white"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                            `${cardGuest.name}|${params.org}/${params.event}`
                          )}`}
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute left-4 top-4 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1">
                        QR disabled in free mode
                      </div>
                    )}
                    <div
                      className={`absolute px-3 py-2 rounded-xl border border-slate-200 shadow text-sm font-semibold ${
                        eventData?.nameBg === false ? 'bg-transparent border-transparent shadow-none' : 'bg-white/90'
                      }`}
                      style={{
                        left: `${(eventData?.nameX ?? 0.1) * 100}%`,
                        top: `${(eventData?.nameY ?? 0.3) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        color: eventData?.nameColor ?? '#111827',
                        fontSize: `${eventData?.nameSize ?? 16}px`,
                        fontFamily: eventData?.nameFont ?? 'Arial, sans-serif',
                      }}
                    >
                      {cardGuest.name}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <div className="font-semibold">{cardGuest.name}</div>
                  <div>{cardGuest.email}</div>
                  <div>{cardGuest.phone}</div>
                </div>
              </motion.section>
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
                  QR scanning is disabled in free mode. Upgrade to unlock QR check-in and smart invitations.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                    onClick={() => setUpgradeOpen(false)}
                  >
                    Not now
                  </button>
                  <Link
                    className="px-4 py-2 rounded-2xl bg-blue-600 text-white"
                    href={`/${params.org}/pricing`}
                  >
                    View pricing
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type DesignData = {
  imageDataUrl?: string;
  qrX?: number;
  qrY?: number;
  nameX?: number;
  nameY?: number;
  nameColor?: string;
};

export default function EventDesignPage() {
  const params = useParams<{ org: string; event: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [qrPos, setQrPos] = useState({ x: 0.1, y: 0.1 });
  const [namePos, setNamePos] = useState({ x: 0.1, y: 0.3 });
  const [nameColor, setNameColor] = useState('#111827');
  const [dragging, setDragging] = useState<'qr' | 'name' | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const orgSlug = params?.org;
      const eventSlug = params?.event;
      if (!orgSlug || !eventSlug) return;
      const snap = await getDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug));
      if (snap.exists()) {
        const data = snap.data() as DesignData & { name?: string; date?: string; location?: string };
        setEventName(data.name ?? '');
        setEventDate(data.date ?? '');
        setEventLocation(data.location ?? '');
        if (data.imageDataUrl) setImageDataUrl(data.imageDataUrl);
        if (typeof data.qrX === 'number' && typeof data.qrY === 'number') setQrPos({ x: data.qrX, y: data.qrY });
        if (typeof data.nameX === 'number' && typeof data.nameY === 'number') setNamePos({ x: data.nameX, y: data.nameY });
        if (data.nameColor) setNameColor(data.nameColor);
      }
      setLoading(false);
    };
    load();
  }, [params]);

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toPercent = (value: number, max: number) => Math.min(0.95, Math.max(0.02, value / max));

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = toPercent(event.clientX - rect.left, rect.width);
    const y = toPercent(event.clientY - rect.top, rect.height);
    if (dragging === 'qr') setQrPos({ x, y });
    if (dragging === 'name') setNamePos({ x, y });
  };

  const handleSave = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    setSaving(true);
    await updateDoc(doc(db, 'orgs', orgSlug, 'events', eventSlug), {
      imageDataUrl,
      qrX: qrPos.x,
      qrY: qrPos.y,
      nameX: namePos.x,
      nameY: namePos.y,
      nameColor,
    });
    setSaving(false);
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        Loading design...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { ease: easeOut } }}>
          <Link className="text-sm text-slate-600 hover:text-slate-900" href={`/${params.org}/${params.event}`}>
            Back to event
          </Link>
          <h1 className="text-3xl font-black mt-4">Design invite</h1>
          <p className="text-slate-600 mt-2">
            Upload an image, then drag the QR code and name into position.
          </p>
        </motion.div>

        <div className="mt-8 grid lg:grid-cols-[1.2fr,0.8fr] gap-8">
          <div
            className="border border-slate-200 rounded-3xl p-4 bg-white shadow-sm"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            <div
              ref={containerRef}
              className="relative w-full aspect-[3/2] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden"
            >
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Event design" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                  Upload an image to start
                </div>
              )}
              <div
                className="absolute w-24 h-24 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center cursor-grab"
                style={{ left: `${qrPos.x * 100}%`, top: `${qrPos.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                onPointerDown={() => setDragging('qr')}
              >
                <img
                  alt="QR code"
                  className="w-full h-full object-cover rounded-xl"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    `Guest Name|${params.org}/${params.event}`
                  )}`}
                />
              </div>
              <div
                className="absolute px-3 py-2 rounded-xl bg-white/90 border border-slate-200 shadow cursor-grab text-sm font-semibold"
                style={{
                  left: `${namePos.x * 100}%`,
                  top: `${namePos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  color: nameColor,
                }}
                onPointerDown={() => setDragging('name')}
              >
                Guest Name
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">Event image</label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                onChange={handleImage}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">Name color</label>
              <input
                type="color"
                className="mt-2 w-20 h-10 border border-slate-200 rounded"
                value={nameColor}
                onChange={(event) => setNameColor(event.target.value)}
              />
            </div>
            <div className="text-sm text-slate-600">
              Event: {eventName} - {eventDate} - {eventLocation}
            </div>
            <button
              type="button"
              className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save design'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

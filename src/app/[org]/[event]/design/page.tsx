"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type DesignData = {
  imageDataUrl?: string;
  qrX?: number;
  qrY?: number;
  qrSize?: number;
  nameX?: number;
  nameY?: number;
  nameColor?: string;
  nameSize?: number;
  nameFont?: string;
};

export default function EventDesignPage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [qrPos, setQrPos] = useState({ x: 0.1, y: 0.1 });
  const [namePos, setNamePos] = useState({ x: 0.1, y: 0.3 });
  const [nameColor, setNameColor] = useState("#111827");
  const [nameSize, setNameSize] = useState(16);
  const [nameFont, setNameFont] = useState("Arial, sans-serif");
  const [nameBg, setNameBg] = useState(true);
  const [dragging, setDragging] = useState<"qr" | "name" | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [imageAspect, setImageAspect] = useState(3 / 2);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const orgSlug = params?.org;
      const eventSlug = params?.event;
      if (!orgSlug || !eventSlug) return;
      const snap = await getDoc(doc(db, "orgs", orgSlug, "events", eventSlug));
      if (snap.exists()) {
        const data = snap.data() as DesignData & {
          name?: string;
          date?: string;
          location?: string;
        };
        setEventName(data.name ?? "");
        setEventDate(data.date ?? "");
        setEventLocation(data.location ?? "");
        if (data.imageDataUrl) setImageDataUrl(data.imageDataUrl);
        if (typeof data.qrX === "number" && typeof data.qrY === "number")
          setQrPos({ x: data.qrX, y: data.qrY });
        if (typeof data.nameX === "number" && typeof data.nameY === "number")
          setNamePos({ x: data.nameX, y: data.nameY });
        if (data.nameColor) setNameColor(data.nameColor);
        if (typeof data.nameSize === "number") setNameSize(data.nameSize);
        if (data.nameFont) setNameFont(data.nameFont);
        if (
          typeof (data as DesignData & { nameBg?: boolean }).nameBg ===
          "boolean"
        ) {
          setNameBg(
            (data as DesignData & { nameBg?: boolean }).nameBg as boolean,
          );
        }
      }
      setLoading(false);
    };
    load();
  }, [params]);

  const toPercent = (value: number, max: number) =>
    Math.min(0.95, Math.max(0.02, value / max));

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = toPercent(event.clientX - rect.left, rect.width);
    const y = toPercent(event.clientY - rect.top, rect.height);
    if (dragging === "qr") setQrPos({ x, y });
    if (dragging === "name") setNamePos({ x, y });
  };

  const handleSave = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateDoc(doc(db, "orgs", orgSlug, "events", eventSlug), {
        imageDataUrl,
        qrX: qrPos.x,
        qrY: qrPos.y,
        nameX: namePos.x,
        nameY: namePos.y,
        nameColor,
        nameSize,
        nameFont,
        nameBg,
      });
      setTransitioning(true);
      setTimeout(() => {
        router.replace(`/${orgSlug}/${eventSlug}`);
      }, 500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save design";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          Loading design...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { ease: easeOut } }}
        >
          <Link
            className="text-sm text-slate-600 hover:text-slate-900"
            href={`/${params.org}/${params.event}`}
          >
            Back to event
          </Link>
          <h1 className="text-3xl font-black mt-4">Design invite</h1>
          <p className="text-slate-600 mt-2">
            Upload an image, then drag the QR code and name into position.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
          <div
            className="border border-slate-200 rounded-3xl p-4 bg-white shadow-sm w-full lg:flex-1"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            <div
              ref={containerRef}
              className="relative w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden"
              style={{ aspectRatio: imageAspect }}
            >
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="Event design"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                  Upload an image to start
                </div>
              )}
              <div
                className="absolute bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center cursor-grab"
                style={{
                  left: `${qrPos.x * 100}%`,
                  top: `${qrPos.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={() => setDragging("qr")}
              >
                <img
                  alt="QR code"
                  className="object-cover rounded-xl"
                  style={{ width: 96, height: 96 }}
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    `Guest Name|${params.org}/${params.event}`,
                  )}`}
                />
              </div>
              <div
                className={`absolute px-3 py-2 rounded-xl border border-slate-200 shadow cursor-grab text-sm font-semibold ${
                  nameBg
                    ? "bg-white/90"
                    : "bg-transparent border-transparent shadow-none"
                }`}
                style={{
                  left: `${namePos.x * 100}%`,
                  top: `${namePos.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  color: nameColor,
                  fontSize: `${nameSize}px`,
                  fontFamily: nameFont,
                }}
                onPointerDown={() => setDragging("name")}
              >
                Guest Name
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4 w-full lg:w-[360px]">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">
                Event image
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const img = new Image();
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      img.onload = () => {
                        if (img.width && img.height)
                          setImageAspect(img.width / img.height);
                        setImageDataUrl(reader.result as string);
                      };
                      img.src = reader.result as string;
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">
                Name color
              </label>
              <input
                type="color"
                className="mt-2 w-20 h-10 border border-slate-200 rounded"
                value={nameColor}
                onChange={(event) => setNameColor(event.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Name size
                </label>
                <input
                  type="range"
                  min="12"
                  max="40"
                  value={nameSize}
                  onChange={(event) => setNameSize(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">
                Font family
              </label>
              <select
                className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                value={nameFont}
                onChange={(event) => setNameFont(event.target.value)}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Georgia', serif">Georgia</option>
                <option value="'Times New Roman', serif">
                  Times New Roman
                </option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <input
                id="name-bg"
                type="checkbox"
                checked={nameBg}
                onChange={(event) => setNameBg(event.target.checked)}
              />
              <label htmlFor="name-bg">Show background behind name</label>
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
              {saving ? "Saving..." : "Save design"}
            </button>
            {saveError ? (
              <div className="text-sm text-red-500">{saveError}</div>
            ) : null}
          </div>
        </div>
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
              className="text-sm text-slate-600 flex items-center gap-2"
            >
              <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Saving design...
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

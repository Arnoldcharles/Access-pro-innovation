"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type ExpiryStamp = {
  toDate?: () => Date;
  toMillis?: () => number;
  seconds?: number;
};

type NoticeLevel = "7d" | "2d" | "24h";

const toMillis = (value?: ExpiryStamp | null) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return null;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function OrgPlanExpiryNotice() {
  const params = useParams<{ org: string }>();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<NoticeLevel | null>(null);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [seenKey, setSeenKey] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const orgSlug = params?.org;
      if (!user || !orgSlug) return;

      const orgSnap = await getDoc(doc(db, "orgs", orgSlug));
      if (!orgSnap.exists()) return;

      const orgData = orgSnap.data() as {
        plan?: "free" | "pro";
        proExpiresAt?: ExpiryStamp | null;
      };
      if (orgData.plan !== "pro") return;

      const expiryMs = toMillis(orgData.proExpiresAt);
      if (typeof expiryMs !== "number") return;

      const now = Date.now();
      const timeLeft = expiryMs - now;
      if (timeLeft <= 0) return;

      let nextLevel: NoticeLevel | null = null;
      if (timeLeft <= ONE_DAY_MS) nextLevel = "24h";
      else if (timeLeft <= 2 * ONE_DAY_MS) nextLevel = "2d";
      else if (timeLeft <= 7 * ONE_DAY_MS) nextLevel = "7d";
      if (!nextLevel) return;

      const storageKey = `ap:pro-expiry-notice:${user.uid}:${orgSlug}:${nextLevel}:${expiryMs}`;
      if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "1") {
        return;
      }

      setLevel(nextLevel);
      setExpiresAtMs(expiryMs);
      setSeenKey(storageKey);
      setOpen(true);
    });
    return () => unsub();
  }, [params?.org]);

  const message = useMemo(() => {
    if (level === "24h") return "Your Pro plan expires in less than 24 hours.";
    if (level === "2d") return "Your Pro plan expires in less than 2 days.";
    if (level === "7d") return "Your Pro plan expires in less than 7 days.";
    return "";
  }, [level]);

  const close = () => {
    if (typeof window !== "undefined" && seenKey) {
      window.localStorage.setItem(seenKey, "1");
    }
    setOpen(false);
  };

  if (!open || !level) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl animate-[fadeIn_0.25s_ease-out]">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Subscription expiring soon</h3>
        <p className="text-sm text-slate-700">{message}</p>
        {expiresAtMs ? (
          <p className="text-xs text-slate-500 mt-2">
            Expiry date: {new Date(expiresAtMs).toLocaleString()}
          </p>
        ) : null}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold"
            onClick={close}
          >
            OK
          </button>
          <Link
            href={`/${params.org}/pricing`}
            className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold"
            onClick={close}
          >
            Upgrade Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}


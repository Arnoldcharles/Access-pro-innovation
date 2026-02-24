"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type ExpiryStamp = {
  toDate?: () => Date;
  toMillis?: () => number;
  seconds?: number;
};

const toMillis = (value?: ExpiryStamp | null) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return null;
};

export default function OrgProWelcomeModal() {
  const params = useParams<{ org: string }>();
  const [open, setOpen] = useState(false);
  const [seenKey, setSeenKey] = useState("");
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  useEffect(() => {
    let unsubOrg: null | (() => void) = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const orgSlug = params?.org;
      if (!user || !orgSlug) return;

      unsubOrg = onSnapshot(doc(db, "orgs", orgSlug), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as {
          plan?: "free" | "pro";
          proExpiresAt?: ExpiryStamp | null;
        };
        if (data.plan !== "pro") return;

        const expiryMs = toMillis(data.proExpiresAt);
        const cycleId = typeof expiryMs === "number" ? String(expiryMs) : "active";
        const storageKey = `ap:pro-welcome:${user.uid}:${orgSlug}:${cycleId}`;
        if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "1") {
          return;
        }
        setSeenKey(storageKey);
        setExpiresAtMs(expiryMs);
        setOpen(true);
      });
    });

    return () => {
      unsubAuth();
      if (unsubOrg) unsubOrg();
    };
  }, [params?.org]);

  const close = () => {
    if (typeof window !== "undefined" && seenKey) {
      window.localStorage.setItem(seenKey, "1");
    }
    setOpen(false);
  };

  const expiryText = useMemo(() => {
    if (!expiresAtMs) return null;
    return new Date(expiresAtMs).toLocaleString();
  }, [expiresAtMs]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: easeOut } }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-3xl border border-blue-200 bg-white p-7 shadow-2xl"
          >
            <motion.div
              className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-cyan-300/40 blur-3xl"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-400/30 blur-3xl"
              animate={{ scale: [1.06, 1, 1.06] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <motion.div
                className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-blue-700"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
              >
                Access Pro unlocked
              </motion.div>
              <motion.h3
                className="text-3xl font-black tracking-tight text-slate-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.35 }}
              >
                Welcome to Pro
              </motion.h3>
              <motion.p
                className="mt-2 text-sm text-slate-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.35 }}
              >
                Pro features are now active for this organization.
              </motion.p>
              {expiryText ? (
                <motion.p
                  className="mt-2 text-xs text-slate-500"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.35 }}
                >
                  Active until: {expiryText}
                </motion.p>
              ) : null}
              <motion.div
                className="mt-6 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
              >
                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={close}
                >
                  Continue
                </button>
                <Link
                  href={`/${params.org}/pricing`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={close}
                >
                  Manage subscription
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


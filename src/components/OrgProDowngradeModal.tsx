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

export default function OrgProDowngradeModal() {
  const params = useParams<{ org: string }>();
  const [open, setOpen] = useState(false);
  const [seenKey, setSeenKey] = useState("");
  const [downgradeTime, setDowngradeTime] = useState<number | null>(null);
  const easeOut = cubicBezier(0.16, 1, 0.3, 1);

  useEffect(() => {
    let unsubOrg: null | (() => void) = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const orgSlug = params?.org;
      if (!user || !orgSlug) return;

      const planStateKey = `ap:org-plan:${user.uid}:${orgSlug}`;

      unsubOrg = onSnapshot(doc(db, "orgs", orgSlug), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as {
          plan?: "free" | "pro";
          proExpiresAt?: ExpiryStamp | null;
        };
        const currentPlan = data.plan === "pro" ? "pro" : "free";
        const previousPlan =
          typeof window !== "undefined"
            ? window.localStorage.getItem(planStateKey)
            : null;

        const expiryMs = toMillis(data.proExpiresAt);
        const cycleId = typeof expiryMs === "number" ? String(expiryMs) : "none";
        const downgradeKey = `ap:pro-downgrade:${user.uid}:${orgSlug}:${cycleId}`;

        if (
          previousPlan === "pro" &&
          currentPlan === "free" &&
          typeof window !== "undefined" &&
          window.localStorage.getItem(downgradeKey) !== "1"
        ) {
          setSeenKey(downgradeKey);
          setDowngradeTime(Date.now());
          setOpen(true);
        }

        if (typeof window !== "undefined") {
          window.localStorage.setItem(planStateKey, currentPlan);
        }
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

  const downgradeText = useMemo(() => {
    if (!downgradeTime) return "";
    return new Date(downgradeTime).toLocaleString();
  }, [downgradeTime]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[86] flex items-center justify-center px-6"
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: easeOut } }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <motion.svg
                  width="38"
                  height="38"
                  viewBox="0 0 48 48"
                  fill="none"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <circle cx="24" cy="24" r="18" stroke="#475569" strokeWidth="2.2" />
                  <motion.path
                    d="M18 20h.01M30 20h.01"
                    stroke="#475569"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.12 }}
                  />
                  <motion.path
                    d="M17 32c2.1-4.2 11.9-4.2 14 0"
                    stroke="#475569"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />
                  <motion.path
                    d="M35 9c2.2 2 3.2 5.4 2 8.4"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.45, 1] }}
                    transition={{ delay: 0.3, duration: 1.2 }}
                  />
                </motion.svg>
              </div>

              <motion.h3
                className="text-center text-2xl font-black tracking-tight text-slate-900"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
              >
                Pro has ended
              </motion.h3>
              <motion.p
                className="mt-2 text-center text-sm text-slate-600"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.3 }}
              >
                Your organization is now back on Free mode.
              </motion.p>
              {downgradeText ? (
                <motion.p
                  className="mt-2 text-center text-xs text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Changed at: {downgradeText}
                </motion.p>
              ) : null}

              <motion.div
                className="mt-6 flex flex-wrap items-center justify-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.3 }}
              >
                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={close}
                >
                  OK
                </button>
                <Link
                  href={`/${params.org}/pricing`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={close}
                >
                  Upgrade subscription
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


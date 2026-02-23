"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const DEVICE_KEY = "ap:device-id";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getDeviceId = () => {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const next = createId();
  window.localStorage.setItem(DEVICE_KEY, next);
  return next;
};

export default function OrgPresenceTracker() {
  const params = useParams<{ org: string }>();

  useEffect(() => {
    const orgSlug = params?.org;
    if (!orgSlug) return;

    let active = true;
    let uid = "";
    const deviceId = getDeviceId();

    const heartbeat = async (online: boolean) => {
      if (!active || !uid || !deviceId || !orgSlug) return;
      await setDoc(
        doc(db, "orgs", orgSlug, "deviceConnections", deviceId),
        {
          uid,
          orgSlug,
          deviceId,
          online,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 240) : "",
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      );
    };

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      uid = user.uid;
      await heartbeat(true);
    });

    const interval = window.setInterval(() => {
      void heartbeat(true);
    }, 20000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void heartbeat(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      void heartbeat(false);
      unsub();
    };
  }, [params?.org]);

  return null;
}

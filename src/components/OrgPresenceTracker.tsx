"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
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

const getDeviceLabel = (deviceId: string) => {
  if (typeof navigator === "undefined")
    return `Device - ${deviceId.slice(0, 6)}`;

  const ua = navigator.userAgent || "";
  const uaLower = ua.toLowerCase();

  const browser = (() => {
    if (uaLower.includes("edg/")) return "Edge";
    if (uaLower.includes("opr/") || uaLower.includes("opera")) return "Opera";
    if (uaLower.includes("firefox/")) return "Firefox";
    if (
      uaLower.includes("chrome/") &&
      !uaLower.includes("edg/") &&
      !uaLower.includes("opr/")
    )
      return "Chrome";
    if (uaLower.includes("safari/") && !uaLower.includes("chrome/"))
      return "Safari";
    return "";
  })();

  const device = (() => {
    if (uaLower.includes("iphone")) return "iPhone";
    if (uaLower.includes("ipad")) return "iPad";
    if (uaLower.includes("android")) {
      const modelMatch = ua.match(/Android\s[\d.]+;\s*([^;)\r\n]+)[;)]/i);
      const model = modelMatch?.[1]?.trim();
      if (model && model.length <= 32 && !/build/i.test(model)) {
        return `Android (${model})`;
      }
      return "Android";
    }
    if (uaLower.includes("windows")) return "Windows PC";
    if (uaLower.includes("macintosh") || uaLower.includes("mac os x"))
      return "Mac";
    if (uaLower.includes("linux")) return "Linux";
    return "Device";
  })();

  const base = browser ? `${device} (${browser})` : device;
  return `${base} - ${deviceId.slice(0, 6)}`;
};

export default function OrgPresenceTracker() {
  const params = useParams<{ org: string }>();

  useEffect(() => {
    const orgSlug = params?.org;
    if (!orgSlug) return;

    let active = true;
    let uid = "";
    let userName = "";
    const deviceId = getDeviceId();
    const deviceName = getDeviceLabel(deviceId);

    const heartbeat = async (online: boolean) => {
      if (!active || !uid || !deviceId || !orgSlug) return;
      await setDoc(
        doc(db, "orgs", orgSlug, "deviceConnections", deviceId),
        {
          uid,
          ...(userName ? { userName } : {}),
          orgSlug,
          deviceId,
          deviceName,
          online,
          userAgent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 240)
              : "",
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      );
    };

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      uid = user.uid;
      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        userName = userSnap.exists()
          ? (userSnap.data() as { name?: string }).name || ""
          : "";
      } catch {
        userName = "";
      }
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

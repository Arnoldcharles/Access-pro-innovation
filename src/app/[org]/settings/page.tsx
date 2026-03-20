"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type OrgData = {
  name?: string;
  plan?: "free" | "pro";
  proExpiresAt?: { toDate?: () => Date; toMillis?: () => number; seconds?: number } | null;
  ownerId?: string;
};

type UserData = {
  name?: string;
  theme?: "light" | "dark";
};

const toMillis = (
  value?: { toDate?: () => Date; toMillis?: () => number; seconds?: number } | null,
) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return null;
};

const setTheme = (theme: "light" | "dark") => {
  try {
    window.localStorage.setItem("ap:theme", theme);
  } catch {}
  document.documentElement.dataset.theme = theme;
};

export default function OrgSettingsPage() {
  const params = useParams<{ org: string }>();
  const router = useRouter();
  const orgSlug = params?.org ?? "";

  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState("");
  const [org, setOrg] = useState<OrgData | null>(null);

  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<null | { message: string; variant?: "success" | "info" }>(
    null,
  );

  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plan = org?.plan === "pro" ? "pro" : "free";
  const expiresMs = useMemo(() => toMillis(org?.proExpiresAt), [org?.proExpiresAt]);
  const isProExpired = plan === "pro" && typeof expiresMs === "number" && expiresMs <= Date.now();

  const canEditOrg = Boolean(uid && org?.ownerId && uid === org.ownerId);

  const showToast = (message: string, variant: "success" | "info" = "success") => {
    setToast({ message, variant });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/sign-in");
        return;
      }

      if (!orgSlug) return;
      setUid(firebaseUser.uid);
      setError("");

      try {
        const [userSnap, orgSnap] = await Promise.all([
          getDoc(doc(db, "users", firebaseUser.uid)),
          getDoc(doc(db, "orgs", orgSlug)),
        ]);

        const userData = userSnap.exists() ? (userSnap.data() as UserData) : {};
        const orgData = orgSnap.exists() ? (orgSnap.data() as OrgData) : null;

        if (!orgData) {
          router.replace("/onboarding");
          return;
        }

        setOrg(orgData);
        setUserName((userData.name ?? "").toString());
        setOrgName((orgData.name ?? "").toString());

        const existingTheme =
          (typeof window !== "undefined" && window.localStorage.getItem("ap:theme")) ||
          userData.theme ||
          "light";
        const normalizedTheme = existingTheme === "dark" ? "dark" : "light";
        setThemeState(normalizedTheme);
        setTheme(normalizedTheme);
      } catch (err) {
        console.error(err);
        setError("Unable to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [orgSlug, router]);

  const saveProfile = async () => {
    if (!uid) return;
    setSavingProfile(true);
    setError("");
    try {
      await setDoc(doc(db, "users", uid), { name: userName.trim() }, { merge: true });
      showToast("Profile updated");
    } catch (err) {
      console.error(err);
      setError("Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveOrg = async () => {
    if (!orgSlug || !canEditOrg) return;
    setSavingOrg(true);
    setError("");
    try {
      await updateDoc(doc(db, "orgs", orgSlug), { name: orgName.trim() });
      setOrg((prev) => ({ ...(prev ?? {}), name: orgName.trim() }));
      showToast("Organization updated");
    } catch (err) {
      console.error(err);
      setError("Unable to update the organization.");
    } finally {
      setSavingOrg(false);
    }
  };

  const saveTheme = async (next: "light" | "dark") => {
    if (!uid) return;
    setThemeState(next);
    setTheme(next);
    setSavingTheme(true);
    setError("");
    try {
      await setDoc(doc(db, "users", uid), { theme: next }, { merge: true });
      showToast("Theme updated");
    } catch (err) {
      console.error(err);
      showToast("Theme updated (device only)", "info");
    } finally {
      setSavingTheme(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.replace("/sign-in");
  };

  const deleteProfile = async () => {
    if (!uid) return;
    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      setError('Type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const orgsQuery = query(collection(db, "orgs"), where("ownerId", "==", uid));
      const ownedOrgs = await getDocs(orgsQuery);
      if (!ownedOrgs.empty) {
        setError(
          "You still own one or more organizations. Transfer ownership or delete the org(s) before deleting your profile.",
        );
        setDeleting(false);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (err) {
      console.error(err);
    }

    try {
      if (auth.currentUser) await deleteUser(auth.currentUser);
    } catch (err) {
      console.error(err);
      setError("Profile data deleted, but account deletion needs a recent login. Please sign in again and retry.");
      setDeleting(false);
      return;
    }

    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--surface-2)] text-[color:var(--foreground)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Loading settings…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--surface-2)] text-[color:var(--foreground)] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[color:var(--foreground)]">Settings</h1>
            <p className="text-sm text-[color:var(--muted)] mt-1">
              Manage your profile and organization preferences.
            </p>
          </div>
          <Link
            href={`/${orgSlug}`}
            className="px-4 py-2 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--foreground)]"
          >
            Back to dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-widest text-[color:var(--foreground)] uppercase">
            Profile
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
                Your name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white disabled:opacity-50"
                onClick={saveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-widest text-[color:var(--foreground)] uppercase">
            Organization
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
                Org name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] disabled:opacity-60"
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Organization name"
                disabled={!canEditOrg}
              />
              {!canEditOrg ? (
                <div className="mt-2 text-xs text-[color:var(--muted)]">
                  Only the org owner can change the organization name.
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white disabled:opacity-50"
                onClick={saveOrg}
                disabled={savingOrg || !canEditOrg}
              >
                {savingOrg ? "Saving..." : "Save org"}
              </button>
              <Link
                href={`/${orgSlug}/pricing`}
                className="px-4 py-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
              >
                Manage plan
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-widest text-[color:var(--foreground)] uppercase">
            Theme
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`px-4 py-2 rounded-2xl border ${
                theme === "light"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[color:var(--surface-2)] border-[color:var(--border)] text-[color:var(--foreground)]"
              } disabled:opacity-50`}
              onClick={() => saveTheme("light")}
              disabled={savingTheme}
            >
              Light
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-2xl border ${
                theme === "dark"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[color:var(--surface-2)] border-[color:var(--border)] text-[color:var(--foreground)]"
              } disabled:opacity-50`}
              onClick={() => saveTheme("dark")}
              disabled={savingTheme}
            >
              Dark
            </button>
            <div className="text-xs text-[color:var(--muted)]">
              Theme is stored on this device and in your profile when possible.
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-widest text-[color:var(--foreground)] uppercase">
            Plan
          </h2>
          <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[color:var(--foreground)]">
                  {plan === "pro" ? "Pro" : "Free"}
                </div>
                <div className="text-xs text-[color:var(--muted)] mt-1">
                  {plan === "pro" ? (
                    isProExpired ? (
                      "Expired"
                    ) : typeof expiresMs === "number" ? (
                      `Renews / expires on ${new Date(expiresMs).toLocaleDateString()}`
                    ) : (
                      "Active"
                    )
                  ) : (
                    "Upgrade anytime"
                  )}
                </div>
              </div>
              <Link
                href={`/${orgSlug}/pricing`}
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-widest text-rose-800 uppercase">Danger zone</h2>
          <p className="mt-3 text-sm text-rose-700">
            Delete your profile and account. This cannot be undone.
          </p>
          <div className="mt-4 grid gap-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-rose-700">Type DELETE to confirm</label>
              <input
                className="mt-2 w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                value={deleteInput}
                onChange={(event) => setDeleteInput(event.target.value)}
                placeholder="DELETE"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-2xl bg-rose-600 text-white disabled:opacity-50"
              onClick={deleteProfile}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete my profile"}
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fixed bottom-6 right-6 z-[80] w-[min(92vw,360px)]"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${
                toast.variant === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <div className="text-sm font-semibold">{toast.message}</div>
              <button
                type="button"
                className="mt-2 text-xs underline opacity-80 hover:opacity-100"
                onClick={() => setToast(null)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

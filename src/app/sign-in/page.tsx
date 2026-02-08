"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      setNextUrl(next);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      if (nextUrl) {
        router.replace(nextUrl);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      const orgSlug = snap.exists()
        ? (snap.data().orgSlug as string | undefined)
        : undefined;
      if (orgSlug) router.replace(`/${orgSlug}`);
      else router.replace("/onboarding");
    });
    return () => unsub();
  }, [router]);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const orgSlug = snap.exists()
          ? (snap.data().orgSlug as string | undefined)
          : undefined;
        if (nextUrl) {
          router.replace(nextUrl);
          return;
        }
        if (orgSlug) {
          router.replace(`/${orgSlug}`);
        } else {
          router.replace("/onboarding");
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[520px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="flex items-center gap-3 mb-10" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">AccessPro</span>
          </Link>

          <div className="mb-3">
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                className="text-3xl md:text-4xl font-black"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: easeOut } }}
              >
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${mode}-sub`}
                className="text-slate-600"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.2, ease: easeOut } }}
              >
                {mode === "signin"
                  ? "Sign in to continue to your event dashboard."
                  : "Start with a free account and set up your organization."}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="inline-flex items-center gap-4 mb-8 relative">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`relative px-1 pb-2 text-sm font-semibold transition-colors ${
                mode === "signin" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              Sign in
              {mode === "signin" ? (
                <motion.span
                  layoutId="authUnderline"
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-blue-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`relative px-1 pb-2 text-sm font-semibold transition-colors ${
                mode === "signup" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              Create account
              {mode === "signup" ? (
                <motion.span
                  layoutId="authUnderline"
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-blue-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ) : null}
            </button>
          </div>

          <motion.button
            type="button"
            onClick={handleGoogle}
            className="w-full relative overflow-hidden bg-slate-900 text-white font-semibold rounded-2xl py-3 mb-6"
            disabled={loading}
            whileHover={
              !loading
                ? {
                    boxShadow: "0 0 24px rgba(37, 99, 235, 0.35)",
                    backgroundColor: "rgb(15, 23, 42)",
                  }
                : undefined
            }
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {!loading ? (
              <motion.span
                aria-hidden
                className="absolute inset-0 opacity-30"
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
              >
                <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.span>
            ) : null}
            Continue with Google
          </motion.button>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors"
              whileHover={
                !loading
                  ? {
                      scale: 1.02,
                      y: -1,
                      boxShadow: "0 0 22px rgba(37, 99, 235, 0.35)",
                      backgroundColor: "rgb(59, 130, 246)",
                    }
                  : undefined
              }
              whileTap={!loading ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {!loading ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 opacity-40"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
                >
                  <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </motion.span>
              ) : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </motion.button>
          </form>

          {error ? (
            <div className="mt-4 text-sm text-red-400">{error}</div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

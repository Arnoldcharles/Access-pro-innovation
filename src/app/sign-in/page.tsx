'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      const orgSlug = snap.exists() ? (snap.data().orgSlug as string | undefined) : undefined;
      if (orgSlug) router.replace(`/${orgSlug}`);
      else router.replace('/onboarding');
    });
    return () => unsub();
  }, [router]);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const orgSlug = snap.exists() ? (snap.data().orgSlug as string | undefined) : undefined;
        if (orgSlug) {
          router.replace(`/${orgSlug}`);
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
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
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <div className="max-w-[520px] mx-auto px-6 sm:px-10 py-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="flex items-center gap-3 mb-10" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">A</div>
            <span className="font-bold text-xl tracking-tight">AccessPro</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-black mb-3">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-400 mb-8">
            {mode === 'signin'
              ? 'Sign in to continue to your event dashboard.'
              : 'Start with a free account and set up your organization.'}
          </p>

          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                mode === 'signin' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Create account
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full bg-white text-slate-900 font-semibold rounded-2xl py-3 mb-6"
            disabled={loading}
          >
            Continue with Google
          </button>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}

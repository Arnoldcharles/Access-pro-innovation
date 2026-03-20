"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-16 bg-[color:var(--surface-2)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-sm">
          <div className="text-xs font-black tracking-[0.35em] text-[color:var(--muted)]">
            SOMETHING WENT WRONG
          </div>
          <h1 className="mt-3 text-3xl font-black">We hit an error</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Try again, or go back to safety.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold"
              onClick={() => reset()}
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)] text-sm font-semibold"
            >
              Go to home
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)] text-sm"
            >
              Contact support
            </Link>
          </div>

          {error?.digest ? (
            <div className="mt-6 text-xs text-[color:var(--muted)]">
              Reference: {error.digest}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}


import Link from "next/link";

export default function OrgNotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-16 bg-[color:var(--surface-2)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-sm">
          <div className="text-xs font-black tracking-[0.35em] text-[color:var(--muted)]">
            NOT FOUND
          </div>
          <h1 className="mt-3 text-3xl font-black">Organization not found</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            The workspace you’re trying to open doesn’t exist (or you no longer have access).
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold"
            >
              Create / pick an org
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground)] text-sm"
            >
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


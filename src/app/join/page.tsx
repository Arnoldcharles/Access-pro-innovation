"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  PhoneCall,
  QrCode,
  Rocket,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export default function JoinOrgPage() {
  const [tab, setTab] = useState<"how" | "dashboard" | "pricing">("how");
  const [activeStep, setActiveStep] = useState(1);

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "Create your organization",
        icon: Rocket,
        detail:
          "Set up your workspace once. You’ll manage events, guests, and check-ins from one dashboard.",
      },
      {
        id: 2,
        title: "Create an event",
        icon: CalendarPlus,
        detail:
          "Add name, date, and location. Your event page becomes your control center for guest lists and scans.",
      },
      {
        id: 3,
        title: "Add guests",
        icon: Users,
        detail:
          "Upload or add guests manually. Each guest gets a QR that can be scanned at the gate for fast check-in.",
      },
      {
        id: 4,
        title: "Scan QR codes live",
        icon: QrCode,
        detail:
          "Use your phone or laptop to scan. The dashboard updates instantly so your team stays in sync.",
      },
      {
        id: 5,
        title: "Track results",
        icon: BarChart3,
        detail:
          "See attendance trends, scan speed, and activity in real time. Improve your flow for the next event.",
      },
    ],
    [],
  );

  const selectedStep = steps.find((s) => s.id === activeStep) ?? steps[0];

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[color:var(--surface-2)] text-[color:var(--foreground)] flex items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-5xl"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.div
          variants={fadeUp}
          className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm overflow-hidden"
        >
          <div className="relative px-8 pt-10 pb-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2 text-xs font-semibold text-[color:var(--muted)]">
                <Sparkles size={14} />
                GET STARTED
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">
                Launch your next event faster
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
                Create a workspace, set up events, add guests, and run live QR check-ins — all from one dashboard.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/onboarding?newOrg=1"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Create an organization
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-3 text-sm text-[color:var(--foreground)] hover:bg-slate-100"
                >
                  View pricing
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-3 text-sm text-[color:var(--foreground)] hover:bg-slate-100"
                >
                  <PhoneCall size={16} />
                  Talk to us
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Zap, title: "Fast setup", desc: "Create org + event in minutes." },
                  { icon: QrCode, title: "Live QR scanning", desc: "Instant check-ins on any device." },
                  { icon: BarChart3, title: "Actionable stats", desc: "Track scan speed and activity." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <item.icon size={16} />
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--muted)]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[color:var(--border)] bg-[color:var(--surface-2)] px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "how" as const, label: "How it works", icon: CheckCircle2 },
                { id: "dashboard" as const, label: "Dashboard tour", icon: LayoutDashboard },
                { id: "pricing" as const, label: "Pricing", icon: Crown },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
                    tab === t.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-slate-100"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 py-8 bg-[color:var(--surface)]">
            <AnimatePresence mode="wait" initial={false}>
              {tab === "how" ? (
                <motion.div
                  key="how"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                    <div>
                      <div className="text-sm font-black tracking-widest uppercase text-[color:var(--muted)]">
                        Steps
                      </div>
                      <div className="mt-2 text-xl font-black">Start in minutes</div>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">
                        Click a step to see exactly what happens inside the dashboard.
                      </p>

                      <div className="mt-5 grid gap-2">
                        {steps.map((step) => {
                          const Icon = step.icon;
                          const selected = step.id === activeStep;
                          return (
                            <motion.button
                              key={step.id}
                              type="button"
                              onClick={() => setActiveStep(step.id)}
                              className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                                selected
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-[color:var(--border)] bg-[color:var(--surface-2)] hover:bg-slate-100"
                              }`}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-9 w-9 rounded-2xl grid place-items-center border ${
                                      selected
                                        ? "border-blue-200 bg-white"
                                        : "border-[color:var(--border)] bg-[color:var(--surface)]"
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold">
                                      {step.id}. {step.title}
                                    </div>
                                    <div className="text-xs text-[color:var(--muted)]">
                                      Tap to preview
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight size={16} className="opacity-60" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6">
                      <div className="text-xs font-black tracking-[0.35em] text-[color:var(--muted)]">
                        PREVIEW
                      </div>
                      <div className="mt-2 text-lg font-black">{selectedStep.title}</div>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">{selectedStep.detail}</p>
                      <div className="mt-6 grid gap-3">
                        {[
                          { k: "Best for", v: "Events, conferences, concerts" },
                          { k: "Works on", v: "Phone / tablet / laptop" },
                          { k: "Updates", v: "Live across connected devices" },
                        ].map((row) => (
                          <div
                            key={row.k}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
                          >
                            <span className="text-[color:var(--muted)]">{row.k}</span>
                            <span className="font-semibold">{row.v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 text-xs text-[color:var(--muted)]">
                        Already part of an org? Ask the owner to add you (invites are currently disabled).
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {tab === "dashboard" ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-black tracking-widest uppercase text-[color:var(--muted)]">
                    Dashboard tour
                  </div>
                  <div className="mt-2 text-xl font-black">What you’ll use most</div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    Here’s where everything lives once you’re inside your organization.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {[
                      {
                        icon: LayoutDashboard,
                        title: "Org dashboard",
                        desc: "Your overview: events, activity, and connected devices.",
                      },
                      {
                        icon: CalendarPlus,
                        title: "Create & manage events",
                        desc: "Edit details, view guests, and open live check-in tools.",
                      },
                      {
                        icon: Users,
                        title: "Guests",
                        desc: "Add guests and search fast. Prepare for a smooth gate flow.",
                      },
                      {
                        icon: QrCode,
                        title: "Scanner",
                        desc: "Scan QR codes live and see instant results.",
                      },
                      {
                        icon: BarChart3,
                        title: "Insights",
                        desc: "Track scan speed and attendance patterns.",
                      },
                      {
                        icon: Settings,
                        title: "Settings",
                        desc: "Update your profile, theme, plan, and safety options.",
                      },
                    ].map((card) => (
                      <motion.div
                        key={card.title}
                        className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-5"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] grid place-items-center">
                            <card.icon size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{card.title}</div>
                            <div className="mt-1 text-xs text-[color:var(--muted)]">{card.desc}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              {tab === "pricing" ? (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-black tracking-widest uppercase text-[color:var(--muted)]">
                    Pricing
                  </div>
                  <div className="mt-2 text-xl font-black">Start free, upgrade when ready</div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    Free is great for small tests. Pro unlocks more orgs/events and removes limits.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6">
                      <div className="text-sm font-black">Free</div>
                      <div className="mt-1 text-xs text-[color:var(--muted)]">For trials and small runs</div>
                      <div className="mt-5 grid gap-2 text-sm">
                        {[
                          "Up to 2 organizations",
                          "Up to 5 events per org",
                          "Live device presence",
                          "QR scanning tools",
                        ].map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="opacity-80" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
                        <Crown size={14} />
                        PRO
                      </div>
                      <div className="mt-3 text-sm font-black">Pro</div>
                      <div className="mt-1 text-xs text-blue-700/90">For growing teams and larger events</div>
                      <div className="mt-5 grid gap-2 text-sm text-blue-900">
                        {[
                          "More organizations",
                          "More events",
                          "Priority support",
                          "Designed for busy gates",
                        ].map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="opacity-80" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/pricing"
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                      >
                        Compare plans
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

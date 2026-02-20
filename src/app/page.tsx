"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const partnerNames = [
  "Bankysu Events",
  "EventRite",
  "Africa Innovators",
  "Pulse Live",
  "Nova Teams",
  "Lumen Hub",
];

const tools = [
  {
    title: "Custom Event Pages",
    text: "Launch polished event pages with your branding in minutes.",
    icon: Sparkles,
  },
  {
    title: "Ticketing & Attendee Types",
    text: "Create guest categories, VIP tiers, and priority lanes.",
    icon: Users,
  },
  {
    title: "RSVP & Communication",
    text: "Send reminders, updates, and confirmations from one place.",
    icon: Zap,
  },
  {
    title: "Session Scheduling",
    text: "Manage tracks, slots, and room allocation without spreadsheets.",
    icon: CheckCircle2,
  },
  {
    title: "Seamless Check-ins",
    text: "Scan passes quickly with low-friction gate operations.",
    icon: ScanLine,
  },
  {
    title: "Live Dashboard",
    text: "Track arrivals, occupancy, and key flow metrics in real time.",
    icon: QrCode,
  },
  {
    title: "Role-based Access",
    text: "Control permissions for staff, partners, and volunteers.",
    icon: ShieldCheck,
  },
  {
    title: "Post-event Reports",
    text: "Export accurate attendance and performance insights fast.",
    icon: ArrowRight,
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="bg-[#f3f5f8] text-slate-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.3),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.3),transparent_30%),linear-gradient(160deg,#070b1a_0%,#0a1737_50%,#111f44_100%)] px-4 pb-14 pt-5 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm font-black tracking-[0.2em] text-white">
                ACCESS PRO
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex">
                <Link href="/features">Features</Link>
                <Link href="/benefits">Benefits</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/contact">Contact</Link>
              </nav>
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/join"
                  className="rounded-full border border-cyan-300/70 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
                >
                  Login
                </Link>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
            {mobileOpen ? (
              <div className="mt-3 grid gap-2 border-t border-white/20 pt-3 text-sm text-white/90 md:hidden">
                <Link href="/features" onClick={() => setMobileOpen(false)}>
                  Features
                </Link>
                <Link href="/benefits" onClick={() => setMobileOpen(false)}>
                  Benefits
                </Link>
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  Pricing
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  Contact
                </Link>
                <div className="mt-2 flex gap-2">
                  <Link
                    href="/join"
                    className="rounded-full border border-cyan-300/70 px-4 py-2 text-xs font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get started
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Event Management Platform
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              YOUR <span className="text-cyan-300">PLATFORM</span> FOR SEAMLESS EVENTS
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              The modern way to manage registrations, gate scanning, and attendee flow without stress.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/join"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
              >
                Sign up
              </Link>
              <Link
                href="/features"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {partnerNames.map((partner) => (
            <div
              key={partner}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500"
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">About Access Pro</p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            More than just software. We are innovators with years of experience.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Access Pro gives teams one connected system for invitations, attendance tracking, and day-of-event execution.
            Build better events with fast setup and smooth on-site operations.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-200 to-cyan-100 p-6">
            <h3 className="text-2xl font-black text-slate-800">Simple for you to use.</h3>
            <p className="mt-3 text-sm text-slate-700">
              Keep workflows clear and focused. No bloated setup, no complex handoffs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
            <img
              src="/accessproimages/AccessProInnovation.png"
              alt="Dashboard preview"
              className="h-56 w-full rounded-xl object-cover sm:h-72"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-5">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 p-6 text-white md:col-span-2">
            <p className="text-3xl font-black leading-tight">Your Events Can Cut Across</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-5 text-sm font-semibold text-cyan-200">Conferences & Exhibitions</div>
          <div className="rounded-2xl bg-blue-900 p-5 text-sm font-semibold text-cyan-200">Annual General Meetings</div>
          <div className="rounded-2xl bg-slate-800 p-5 text-sm font-semibold text-cyan-200">Festivals & Concerts</div>
          <div className="rounded-2xl bg-slate-700 p-5 text-sm font-semibold text-cyan-200">Government Summits</div>
          <div className="rounded-2xl bg-slate-600 p-5 text-sm font-semibold text-cyan-200">Trade Shows</div>
          <div className="rounded-2xl bg-white p-6 md:col-span-2">
            <h3 className="text-xl font-black">Versatile. Built for any event.</h3>
            <p className="mt-2 text-sm text-slate-600">
              Whether you run invite-only forums or public experiences, Access Pro scales cleanly and keeps your team in sync.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Features</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Powerful tools to make every event a success.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title} className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{tool.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Services</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Seamless setup. Effortless engagement.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-xl font-black">Set up and manage your event</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Create schedules, guest lists, and access levels.</li>
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Publish branded invites and track RSVPs instantly.</li>
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Coordinate teams with one shared operations dashboard.</li>
              </ul>
            </div>
            <img
              src="/accessproimages/InShot_20251230_132657935.jpg.jpeg"
              alt="Event planning desk"
              className="h-72 w-full rounded-2xl object-cover"
            />
            <img
              src="/accessproimages/InShot_20251230_133132783.jpg.jpeg"
              alt="Attendee crowd"
              className="h-72 w-full rounded-2xl object-cover"
            />
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-xl font-black">Engage and interact with attendees</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Fast QR scanning to reduce gate congestion.</li>
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Live communication for updates and announcements.</li>
                <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-sky-600" />Real-time check-in progress and attendance tracking.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#121e4c] px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Contact Us Today</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">Curious if Access Pro is right for your event?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            Speak with our team to discuss your event type, attendee volume, and workflow goals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
              Book a free consultation
            </Link>
            <Link href="/sign-in" className="rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-200">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Frequently Asked Questions</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Got questions? We got answers!</h2>
            <p className="mt-3 text-slate-600">Here are common questions event organizers ask before launch day.</p>
            <Link href="/contact" className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              Contact us
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "What event types can I manage with Access Pro?",
              "How does Access Pro handle attendee verification?",
              "Can I use Access Pro for multi-day events?",
              "How secure is attendee data on the platform?",
            ].map((q) => (
              <details key={q} className="rounded-xl border border-slate-200 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">{q}</summary>
                <p className="mt-2 text-sm text-slate-600">
                  Access Pro is designed for flexible events, with configurable flows for registration, check-in, and reporting.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

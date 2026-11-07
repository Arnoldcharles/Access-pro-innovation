"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import TypingAnimation from "@/components/TypingAnimation";
import AnimatedCard from "@/components/AnimatedCard";

const partnerNames = [
  "Bankysu Events",
  "Eventgo2guys",
  "Creative work Flow (CWF)",
  "Coker Creative",
  "Bee Events",
];

const impactStats = [
  { value: "3x", label: "Faster check-ins" },
  { value: "24/7", label: "Live visibility" },
  { value: "99.9%", label: "Guest accuracy" },
];

const featureHighlights = [
  "Guest registration",
  "QR check-ins",
  "Live dashboards",
  "Access control",
];

const features = [
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

const eventTypes = [
  "Conferences & Exhibitions",
  "Annual General Meetings",
  "Festivals & Concerts",
  "Government Summits",
  "Trade Shows",
];

const workflowSteps = [
  "Create your organization (workspace)",
  "Create an event and share the page",
  "Upload / add guests and generate QR codes",
  "Scan QR codes live at the gate",
  "View attendance and flow insights",
];

const workflowCards = [
  { title: "Create org", text: "Set up your workspace once.", icon: Sparkles },
  { title: "Create event", text: "Add name, date, location.", icon: Users },
  { title: "Add guests", text: "Upload lists or add manually.", icon: Zap },
  { title: "Scan live", text: "Fast gate operations with QR.", icon: QrCode },
];

const serviceCards = [
  {
    title: "Set up and manage your event",
    items: [
      "Create schedules, guest lists, and access levels.",
      "Publish branded invites and track RSVPs instantly.",
      "Coordinate teams with one shared operations dashboard.",
    ],
  },
  {
    title: "Engage and interact with attendees",
    items: [
      "Fast QR scanning to reduce gate congestion.",
      "Live communication for updates and announcements.",
      "Real-time check-in progress and attendance tracking.",
    ],
  },
];

const faqItems = [
  {
    question: "What event types can I manage with Access Pro?",
    answer:
      "Access Pro is built for conferences, trade shows, public festivals, private summits, and more—each with custom registration and access flows.",
  },
  {
    question: "How does Access Pro handle attendee verification?",
    answer:
      "Attendees can be verified through QR scanning, guest lists, and access rules that match your event structure and permissions.",
  },
  {
    question: "Can I use Access Pro for multi-day events?",
    answer:
      "Yes. The platform supports multi-day scheduling, check-in tracking, and session management across event timelines.",
  },
  {
    question: "How secure is attendee data on the platform?",
    answer:
      "Access Pro is designed with role-based access, protected guest records, and controlled operational visibility for organizers and staff.",
  },
];

export default function HomePage() {
  return (
    <main className="page-transition bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_30%),linear-gradient(135deg,#020817_0%,#0f172a_42%,#111827_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.2),rgba(2,6,23,0.75))]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-10 top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-8 lg:pt-14">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Event management platform
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-[1.05] text-white sm:text-5xl md:text-6xl">
                YOUR <TypingAnimation words={["PLATFORM", "SOLUTION", "SYSTEM", "TOOL", "APP", "HUB"]} />
                <span className="block text-cyan-300">FOR SEAMLESS EVENTS</span>
              </h1>

              <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
                The modern way to manage registrations, gate scanning, and attendee
                flow without stress.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Sign up <ArrowRight size={16} />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Features
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {featureHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[22px] border border-slate-700/80 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Event overview
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-white">Summit 2026</h2>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      Live
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {impactStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl bg-slate-800 p-3">
                          <div className="text-xl font-black text-cyan-300">{stat.value}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-slate-800 p-4">
                      <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                        <span>Check-in flow</span>
                        <span className="font-semibold text-cyan-300">82%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-700">
                        <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: "VIP guests", value: "240" },
                        { name: "General guests", value: "1,420" },
                        { name: "Staff online", value: "18" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-800/70 px-3 py-2">
                          <span className="text-sm text-slate-300">{item.name}</span>
                          <span className="text-sm font-semibold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
            {partnerNames.map((partner, idx) => (
              <div
                key={partner}
                className="animate-fade-in-up shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
                About Access Pro
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                Built for event teams that need clarity, speed, and confidence.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Access Pro gives teams one connected system for invitations,
                attendance tracking, and day-of-event execution. Build better events
                with fast setup and smooth on-site operations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Simple, clear workflows for every team member",
                  "Fast registration and attendee verification",
                  "Live operational insights before and during the event",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sky-600" />
                    <span className="text-sm text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-gradient-to-br from-sky-200 to-cyan-100 p-6 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800">Simple for you to use.</h3>
                <p className="mt-3 text-sm text-slate-700">
                  Keep workflows clear and focused. No bloated setup, no complex handoffs.
                </p>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src="/accessproimages/AccessProInnovation.png"
                  alt="Dashboard preview"
                  className="h-full min-h-[220px] w-full rounded-[22px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
              Solutions
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Your events can cut across every kind of experience.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-[28px] bg-gradient-to-br from-cyan-400 to-sky-500 p-6 text-white shadow-lg md:col-span-2">
              <p className="text-3xl font-black leading-tight">Built for modern organizers.</p>
            </div>

            {eventTypes.map((type, idx) => (
              <div
                key={type}
                className="rounded-[22px] p-5 text-sm font-semibold text-cyan-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{
                  background:
                    idx === 0
                      ? "#0f172a"
                      : idx === 1
                        ? "#1d4ed8"
                        : idx === 2
                          ? "#1e293b"
                          : idx === 3
                            ? "#334155"
                            : "#475569",
                }}
              >
                {type}
              </div>
            ))}

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm md:col-span-2">
              <h3 className="text-xl font-black text-slate-900">Versatile. Built for any event.</h3>
              <p className="mt-2 text-sm text-slate-600">
                Whether you run invite-only forums or public experiences, Access Pro scales cleanly and keeps your team in sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50 px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Features</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Powerful tools to make every event a success.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <AnimatedCard
                  key={feature.title}
                  delay={idx}
                  className="cursor-pointer rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
                </AnimatedCard>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Services</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Seamless setup. Effortless engagement.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {serviceCards.map((card, idx) => (
              <div
                key={card.title}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h3 className="text-xl font-black text-slate-900">{card.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sky-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <img
              src="/accessproimages/InShot_20251230_130942088.jpg.jpeg"
              alt="Event planning desk"
              className="h-72 w-full rounded-[28px] object-cover shadow-sm"
            />
            <img
              src="/accessproimages/InShot_20251230_133959882.jpg.jpeg"
              alt="Attendee crowd"
              className="h-72 w-full rounded-[28px] object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Quick start</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                How you use the dashboard
              </h2>
              <p className="mt-3 text-slate-600">
                Everything happens inside your organization workspace: create events,
                manage guests, and run live QR check-ins with real-time updates.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  See the full guide <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:shadow-sm"
                >
                  Compare pricing
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-700">
                {workflowSteps.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sky-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflowCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <AnimatedCard
                    key={card.title}
                    delay={idx + 1}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
                        <Icon size={16} className="text-sky-600" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{card.title}</div>
                        <div className="mt-1 text-xs text-slate-600">{card.text}</div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#121e4c] px-4 py-20 text-white sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Contact Us Today</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Curious if Access Pro is right for your event?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            Speak with our team to discuss your event type, attendee volume, and workflow goals.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50"
            >
              Book a free consultation
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Frequently Asked Questions</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Got questions? We got answers!
            </h2>
            <p className="mt-3 text-slate-600">
              Here are common questions event organizers ask before launch day.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Contact us
            </Link>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={item.question}
                className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition-all duration-300 hover:border-cyan-300 hover:shadow-md"
                style={{ animationDelay: `${150 + idx * 50}ms` }}
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

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

const eventTypes = [
  "Conferences & Exhibitions",
  "Annual General Meetings",
  "Festivals & Concerts",
  "Government Summits",
  "Trade Shows",
];

const quickStartSteps = [
  "Create your organization (workspace)",
  "Create an event and share the page",
  "Upload / add guests and generate QR codes",
  "Scan QR codes live at the gate",
  "View attendance and flow insights",
];

const quickStartCards = [
  {
    title: "Create org",
    text: "Set up your workspace once.",
    icon: Sparkles,
  },
  {
    title: "Create event",
    text: "Add name, date, location.",
    icon: Users,
  },
  {
    title: "Add guests",
    text: "Upload lists or add manually.",
    icon: Zap,
  },
  {
    title: "Scan live",
    text: "Fast gate operations with QR.",
    icon: QrCode,
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

export default function HomePage() {
  return (
    <main className="page-transition bg-[color:var(--surface-2)] text-[color:var(--foreground)]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.3),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.3),transparent_30%),linear-gradient(135deg,#0f172a_0%,#0b1120_50%,#111827_100%)]">
        <div className="absolute inset-0 animate-bg-pan-original opacity-20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-move-blur" />
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-move-blur" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-20 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Event Management Platform
            </p>

            <h1 className="mt-5 animate-fade-in-up text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              YOUR <TypingAnimation words={["PLATFORM", "SOLUTION", "SYSTEM", "TOOL", "APP", "HUB"]} /> FOR SEAMLESS EVENTS
            </h1>

            <p className="mx-auto mt-4 max-w-xl animate-fade-in-up text-sm text-white/80 sm:text-base">
              The modern way to manage registrations, gate scanning, and attendee
              flow without stress.
            </p>

            <div className="mt-8 flex animate-fade-in-up flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-in"
                className="btn-primary rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 hover:shadow-lg"
              >
                Sign up
              </Link>
              <Link
                href="/features"
                className="btn-primary rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:shadow-lg"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
            {partnerNames.map((partner, idx) => (
              <div
                key={partner}
                className="animate-fade-in-up shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
            About Access Pro
          </p>
          <h2 className="animate-fade-in-up mt-4 text-3xl font-black leading-tight sm:text-4xl">
            More than just software. We are innovators with years of experience.
          </h2>
          <p className="animate-fade-in-up mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Access Pro gives teams one connected system for invitations,
            attendance tracking, and day-of-event execution. Build better events
            with fast setup and smooth on-site operations.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <div className="animate-fade-in-up rounded-2xl bg-gradient-to-br from-sky-200 to-cyan-100 p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-2xl font-black text-slate-800">
              Simple for you to use.
            </h3>
            <p className="mt-3 text-sm text-slate-700">
              Keep workflows clear and focused. No bloated setup, no complex
              handoffs.
            </p>
          </div>

          <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:shadow-lg md:col-span-2">
            <img
              src="/accessproimages/AccessProInnovation.png"
              alt="Dashboard preview"
              className="h-56 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-105 sm:h-72"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-5">
          <div className="animate-fade-in-up rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 p-6 text-white transition-all duration-300 hover:shadow-lg md:col-span-2">
            <p className="text-3xl font-black leading-tight">
              Your Events Can Cut Across
            </p>
          </div>

          {eventTypes.map((type, idx) => (
            <div
              key={type}
              className="animate-fade-in-up rounded-2xl bg-slate-900 p-5 text-sm font-semibold text-cyan-200 transition-all duration-300 hover:scale-105 hover:bg-slate-800"
              style={{ animationDelay: `${idx * 50}ms`, backgroundColor: idx % 2 === 0 ? "#0f172a" : idx === 1 ? "#1d4ed8" : idx === 2 ? "#1e293b" : idx === 3 ? "#334155" : "#475569" }}
            >
              {type}
            </div>
          ))}

          <div className="animate-fade-in-up rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-lg md:col-span-2">
            <h3 className="text-xl font-black">Versatile. Built for any event.</h3>
            <p className="mt-2 text-sm text-slate-600">
              Whether you run invite-only forums or public experiences, Access
              Pro scales cleanly and keeps your team in sync.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
              Our Features
            </p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl">
              Powerful tools to make every event a success.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <AnimatedCard
                  key={tool.title}
                  delay={idx}
                  className="cursor-pointer rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-200 hover:bg-sky-100">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{tool.text}</p>
                </AnimatedCard>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/features"
              className="btn-primary inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
              Our Services
            </p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl">
              Seamless setup. Effortless engagement.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {serviceCards.map((card, idx) => (
              <div
                key={card.title}
                className="animate-fade-in-up rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h3 className="text-xl font-black">{card.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {card.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 transition-transform duration-200 hover:translate-x-1"
                    >
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
              className="animate-fade-in-up h-72 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: "100ms" }}
            />
            <img
              src="/accessproimages/InShot_20251230_133959882.jpg.jpeg"
              alt="Attendee crowd"
              className="animate-fade-in-up h-72 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: "150ms" }}
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
                Quick start
              </p>
              <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl">
                How you use the dashboard
              </h2>
              <p className="animate-fade-in-up mt-3 text-slate-600">
                Everything happens inside your organization workspace: create
                events, manage guests, and run live QR check-ins with real-time
                updates.
              </p>

              <div className="animate-fade-in-up mt-6 flex flex-wrap gap-3">
                <Link
                  href="/join"
                  className="btn-primary inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
                >
                  See the full guide <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-primary rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:shadow-lg"
                >
                  Compare pricing
                </Link>
              </div>

              <div className="animate-fade-in-up mt-8 grid gap-3 text-sm text-slate-700">
                {quickStartSteps.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sky-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickStartCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <AnimatedCard
                    key={card.title}
                    delay={idx + 1}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white">
                        <Icon size={16} className="text-sky-600" />
                      </div>
                      <div>
                        <div className="text-sm font-black">{card.title}</div>
                        <div className="mt-1 text-xs text-slate-600">
                          {card.text}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#121e4c] px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
            Contact Us Today
          </p>
          <h2 className="animate-fade-in-up mt-4 text-3xl font-black sm:text-4xl">
            Curious if Access Pro is right for your event?
          </h2>
          <p className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            Speak with our team to discuss your event type, attendee volume, and
            workflow goals.
          </p>

          <div className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="btn-primary rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50 hover:shadow-lg"
            >
              Book a free consultation
            </Link>
            <Link
              href="/sign-in"
              className="btn-primary rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10 hover:shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">
              Frequently Asked Questions
            </p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl">
              Got questions? We got answers!
            </h2>
            <p className="animate-fade-in-up mt-3 text-slate-600">
              Here are common questions event organizers ask before launch day.
            </p>
            <Link
              href="/contact"
              className="btn-primary animate-fade-in-up mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
            >
              Contact us
            </Link>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={item.question}
                className="animate-fade-in-up rounded-xl border border-slate-200 px-4 py-3 transition-all duration-300 hover:border-cyan-300 hover:shadow-md"
                style={{ animationDelay: `${150 + idx * 50}ms` }}
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 transition-colors duration-200 group-open:text-cyan-600">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

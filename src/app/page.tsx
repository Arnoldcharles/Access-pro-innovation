"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
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

export default function HomePage() {
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // parallax scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="page-transition bg-[#f3f5f8] text-slate-900">
      <section ref={heroRef} className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-8">
        {/* animated multicolor blurred background with parallax */}
        <div
          className="absolute inset-0 animate-bg-pan bg-linear-to-br from-sky-600 via-cyan-400 to-blue-900 bg-size-[200%_200%] blur-3xl opacity-20"
          style={{ transform: `translateY(${offsetY * 0.05}px)` }}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-move-blur"
            style={{ transform: `translateY(${offsetY * 0.1}px)` }}
          ></div>
          <div
            className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-move-blur"
            style={{ transform: `translateY(${offsetY * -0.1}px)` }}
          ></div>
        </div>
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300" style={{ animationDelay: "0ms" }}>
              Event Management Platform
            </p>
            <h1 
              className="mt-5 animate-fade-in-up text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl" 
              style={{ animationDelay: "150ms" }}
            >
              YOUR <TypingAnimation words={["PLATFORM", "SOLUTION", "SYSTEM", "TOOL", "APP", "HUB"]} /> FOR SEAMLESS EVENTS
            </h1>
            <p className="mx-auto mt-4 animate-fade-in-up max-w-xl text-sm text-white/80 sm:text-base" style={{ animationDelay: "300ms" }}>
              The modern way to manage registrations, gate scanning, and attendee flow without stress.
            </p>
            <div 
              className="mt-8 flex animate-fade-in-up flex-wrap items-center justify-center gap-3" 
              style={{ animationDelay: "450ms" }}
            >
              <Link
                href="/join"
                className="btn-primary rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-300 hover:shadow-lg"
              >
                Sign up
              </Link>
              <Link
                href="/features"
                className="btn-primary rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:shadow-lg"
              >
                Explore Features
              </Link>
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
                className="animate-fade-in-up shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-500 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-300 whitespace-nowrap w-max"
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
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">About Access Pro</p>
          <h2 className="animate-fade-in-up mt-4 text-3xl font-black leading-tight sm:text-4xl" style={{ animationDelay: "100ms" }}>
            More than just software. We are innovators with years of experience.
          </h2>
          <p className="animate-fade-in-up mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base" style={{ animationDelay: "200ms" }}>
            Access Pro gives teams one connected system for invitations, attendance tracking, and day-of-event execution.
            Build better events with fast setup and smooth on-site operations.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <div className="animate-fade-in-up rounded-2xl bg-linear-to-br from-sky-200 to-cyan-100 p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-black text-slate-800">Simple for you to use.</h3>
            <p className="mt-3 text-sm text-slate-700">
              Keep workflows clear and focused. No bloated setup, no complex handoffs.
            </p>
          </div>
          <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 hover:shadow-lg transition-all duration-300" style={{ animationDelay: "100ms" }}>
            <img
              src="/accessproimages/AccessProInnovation.png"
              alt="Dashboard preview"
              className="h-56 w-full rounded-xl object-cover sm:h-72 hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-5">
          <div className="animate-fade-in-up rounded-2xl bg-linear-to-br from-cyan-400 to-sky-500 p-6 text-white md:col-span-2 hover:shadow-lg transition-all duration-300">
            <p className="text-3xl font-black leading-tight">Your Events Can Cut Across</p>
          </div>
          <div className="animate-fade-in-up rounded-2xl bg-slate-900 p-5 text-sm font-semibold text-cyan-200 hover:bg-slate-800 hover:scale-105 transition-all duration-300" style={{ animationDelay: "50ms" }}>Conferences & Exhibitions</div>
          <div className="animate-fade-in-up rounded-2xl bg-blue-900 p-5 text-sm font-semibold text-cyan-200 hover:bg-blue-800 hover:scale-105 transition-all duration-300" style={{ animationDelay: "100ms" }}>Annual General Meetings</div>
          <div className="animate-fade-in-up rounded-2xl bg-slate-800 p-5 text-sm font-semibold text-cyan-200 hover:bg-slate-700 hover:scale-105 transition-all duration-300" style={{ animationDelay: "150ms" }}>Festivals & Concerts</div>
          <div className="animate-fade-in-up rounded-2xl bg-slate-700 p-5 text-sm font-semibold text-cyan-200 hover:bg-slate-600 hover:scale-105 transition-all duration-300" style={{ animationDelay: "200ms" }}>Government Summits</div>
          <div className="animate-fade-in-up rounded-2xl bg-slate-600 p-5 text-sm font-semibold text-cyan-200 hover:bg-slate-500 hover:scale-105 transition-all duration-300" style={{ animationDelay: "250ms" }}>Trade Shows</div>
          <div className="animate-fade-in-up rounded-2xl bg-white p-6 md:col-span-2 hover:shadow-lg transition-all duration-300" style={{ animationDelay: "300ms" }}>
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
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Features</p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl" style={{ animationDelay: "100ms" }}>Powerful tools to make every event a success.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <AnimatedCard 
                  key={tool.title} 
                  delay={idx}
                  className="rounded-2xl border border-slate-200 p-5 hover:border-cyan-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors duration-200">
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
              className="btn-primary inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 hover:shadow-lg"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Our Services</p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl" style={{ animationDelay: "100ms" }}>Seamless setup. Effortless engagement.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="animate-fade-in-up rounded-2xl bg-white p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-black">Set up and manage your event</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Create schedules, guest lists, and access levels.</li>
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Publish branded invites and track RSVPs instantly.</li>
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Coordinate teams with one shared operations dashboard.</li>
              </ul>
            </div>
            <img
              src="/accessproimages/InShot_20251230_130942088.jpg.jpeg"
              alt="Event planning desk"
              className="animate-fade-in-up h-72 w-full rounded-2xl object-cover hover:scale-105 transition-transform duration-300" 
              style={{ animationDelay: "100ms" }}
            />
            <img
              src="/accessproimages/InShot_20251230_133959882.jpg.jpeg"
              alt="Attendee crowd"
              className="animate-fade-in-up h-72 w-full rounded-2xl object-cover hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: "150ms" }}
            />
            <div className="animate-fade-in-up rounded-2xl bg-white p-6 hover:shadow-lg transition-all duration-300" style={{ animationDelay: "200ms" }}>
              <h3 className="text-xl font-black">Engage and interact with attendees</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Fast QR scanning to reduce gate congestion.</li>
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Live communication for updates and announcements.</li>
                <li className="flex gap-2 hover:translate-x-1 transition-transform duration-200"><CheckCircle2 size={16} className="mt-0.5 text-sky-600 shrink-0" />Real-time check-in progress and attendance tracking.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#121e4c] px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Contact Us Today</p>
          <h2 className="animate-fade-in-up mt-4 text-3xl font-black sm:text-4xl" style={{ animationDelay: "100ms" }}>Curious if Access Pro is right for your event?</h2>
          <p className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base" style={{ animationDelay: "200ms" }}>
            Speak with our team to discuss your event type, attendee volume, and workflow goals.
          </p>
          <div className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "300ms" }}>
            <Link href="/contact" className="btn-primary rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-50 hover:shadow-lg">
              Book a free consultation
            </Link>
            <Link href="/sign-in" className="btn-primary rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/10 hover:shadow-lg">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Frequently Asked Questions</p>
            <h2 className="animate-fade-in-up mt-3 text-3xl font-black sm:text-4xl" style={{ animationDelay: "100ms" }}>Got questions? We got answers!</h2>
            <p className="animate-fade-in-up mt-3 text-slate-600" style={{ animationDelay: "150ms" }}>Here are common questions event organizers ask before launch day.</p>
            <Link href="/contact" className="btn-primary animate-fade-in-up mt-5 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 hover:shadow-lg" style={{ animationDelay: "200ms" }}>
              Contact us
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "What event types can I manage with Access Pro?",
              "How does Access Pro handle attendee verification?",
              "Can I use Access Pro for multi-day events?",
              "How secure is attendee data on the platform?",
            ].map((q, idx) => (
              <details 
                key={q} 
                className="animate-fade-in-up rounded-xl border border-slate-200 px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${150 + idx * 50}ms` }}
              >
                <summary className="text-sm font-semibold text-slate-800 group-open:text-cyan-600 transition-colors duration-200">{q}</summary>
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

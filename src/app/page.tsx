"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  QrCode,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ScanLine,
  Laptop,
  CalendarCheck,
  Headset,
} from "lucide-react";

const FixedLandingPage = () => {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  return (
    /* 1. The Root: 'overflow-hidden' prevents horizontal scroll.
       2. The Wrapper: 'max-w-[1400px]' keeps it from getting too wide on huge monitors.
       3. 'mx-auto' centers that wrapper.
       4. 'px-6 sm:px-12' creates the 'air' at the edges.
    */
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Navigation - Added top margin so it doesn't touch the top browser bar */}
        <motion.nav
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex items-center justify-between py-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">
              AccessPro Innovation{" "}
              <span className="text-blue-600 text-[10px] ml-1 uppercase">
                Beta
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              className="hover:text-white transition-colors"
              href="#benefits"
            >
              Benefits
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="#success"
            >
              Success Stories
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="#pricing"
            >
              Pricing
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="/contact"
            >
              Contact
            </Link>
          </div>
          <Link
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            href="/sign-in"
          >
            Sign In
          </Link>
        </motion.nav>

        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="py-12 lg:py-20 grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div variants={fadeUp} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Now powering 500+ events
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Event check-in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                reimagined.
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Stop fighting with spreadsheets. Auto-generate QR passes and track
              attendance in real-time with one intuitive platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group">
                Start Free Trial{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <Link
                className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-2xl transition-all"
                href="/features"
              >
                View Features
              </Link>
            </div>
          </motion.div>

          {/* Glass Card Preview */}
          <motion.div
            variants={fadeUp}
            className="relative group lg:ml-auto w-full max-w-md"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-15"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg">Live Dashboard</h3>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-widest">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">
                    Checked-in
                  </span>
                  <span className="text-3xl font-black">39</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">
                    Pending
                  </span>
                  <span className="text-3xl font-black text-slate-400">32</span>
                </div>
              </div>
              <div className="space-y-3">
                {["Scan QR pass", "Update attendance", "View analytics"].map(
                  (text) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 text-sm text-slate-600 font-medium"
                    >
                      <CheckCircle2 size={16} className="text-blue-500" />{" "}
                      {text}
                    </div>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Benefits + Visuals */}
        <motion.section
          id="benefits"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-24 grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
              Benefits
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4">
              Faster check-in, calmer queues, happier guests.
            </h2>
            <p className="text-slate-600 mb-8">
              AccessPro Innovation centralizes invitations, scanning, and live
              analytics so your team can focus on the guest experience.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Instant QR passes",
                  desc: "Generate and distribute QR codes in seconds.",
                  icon: <QrCode size={18} className="text-blue-600" />,
                },
                {
                  title: "Live attendance",
                  desc: "See who is inside, pending, or arriving.",
                  icon: <BarChart3 size={18} className="text-blue-600" />,
                },
                {
                  title: "No spreadsheet chaos",
                  desc: "Clean, real-time guest list management.",
                  icon: <Zap size={18} className="text-blue-600" />,
                },
                {
                  title: "On-site confidence",
                  desc: "Staff get a clear, guided scan flow.",
                  icon: <ScanLine size={18} className="text-blue-600" />,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <div className="font-semibold mb-1">{item.title}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
                href="/sign-in"
              >
                Start Free Trial
              </Link>
              <Link
                className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold"
                href="/contact"
              >
                Book a demo
              </Link>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[2rem]" />
            <div className="relative grid gap-4">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-lg">
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
                  Field team at work
                </div>
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src="/accessproimages/InShot_20251230_130633031.jpg.jpeg"
                    alt="AccessPro Innovation team using event tools"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-lg">
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
                  Check-in moment
                </div>
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src="/accessproimages/InShot_20251230_132833056.jpg.jpeg"
                    alt="Guest check-in flow using AccessPro Innovation"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Social proof */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-16"
        >
          <motion.div variants={fadeUp} className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Trusted by teams who run high‑stakes events
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["NOVA", "SummitX", "Pulse", "Lumen", "Stageworks"].map((logo) => (
              <div
                key={logo}
                className="h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm font-semibold text-slate-500"
              >
                {logo}
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          id="success"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-20"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Success stories from real event teams
            </h2>
            <p className="text-slate-600">
              Less friction, more control, and happier guests.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "We cut check‑in time by 60% and finally had a live view of arrivals.",
                name: "Amina O.",
                role: "Event Director, Pulse Summit",
              },
              {
                quote:
                  "The QR workflow is clean and staff onboarding takes minutes.",
                name: "Jason K.",
                role: "Ops Lead, Nova Expo",
              },
              {
                quote:
                  "Our VIP lanes stayed smooth all night. The analytics helped us plan the next event.",
                name: "Tola A.",
                role: "Producer, Lumen Nights",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <p className="text-sm text-slate-600 mb-4">“{item.quote}”</p>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.role}</div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Field gallery */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-12"
        >
          <motion.div variants={fadeUp} className="text-center mb-8">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              In the field
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-4">
            {[
              "/accessproimages/InShot_20251230_130942088.jpg.jpeg",
              "/accessproimages/InShot_20251230_132657935.jpg.jpeg",
              "/accessproimages/InShot_20251230_133132783.jpg.jpeg",
            ].map((src) => (
              <div
                key={src}
                className="h-64 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm"
              >
                <img src={src} alt="AccessPro Innovation field team" className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Pricing */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-20"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Transparent pricing for every team size
            </h2>
            <p className="text-slate-600">
              Start free and scale when your events grow.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="grid lg:grid-cols-3 gap-6">
            {[
              {
                title: "Starter",
                price: "Free",
                desc: "For pilots and small meetups",
                features: [
                  "Up to 300 guests",
                  "Single event workspace",
                  "Basic analytics",
                  "Email support",
                ],
              },
              {
                title: "Growth",
                price: "$249 / mo",
                desc: "For recurring events",
                features: [
                  "Up to 5,000 guests",
                  "Multi-lane scanning",
                  "Automations & reminders",
                  "CSV exports",
                ],
                highlight: true,
              },
              {
                title: "Enterprise",
                price: "Custom",
                desc: "For high-volume teams",
                features: [
                  "Unlimited guests",
                  "Dedicated success team",
                  "SSO & security reviews",
                  "SLA support",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className={`p-7 rounded-3xl border ${
                  tier.highlight
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-slate-200"
                } shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold">{tier.title}</div>
                  {tier.highlight ? (
                    <span className="text-[10px] uppercase tracking-widest font-black text-blue-400 bg-blue-500/15 px-2 py-1 rounded-md">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <div className="text-3xl font-black mb-2">{tier.price}</div>
                <p className="text-sm text-slate-600 mb-4">{tier.desc}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ${
                    tier.highlight
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-white"
                  }`}
                  href="/contact"
                >
                  Talk to sales <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Workflow Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="py-24"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              The complete event workflow
            </h2>
            <p className="text-slate-600">
              Everything you need to handle guests at scale.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Collect RSVPs", icon: <Users /> },
              { title: "Generate Passes", icon: <QrCode /> },
              { title: "Scan at Entry", icon: <Zap /> },
              { title: "Track & Export", icon: <BarChart3 /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-500/50 transition-colors group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instant confirmation and data syncing across all devices.
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Process Flow Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-600">
                <Sparkles size={14} />
                Process flow
              </div>
              <h3 className="text-3xl md:text-4xl font-black">
                A clean, predictable flow from invite to insights.
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Every event follows a repeatable path: plan, invite, check-in,
                and analyze. AccessPro Innovation keeps each stage connected so your team
                never scrambles for the latest list, last-minute badge, or
                attendance report.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Average check-in time", value: "4 sec" },
                  { title: "No-show reduction", value: "27%" },
                  { title: "Devices synced", value: "Unlimited" },
                  { title: "Exports supported", value: "CSV, PDF, API" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="text-xs text-slate-500 mb-2">
                      {item.title}
                    </div>
                    <div className="text-2xl font-black">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-5">
              {[
                {
                  title: "Plan & build",
                  icon: <CalendarCheck size={18} />,
                  desc: "Create your event timeline, capacity limits, and entry rules in minutes.",
                },
                {
                  title: "Invite & verify",
                  icon: <Users size={18} />,
                  desc: "Send branded invitations, collect RSVPs, and auto-validate guest data.",
                },
                {
                  title: "Check-in fast",
                  icon: <ScanLine size={18} />,
                  desc: "Scan QR passes or search the list instantly. Offline mode included.",
                },
                {
                  title: "Analyze & share",
                  icon: <BarChart3 size={18} />,
                  desc: "Export attendance, time-on-site, and staff performance reports.",
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                      Step {index + 1}
                    </div>
                    <h4 className="font-bold text-lg">{step.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Insights Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24"
        >
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              variants={fadeUp}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold">Operations snapshot</h4>
                    <p className="text-xs text-slate-500">
                      Live event health at a glance
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200 uppercase tracking-widest">
                  Live
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Active lanes", value: "6" },
                  { label: "Avg wait", value: "1m 12s" },
                  { label: "Peak hour", value: "7:30 PM" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center"
                  >
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="text-2xl font-black mt-2">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Venue capacity alerts with auto-close entry
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Staff assignments updated in real time
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Export to CRM and post-event emails
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-black">
                More than check-in. This is operational clarity.
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Run complex events with confidence. Monitor entry speed, manage
                staff assignments, and keep stakeholders updated without
                toggling between tools.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: "Multi-lane scanning",
                    icon: <ScanLine size={18} />,
                  },
                  {
                    title: "Role-based access",
                    icon: <ShieldCheck size={18} />,
                  },
                  { title: "Premium support", icon: <Headset size={18} /> },
                  {
                    title: "Smart reminders",
                    icon: <CalendarCheck size={18} />,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="text-sm font-semibold">{item.title}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
                  href="/workflow"
                >
                  Explore workflow
                </Link>
                <Link
                  className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-2xl transition-all"
                  href="/pricing"
                >
                  View pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Trust Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black">
              Trusted for secure, high-volume events
            </h3>
            <p className="text-slate-600 mt-3">
              Built with enterprise-grade protections and 24/7 monitoring.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Data encryption",
                desc: "AES-256 at rest and TLS 1.2+ in transit across all environments.",
                icon: <ShieldCheck />,
              },
              {
                title: "Audit-ready logs",
                desc: "Track check-in activity, staff actions, and pass validations with full traceability.",
                icon: <BarChart3 />,
              },
              {
                title: "Uptime guarantee",
                desc: "99.9% SLA with failover scanners and offline sync protections.",
                icon: <Zap />,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 text-center">
            <Link
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
              href="/security"
            >
              Learn about security <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black">
              Frequently asked questions
            </h3>
            <p className="text-slate-600 mt-3">
              Everything teams ask before launch day.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-6">
            {[
              {
                q: "Can we run multiple entrances at once?",
                a: "Yes. Spin up unlimited scan lanes and assign each team member a dedicated device.",
              },
              {
                q: "Does it work without internet?",
                a: "Offline mode keeps scans running and syncs automatically when the connection returns.",
              },
              {
                q: "How do you handle VIP and staff access?",
                a: "Segment your guest list with badges, access rules, and real-time overrides.",
              },
              {
                q: "Can we integrate with our CRM?",
                a: "AccessPro Innovation supports CSV exports, Zapier workflows, and a secure API for custom pipelines.",
              },
            ].map((item) => (
              <motion.div
                key={item.q}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <div className="font-semibold mb-2">{item.q}</div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Footer Section - Added Bottom Margin to keep it off the very bottom edge */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 sm:p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to transform your events?
              </h2>
              <p className="text-blue-100/80 max-w-xl mx-auto text-lg mb-10 leading-relaxed">
                Join 2,000+ organizers already using AccessPro Innovation for seamless
                guest management.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  className="px-10 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-xl"
                  href="/pricing"
                >
                  Get Started for Free
                </Link>
                <Link
                  className="px-10 py-4 bg-blue-700 text-white font-bold rounded-2xl border border-blue-400/30 hover:bg-blue-800 transition-colors"
                  href="/contact"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default FixedLandingPage;

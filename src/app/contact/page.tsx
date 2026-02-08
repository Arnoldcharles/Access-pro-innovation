"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, PhoneCall, MapPin } from "lucide-react";

export default function ContactPage() {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.nav
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16"
        >
          <Link className="flex items-center gap-3" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">AccessPro</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link
              className="hover:text-white transition-colors"
              href="/features"
            >
              Features
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="/workflow"
            >
              Workflow
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="/security"
            >
              Security
            </Link>
          </div>
        </motion.nav>

        <motion.header
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-700 mb-4">
            Contact
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Let’s plan your next event together.
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl text-lg leading-relaxed">
            Tell us about your event size, timeline, and goals. We’ll map out
            the best AccessPro workflow for your team.
          </p>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid lg:grid-cols-[1.2fr,0.8fr] gap-10"
        >
          <motion.form
            variants={fadeUp}
            className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-5 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="First name"
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Last name"
              />
            </div>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Work email"
            />
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Event size (approx.)"
            />
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[140px]"
              placeholder="Tell us about your event"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-3 transition-colors">
              Send request
            </button>
          </motion.form>

          <motion.div variants={fadeUp} className="space-y-4">
            {[
              {
                label: "Email",
                value: "accessproinnovation@gmail.com",
                icon: <Mail size={18} />,
              },
              {
                label: "Phone",
                value: "+234 81 3368 9639",
                icon: <PhoneCall size={18} />,
              },
              { label: "HQ", value: "12, Ogunbekun Street, Ladilak, Lagos, Nigeria", icon: <MapPin size={18} /> },
            ].map((item) => (
              <div
                key={item.label}
                className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500">
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, ShieldCheck, ScanLine, Users, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.nav initial="hidden" animate="show" variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <Link className="flex items-center gap-3" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">A</div>
            <span className="font-bold text-xl tracking-tight">AccessPro</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
            <Link className="hover:text-white transition-colors" href="/workflow">Workflow</Link>
            <Link className="hover:text-white transition-colors" href="/pricing">Pricing</Link>
            <Link className="hover:text-white transition-colors" href="/security">Security</Link>
            <Link className="hover:text-white transition-colors" href="/contact">Contact</Link>
          </div>
        </motion.nav>

        <motion.header initial="hidden" animate="show" variants={stagger} className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
            Feature set
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Everything your team needs to run seamless events.</h1>
          <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
            From RSVPs to scanning and post-event analytics, AccessPro combines the tools organizers use most into a single workflow.
          </p>
        </motion.header>

        <motion.section initial="hidden" animate="show" variants={stagger} className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Smart QR passes', desc: 'Auto-generated passes with branded templates, dynamic refresh, and expiration rules.', icon: <QrCode /> },
            { title: 'Rapid check-in', desc: 'Scan or search guests instantly with offline mode and multi-lane support.', icon: <ScanLine /> },
            { title: 'Attendance analytics', desc: 'Track arrival curves, dwell time, and invite conversion with exportable reports.', icon: <BarChart3 /> },
            { title: 'Team workflows', desc: 'Assign staff roles, permissions, and device access in seconds.', icon: <Users /> },
            { title: 'Enterprise security', desc: 'Encryption, audit logs, and compliance-ready data handling.', icon: <ShieldCheck /> },
            { title: 'Fast deployment', desc: 'Launch in days with onboarding support and a dedicated success team.', icon: <Zap /> },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="p-7 bg-slate-900/50 border border-slate-800 rounded-[2rem]">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-20 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 sm:p-10 md:p-14"
        >
          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-10 items-center">
            <div>
              <h2 className="text-3xl font-black mb-4">Designed for high-stakes event operations.</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                AccessPro keeps your entire event timeline connected, so your team can focus on the guest experience instead of spreadsheets.
              </p>
              <Link className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300" href="/workflow">
                See the process flow <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                Role-based access controls for every staff member
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                Offline scanning with automatic reconciliation
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                Instant exports and CRM sync options
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

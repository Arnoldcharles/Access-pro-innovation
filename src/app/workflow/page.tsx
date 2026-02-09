'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, Users, ScanLine, BarChart3, ArrowRight } from 'lucide-react';

export default function WorkflowPage() {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.nav initial="hidden" animate="show" variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <Link className="flex items-center gap-3" href="/">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="font-bold text-xl tracking-tight">AccessPro Innovation</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link className="hover:text-white transition-colors" href="/features">Features</Link>
            <Link className="hover:text-white transition-colors" href="/pricing">Pricing</Link>
            <Link className="hover:text-white transition-colors" href="/security">Security</Link>
            <Link className="hover:text-white transition-colors" href="/contact">Contact</Link>
          </div>
        </motion.nav>

        <motion.header initial="hidden" animate="show" variants={stagger} className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-600 mb-4">
            Process flow
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">A step-by-step workflow your team can trust.</h1>
          <p className="text-slate-600 mt-4 max-w-2xl text-lg leading-relaxed">
            AccessPro Innovation connects every phase of your event journey, from planning to post-event reporting.
          </p>
        </motion.header>

        <motion.section initial="hidden" animate="show" variants={stagger} className="space-y-6">
          {[
            {
              step: 'Step 1',
              title: 'Plan & configure',
              icon: <CalendarCheck size={20} />,
              desc: 'Build your event, set capacity limits, and configure entry rules. Collaborate with your team in real time.',
              bullets: ['Capacity limits & waitlists', 'Custom ticket tiers', 'Guest data validation'],
            },
            {
              step: 'Step 2',
              title: 'Invite & engage',
              icon: <Users size={20} />,
              desc: 'Send branded invitations, confirm RSVPs, and track responses with automated reminders.',
              bullets: ['Branded email templates', 'RSVP status dashboards', 'Automated reminders'],
            },
            {
              step: 'Step 3',
              title: 'Check-in fast',
              icon: <ScanLine size={20} />,
              desc: 'Scan QR passes or search by name. Keep lanes moving with offline mode and multi-device sync.',
              bullets: ['Offline scanning', 'Multi-lane support', 'Badge printing'],
            },
            {
              step: 'Step 4',
              title: 'Analyze & report',
              icon: <BarChart3 size={20} />,
              desc: 'Share attendance analytics and export reports for stakeholders in minutes.',
              bullets: ['Arrival curve reports', 'Dwell-time tracking', 'CSV and PDF exports'],
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500">{item.step}</div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
              </div>
              <p className="text-slate-600 mb-6">{item.desc}</p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
                {item.bullets.map((bullet) => (
                  <div key={bullet} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    {bullet}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section initial="hidden" animate="show" variants={fadeUp} className="mt-16 text-center">
          <Link className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700" href="/pricing">
            See plans built for your workflow <ArrowRight size={14} />
          </Link>
        </motion.section>
      </div>
    </div>
  );
}

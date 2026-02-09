'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileCheck2 } from 'lucide-react';

export default function SecurityPage() {
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
            <Link className="hover:text-white transition-colors" href="/workflow">Workflow</Link>
            <Link className="hover:text-white transition-colors" href="/pricing">Pricing</Link>
            <Link className="hover:text-white transition-colors" href="/contact">Contact</Link>
          </div>
        </motion.nav>

        <motion.header initial="hidden" animate="show" variants={stagger} className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 mb-4">
            Security & compliance
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Security is built into every scan.</h1>
          <p className="text-slate-600 mt-4 max-w-2xl text-lg leading-relaxed">
            AccessPro Innovation uses enterprise-grade controls so guest data stays protected, auditable, and compliant across every event.
          </p>
        </motion.header>

        <motion.section initial="hidden" animate="show" variants={stagger} className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Encryption everywhere',
              desc: 'AES-256 encryption at rest and TLS 1.2+ in transit across all systems.',
              icon: <Lock />,
            },
            {
              title: 'Access controls',
              desc: 'Role-based permissions and device-level check-in restrictions.',
              icon: <ShieldCheck />,
            },
            {
              title: 'Audit visibility',
              desc: 'Full activity logs for guest scans, staff changes, and data exports.',
              icon: <Eye />,
            },
            {
              title: 'Compliance ready',
              desc: 'GDPR-ready data handling and secure retention policies.',
              icon: <FileCheck2 />,
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="p-7 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-16 bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 md:p-14 shadow-sm"
        >
          <h2 className="text-2xl font-black mb-4">Security commitments</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">99.9% uptime SLA for enterprise plans</div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">Quarterly penetration testing reviews</div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">Dedicated incident response coverage</div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

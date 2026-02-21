'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 pb-12">
        <motion.header initial="hidden" animate="show" variants={stagger} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-700 mb-4">
            Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Plans that scale with your events.</h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose a plan that matches your audience size, support needs, and analytics depth.
          </p>
        </motion.header>

        <motion.section initial="hidden" animate="show" variants={stagger} className="grid lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Starter',
              desc: 'Perfect for small events and pilots.',
              features: ['Up to 300 guests', 'Single venue check-in', 'Basic analytics', 'Email support'],
            },
            {
              title: 'Growth',
              desc: 'For teams running recurring events.',
              features: ['Up to 5,000 guests', 'Multi-lane scanning', 'Automations & reminders', 'CSV exports'],
              highlight: true,
            },
            {
              title: 'Enterprise',
              desc: 'High-volume events and enterprise controls.',
              features: ['Unlimited guests', 'Dedicated success team', 'SSO & advanced security', 'SLA + 24/7 support'],
            },
          ].map((tier) => (
            <motion.div
              key={tier.title}
              variants={fadeUp}
              className={`p-8 rounded-[2rem] border ${
                tier.highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
              } shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{tier.title}</h3>
                {tier.highlight && (
                  <span className="text-[10px] uppercase tracking-widest font-black text-blue-300 bg-blue-500/20 px-2 py-1 rounded-md">
                    Most popular
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-6">{tier.desc}</p>
              <div className="space-y-3 text-sm text-slate-600 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold ${
                  tier.highlight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                href="/contact"
              >
                Talk to sales <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </motion.section>

        <motion.section initial="hidden" animate="show" variants={fadeUp} className="mt-16 text-center text-sm text-slate-600">
          All plans include GDPR-ready data handling, unlimited staff users, and standard reporting.
        </motion.section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const BenefitsPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 pb-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Benefits
          </div>
          <h1 className="text-3xl md:text-5xl font-black mt-3">
            Faster check‑in, calmer queues, happier guests.
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl">
            AccessPro Innovation centralizes invitations, scanning, and live analytics so
            your team can focus on the guest experience.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 grid md:grid-cols-2 gap-6"
        >
          {[
            "Instant QR passes with automated delivery",
            "Live attendance tracking across all entrances",
            "Real-time insights for better staffing",
            "Clean guest lists without spreadsheet chaos",
          ].map((item) => (
            <div
              key={item}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-start gap-3"
            >
              <CheckCircle2 size={18} className="text-emerald-500 mt-1" />
              <div className="text-slate-700">{item}</div>
            </div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
          >
            Start free
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold inline-flex items-center gap-2"
          >
            View pricing <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BenefitsPage;

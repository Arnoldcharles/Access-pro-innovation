"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SuccessStoriesPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 pb-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="text-xs uppercase tracking-widest text-slate-500 mt-6">
            Success Stories
          </div>
          <h1 className="text-3xl md:text-5xl font-black mt-3">
            Real event teams. Real results.
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl">
            How teams used AccessPro Innovation to reduce check‑in time, improve
            guest flow, and deliver smoother events.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 grid md:grid-cols-3 gap-6"
        >
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

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Book a demo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;

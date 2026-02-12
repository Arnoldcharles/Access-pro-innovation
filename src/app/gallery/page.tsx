"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MarketingNav from "../../components/MarketingNav";

const images = [
  "/accessproimages/InShot_20251230_130942088.jpg.jpeg",
  "/accessproimages/InShot_20251230_132657935.jpg.jpeg",
  "/accessproimages/InShot_20251230_133132783.jpg.jpeg",
  "/accessproimages/InShot_20251230_133326045.jpg.jpeg",
  "/accessproimages/InShot_20251230_133529787.jpg.jpeg",
  "/accessproimages/InShot_20251230_130633031.jpg.jpeg",
  "/accessproimages/InShot_20251230_132833056.jpg.jpeg",
];

const GalleryPage = () => {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 pb-16">
        <MarketingNav />
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex flex-col gap-8"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Book a demo <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Gallery
            </div>
            <h1 className="text-3xl md:text-5xl font-black">
              AccessPro Innovation in the field
            </h1>
            <p className="text-slate-600 max-w-2xl">
              Real teams. Real events. Real results. Explore how our staff run smooth
              check-in experiences on the ground.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {images.map((src, index) => (
              <motion.div
                key={src}
                variants={fadeUp}
                className={`relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white ${
                  index % 5 === 0 ? "lg:col-span-2" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <img
                  src={src}
                  alt="AccessPro Innovation field team"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GalleryPage;

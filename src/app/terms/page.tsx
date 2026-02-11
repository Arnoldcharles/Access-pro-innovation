"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link className="text-sm text-slate-600 hover:text-slate-900" href="/">
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-slate-600 mb-6">
            These terms govern the use of AccessPro Innovation. By accessing
            the platform, you agree to comply with these terms. Full legal terms
            will be published here.
          </p>
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Use of the platform is subject to applicable laws and our
              acceptable use policy.
            </p>
            <p>
              We may update these terms periodically. Continued use of the
              platform constitutes acceptance of any changes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
 
const MarketingNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
  };

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex items-center justify-between py-10"
      >
        <Link href="/" className="inline-flex items-center">
          <img
            src="/accessproimages/icon.png"
            alt="Access Pro Innovation"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            className="hover:text-slate-900 transition-colors underline-offset-8 hover:underline"
            href="/benefits"
          >
            Benefits
          </Link>
          <Link
            className="hover:text-slate-900 transition-colors underline-offset-8 hover:underline"
            href="/success-stories"
          >
            Success Stories
          </Link>
          <Link
            className="hover:text-slate-900 transition-colors underline-offset-8 hover:underline"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="hover:text-slate-900 transition-colors underline-offset-8 hover:underline"
            href="/contact"
          >
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            href="/sign-in"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
            <motion.div
              className="absolute right-4 top-4 w-[min(92vw,380px)] rounded-2xl bg-white border border-slate-200 shadow-xl p-5"
              initial={{ x: 36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 36, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold">Menu</div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid gap-3 text-sm font-semibold text-slate-700">
                <Link
                  href="/benefits"
                  className="py-2 border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Benefits
                </Link>
                <Link
                  href="/success-stories"
                  className="py-2 border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Success Stories
                </Link>
                <Link
                  href="/pricing"
                  className="py-2 border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className="py-2 border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/sign-in"
                  className="py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default MarketingNav;

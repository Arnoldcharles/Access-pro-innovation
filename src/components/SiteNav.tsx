"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/10 bg-[linear-gradient(160deg,#070b1a_0%,#0a1737_50%,#111f44_100%)] px-4 py-4 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm font-black tracking-[0.2em] text-white">
              ACCESS PRO
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex">
              <Link href="/features">Features</Link>
              <Link href="/benefits">Benefits</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/join"
                className="rounded-full border border-cyan-300/70 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                Get started
              </Link>
              <Link
                href="/sign-in"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
              >
                Login
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
          <AnimatePresence>
            {mobileOpen ? (
              <>
                <motion.button
                  type="button"
                  className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Close menu"
                />
                <motion.div
                  id="mobile-nav"
                  className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-40 overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 p-3 text-sm shadow-2xl shadow-cyan-900/40 md:hidden"
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="grid gap-1.5"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
                    }}
                  >
                    {[
                      { href: "/features", label: "Features" },
                      { href: "/benefits", label: "Benefits" },
                      { href: "/pricing", label: "Pricing" },
                      { href: "/contact", label: "Contact" },
                    ].map((item) => (
                      <motion.div
                        key={item.href}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.18 }}
                      >
                        <Link
                          href={item.href}
                          className="block rounded-2xl px-4 py-3 font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-3">
                    <Link
                      href="/join"
                      className="rounded-full border border-cyan-300/70 px-4 py-2.5 text-center text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get started
                    </Link>
                    <Link
                      href="/sign-in"
                      className="rounded-full bg-white px-4 py-2.5 text-center text-xs font-semibold text-slate-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

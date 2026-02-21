import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import SiteNav from "../components/SiteNav";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Access Pro Innovation",
  description:
    "Access Pro Innovation is an event technology platform for registration, QR check-ins, attendee management, and event analytics.",
  keywords: [
    "Access Pro Innovation",
    "event management platform",
    "event check-in software",
    "QR code check-in",
    "attendee management",
    "event registration Nigeria",
    "event analytics",
    "conference check-in system",
  ],
  authors: [{ name: "Access Pro Innovation" }],
  creator: "Access Pro Innovation",
  publisher: "Access Pro Innovation",
  verification: {
    google: "shWB2dySOoGU9v7CRcwie1vq14yGovZ5ghvFx3fRdWo",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <SiteNav />
        {children}
        <footer className="mt-16 border-t border-slate-200 bg-white text-slate-600">
          <div className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:px-16">
            <div className="grid gap-10 md:grid-cols-[1.2fr,1fr,0.9fr,1fr]">
              <div>
                <div className="text-lg font-black text-slate-900">Access Pro</div>
                <div className="mt-2 text-sm text-slate-500">
                  Premium event check-in, guest flow, and on-site analytics for modern organizers.
                </div>
              </div>
              <div>
                <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">Quick Links</div>
                <nav className="grid grid-cols-2 gap-2 text-sm">
                  <a className="hover:text-slate-900" href="/">
                    Home
                  </a>
                  <a className="hover:text-slate-900" href="/features">
                    Benefits
                  </a>
                  <a className="hover:text-slate-900" href="/pricing">
                    Pricing
                  </a>
                  <a className="hover:text-slate-900" href="/workflow">
                    Success Stories
                  </a>
                  <a className="hover:text-slate-900" href="/contact">
                    Contact
                  </a>
                  <a className="hover:text-slate-900" href="/terms">
                    Terms &amp; Conditions
                  </a>
                  <a className="hover:text-slate-900" href="/privacy">
                    Privacy Policy
                  </a>
                </nav>
              </div>
              <div>
                <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">Social</div>
                <div className="flex items-center gap-3">
                  <a
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    href="https://facebook.com"
                    aria-label="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                      className="text-slate-700"
                      fill="currentColor"
                    >
                      <path d="M13.5 9.5h3V6.2c0-.3-.2-.6-.6-.7-1.2-.2-2.4-.3-3.4-.3-3.3 0-5.5 2-5.5 5.6v2.7H4.6c-.3 0-.6.3-.6.6v3c0 .3.3.6.6.6H7v6.8c0 .3.2.5.5.5h3.4c.3 0 .5-.2.5-.5v-6.8h2.9c.3 0 .6-.2.6-.6l.4-3c0-.4-.2-.7-.6-.7h-3.3V11c0-1 .5-1.5 2.1-1.5z" />
                    </svg>
                  </a>
                  <a
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    href="https://instagram.com"
                    aria-label="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                      className="text-slate-700"
                      fill="currentColor"
                    >
                      <path d="M7.2 3.5h9.6c2 0 3.7 1.6 3.7 3.7v9.6c0 2-1.6 3.7-3.7 3.7H7.2c-2 0-3.7-1.6-3.7-3.7V7.2c0-2 1.6-3.7 3.7-3.7zm0 1.8c-1 0-1.8.8-1.8 1.8v9.6c0 1 .8 1.8 1.8 1.8h9.6c1 0 1.8-.8 1.8-1.8V7.2c0-1-.8-1.8-1.8-1.8H7.2zm4.8 3.1a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zm5.6-3.5a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">Contact</div>
                <div className="space-y-2 text-sm text-slate-600">
                  <a
                    className="block hover:text-slate-900"
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=accessproinnovation@gmail.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    accessproinnovation@gmail.com
                  </a>
                  <a className="block hover:text-slate-900" href="tel:+2348133689639">
                    +234 81 3368 9639
                  </a>
                  <a
                    className="block hover:text-slate-900"
                    href="https://maps.google.com/?q=12,+Ogunbekun+Street,+Ladilak,+Lagos"
                    target="_blank"
                    rel="noreferrer"
                  >
                    12, Ogunbekun Street, Ladilak, Lagos
                  </a>
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">Newsletter</div>
                  <form className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Email address"
                      type="email"
                    />
                    <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>(c) 2026 Access Pro. All rights reserved.</span>
              <span>Built for modern event teams.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

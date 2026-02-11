import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AccessPro Innovation",
  description: "AccessPro Innovation — event check-in reimagined.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="mt-16 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-600">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900">
                    AccessPro Innovation
                  </div>
                  <div className="text-sm text-slate-500">
                    Event check-in reimagined.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition"
                    href="https://facebook.com"
                    aria-label="Facebook"
                  >
                    f
                  </a>
                  <a
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition"
                    href="https://instagram.com"
                    aria-label="Instagram"
                  >
                    i
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    Quick Links
                  </div>
                  <nav className="flex flex-wrap items-center gap-3 text-sm">
                    <a className="hover:text-slate-900" href="/">
                      Home
                    </a>
                    <span className="text-slate-300">|</span>
                    <a className="hover:text-slate-900" href="/features"> 
                      Benefits
                    </a>
                    <span className="text-slate-300">|</span>
                    <a className="hover:text-slate-900" href="/pricing">
                      Pricing
                    </a>
                    <span className="text-slate-300">|</span>
                    <a className="hover:text-slate-900" href="/workflow">
                      Success Stories
                    </a>
                    <span className="text-slate-300">|</span>
                    <a className="hover:text-slate-900" href="/contact">
                      Contact
                    </a>
                  </nav>
                </div>
                <div className="text-sm">
                  <a className="hover:text-slate-900" href="/terms">
                    Terms &amp; Conditions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

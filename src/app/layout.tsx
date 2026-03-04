import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ConditionalSiteNav from "../components/ConditionalSiteNav";
import ConditionalFooter from "../components/ConditionalFooter";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Access Pro Innovation",
  description:
    "Access Pro Innovation provides event registration, QR check-ins, attendee management, and event analytics.",
  email: "accessproinnovation@gmail.com",
  telephone: "+2348133689639",
  address: {
    "@type": "PostalAddress",
    streetAddress: "12, Ogunbekun Street, Ladilak",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  sameAs: [
    "https://www.facebook.com/share/18LBPkeZC6/?mibextid=wwXIfr",
    "https://www.instagram.com/accesspro_innovation?igsh=YmRxZ3U2dGhsb2Qx&utm_source=qr",
  ],
};

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
    google: "/googled1bf1f0cd09c1268.html",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ConditionalSiteNav />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}

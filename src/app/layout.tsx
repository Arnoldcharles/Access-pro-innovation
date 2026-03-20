import type { Metadata } from "next";
import Script from "next/script";
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

const watiWidgetOptions = {
  enabled: true,
  chatButtonSetting: {
    backgroundColor: "#00e785",
    ctaText: "Chat with us",
    borderRadius: "25",
    marginLeft: "0",
    marginRight: "20",
    marginBottom: "20",
    ctaIconWATI: false,
    position: "right",
  },
  brandSetting: {
    brandName: "Access Pro",
    brandSubTitle: "",
    brandImg: "https://www.wati.io/wp-content/uploads/2023/04/Wati-logo.svg",
    welcomeText: "Hi there!\nHow can I help you?",
    messageText: "Hello, %0A I have a question about {{page_link}}",
    backgroundColor: "#00e785",
    ctaText: "Chat with us",
    borderRadius: "25",
    autoShow: false,
    phoneNumber: "2348133689639",
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
        <Script id="ap-theme-init" strategy="beforeInteractive">
          {`(function () {
  try {
    var theme = window.localStorage.getItem('ap:theme');
    if (theme) document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          src="https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?64108"
          strategy="afterInteractive"
        />
        <Script id="wati-widget-init" strategy="afterInteractive">
          {`(function () {
  if (typeof window === 'undefined') return;
  if (window.__watiWidgetInitialized) return;
  window.__watiWidgetInitialized = true;

  var options = ${JSON.stringify(watiWidgetOptions)};
  var attempt = 0;
  var maxAttempts = 200; // ~10s at 50ms

  function init() {
    attempt++;
    if (typeof window.CreateWhatsappChatWidget === 'function') {
      window.CreateWhatsappChatWidget(options);
      return;
    }
    if (attempt < maxAttempts) setTimeout(init, 50);
  }

  init();
})();`}
        </Script>
        <ConditionalSiteNav />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}

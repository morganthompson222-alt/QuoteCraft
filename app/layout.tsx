import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { Providers } from "../components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://jobstacker.app"),
  title: {
    default: "JobStacker — Quote & Job Management for Tradespeople",
    template: "%s — JobStacker",
  },
  description:
    "JobStacker is the all-in-one quote and job management app for tradespeople. Create professional quotes, send branded PDFs, schedule jobs, and manage customers — without a spreadsheet.",
  alternates: {
    canonical: "https://jobstacker.app",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    title: "JobStacker — Quote & Job Management for Tradespeople",
    description:
      "The all-in-one workspace for tradespeople. Create quotes, send PDFs, schedule jobs, and manage customers — without a spreadsheet.",
    url: "https://jobstacker.app",
    siteName: "JobStacker",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobStacker — Quote & Job Management for Tradespeople",
    description:
      "Create professional quotes, send branded PDFs, schedule jobs, and manage customers — all in one place.",
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "JobStacker",
      url: "https://jobstacker.app",
      description:
        "Quote and job management software for tradespeople. Create professional quotes, track jobs, and manage customers.",
    },
    {
      "@type": "WebSite",
      name: "JobStacker",
      url: "https://jobstacker.app",
      description:
        "The all-in-one quote and job management app for tradespeople.",
      inLanguage: "en-GB",
    },
    {
      "@type": "SoftwareApplication",
      name: "JobStacker",
      url: "https://jobstacker.app",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, macOS, Windows, iOS, Android",
      description:
        "Quote and job management software for tradespeople. Create quotes, send PDFs, schedule jobs, and manage customers.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
      },
      browserRequirements: "Requires JavaScript",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1F6B4F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="JobStacker" />
        <meta name="google-site-verification" content="AWnsXGxv6EkcNOo08HXZjZcH0WFBFzjt6cAsHjR_Nds" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}

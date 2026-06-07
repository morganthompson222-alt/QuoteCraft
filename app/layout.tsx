import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { Providers } from "../components/Providers";

export const metadata: Metadata = {
  title: {
    default: "QuoteCraft — Customer quotes for tradespeople",
    template: "%s — QuoteCraft",
  },
  description:
    "Create professional customer quotes in minutes. QuoteCraft helps tradespeople manage estimates, track customers, and generate PDFs.",
  openGraph: {
    title: "QuoteCraft",
    description:
      "Create professional customer quotes in minutes. Manage estimates, track customers, and generate PDFs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#047857" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

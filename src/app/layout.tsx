import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import AffiliateTracker from "@/components/AffiliateTracker";

export const metadata: Metadata = {
  title: "Houses of Medusa | Luxury Outlet Retail",
  description: "We don't sell fashion. We sell status. Discover authentic luxury from verified factory outlets with private pricing access.",
  keywords: ["luxury", "fashion", "outlet", "designer", "handbags", "watches", "accessories"],
  openGraph: {
    title: "Houses of Medusa | Luxury Outlet Retail",
    description: "We don't sell fashion. We sell status.",
    type: "website",
    locale: "en_US",
    siteName: "Houses of Medusa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Houses of Medusa | Luxury Outlet Retail",
    description: "We don't sell fashion. We sell status.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <Providers>
          <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}

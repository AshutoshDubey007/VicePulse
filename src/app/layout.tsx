import type { Metadata, Viewport } from 'next';
import './globals.css';
import { pricedown, bowlbyOne, archivo, spaceMono } from './fonts';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveTicker } from '@/components/LiveTicker';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { siteConfig } from '@/lib/seo/constants';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo/schema';

export const viewport: Viewport = {
  themeColor: '#111114',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — GTA VI Discovery, Map & Research Intelligence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  keywords: [
    'GTA 6',
    'GTA VI',
    'Grand Theft Auto VI',
    'Leonida',
    'Vice City',
    'GTA 6 Map',
    'Interactive Map',
    'Hidden Locations',
    'Rare Vehicles',
    'Easter Eggs',
    'Random Encounters',
    'GTA 6 Secrets',
    'GTA 6 Discoveries',
    'Gaming Intelligence',
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Autonomous GTA VI Discovery & Intelligence`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Discovery & Intelligence Network')}&category=SYSTEM&badge=LIVE%20NETWORK`,
        width: 1200,
        height: 630,
        alt: 'VicePulse GTA VI Intelligence Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — GTA VI Discovery & Intelligence`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Discovery & Intelligence Network')}&category=SYSTEM&badge=LIVE%20NETWORK`],
    creator: '@VicePulseHQ',
    site: '@VicePulseHQ',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: siteConfig.verification.google || undefined,
    other: siteConfig.verification.bing ? { 'msvalidate.01': [siteConfig.verification.bing] } : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html
      lang="en"
      className={`${pricedown.variable} ${bowlbyOne.variable} ${archivo.variable} ${spaceMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Bowlby+One&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Load Razorpay Checkout SDK asynchronously */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />

        {/* Global Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ink text-cream selection:bg-orange selection:text-ink font-body pb-16 md:pb-0 overflow-x-hidden">
        <LiveTicker />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}

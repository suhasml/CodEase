import type { Metadata, Viewport } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics';
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from 'next/font/google';
import SolanaAddressValidator from '@/components/Wallet/SolanaAddressValidator';
import './globals.css';



// Font setup
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata for SEO
const title =
  'CodEase';
const description =
  'Build and publish Chrome extensions without coding. CodEase is the leading vibe-coding platform for creating custom browser extensions. Start building your extension in minutes.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.codease.pro'),
  title,
  description,
  keywords: [
    'vibe coding',
    'chrome extension builder no-code',
    'vibe coding platform',
    'vibe coding tools',
    'chrome extension development',
    'chrome extension development tools',
    'chrome extension development platform',
    'chrome extension development without coding',
    'chrome extension development tools no-code',
    'chrome extension development platform no-code',
    'vibe coding tools for chrome extension development',
    'chrome extension builder',
    'no-code extension builder',
    'browser extension creator',
    'chrome extension maker',
    'no-code tools',
    'extension development',
    'custom chrome extensions',
    'browser automation',
    'no-code platform',
    'extension without coding',
    'chrome extension',
    'browser extension',
  ],
  authors: [{ name: 'CodEase' }],
  creator: 'CodEase',
  publisher: 'CodEase',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.codease.pro',
    title,
    description,
    siteName: 'CodEase',
    images: [
      {
        url: 'https://www.codease.pro/opengraph-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'CodEase - No-Code Chrome Extension Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@zuess05', // Replace with your actual Twitter handle if different
    images: ['https://www.codease.pro/opengraph-image.jpeg'],
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
};

// Viewport settings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5, // Better accessibility
  themeColor: '#ffffff', // Brand color
  colorScheme: 'light dark',
};

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://www.codease.pro" />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-black`}
      >
        <SolanaAddressValidator />
        <Toaster position="top-right" />

        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

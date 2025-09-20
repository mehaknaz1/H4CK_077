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
  title: "Smart Inventory Analyzer | AI-Powered Inventory Intelligence",
  description: "Industry-grade inventory management with AI-powered insights, predictive analytics, festival recommendations, and weather-based suggestions. Optimize your inventory with advanced business intelligence.",
  keywords: [
    "inventory management",
    "AI analytics",
    "predictive inventory",
    "business intelligence",
    "inventory optimization",
    "smart analytics",
    "inventory insights",
    "supply chain",
    "inventory forecasting"
  ],
  authors: [{ name: "Smart Inventory Team" }],
  creator: "Smart Inventory Analytics",
  publisher: "Smart Inventory Platform",
  applicationName: "Smart Inventory Analyzer",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Smart Inventory Analyzer | AI-Powered Business Intelligence",
    description: "Transform your inventory management with AI-powered insights, predictive analytics, and intelligent recommendations.",
    siteName: "Smart Inventory Analyzer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Inventory Analyzer",
    description: "AI-powered inventory intelligence for modern businesses",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#0f0f0f",
  colorScheme: "dark",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="msapplication-TileColor" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-950 text-white selection:bg-blue-600 selection:text-white`}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          {children}
        </div>
      </body>
    </html>
  );
}

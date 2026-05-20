import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Head from "next/head";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enlune",
  description: "Intelligent software for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // <body className="min-h-full bg-page text-ink">{children}</body>
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <body className="min-h-full text-ink">
        <Analytics />
        {children}
      </body>
    </html>
  );
}

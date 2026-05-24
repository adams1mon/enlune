import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Channel Analyzer MVP',
  description: 'A lightweight YouTube channel analyzer with outlier detection, transcript heuristics, saved snapshots, and comparison.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

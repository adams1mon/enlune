import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Analyzer | Enlune',
  description: 'Analyze YouTube channels, inspect saved snapshots, and run transcript analysis on individual videos.',
};

export default function YouTubeAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

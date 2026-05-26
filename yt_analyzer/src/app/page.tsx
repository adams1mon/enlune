import { redirect } from 'next/navigation';

import { RootEntry } from '@/components/dashboard/root-entry';
import { listSavedAnalyses } from '@/server/store/analysis-store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const analyses = await listSavedAnalyses();

  if (analyses.length) {
    redirect('/analyses');
  }

  return <RootEntry />;
}

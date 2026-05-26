import { ControlCenter } from '@/components/dashboard/control-center';
import { listSavedAnalyses } from '@/server/store/analysis-store';

export const dynamic = 'force-dynamic';

export default async function AnalysesPage() {
  const analyses = await listSavedAnalyses();

  return <ControlCenter analyses={analyses} />;
}

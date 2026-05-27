import { cn } from '@/tools/youtube-analyzer/lib/utils';

interface StatusPillProps {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StatusPillProps['tone']>, string> = {
  neutral: 'border-white/10 bg-white/5 text-zinc-200',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  danger: 'border-rose-500/20 bg-rose-500/10 text-rose-200',
};

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex justify-center items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}

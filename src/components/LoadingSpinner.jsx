import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex min-h-32 items-center justify-center rounded-lg border border-white/10 bg-surface ${className}`} role="status" aria-live="polite">
      <Loader2 aria-hidden="true" size={28} className="animate-spin text-civic" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

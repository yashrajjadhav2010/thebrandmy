import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[65] flex items-center gap-2.5 rounded-full bg-[#10141D] border border-amber-400/35 px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-300 shrink-0" />
      <span>Offline mode — viewing cached experience</span>
    </div>
  );
}

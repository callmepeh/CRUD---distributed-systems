// client/src/components/StatCard.tsx
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string; // classes de cor do ícone (ex.: "bg-blue-50 text-blue-600")
}

export default function StatCard({ label, value, icon: Icon, iconClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <span className={`shrink-0 p-3 rounded-xl ${iconClass}`}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

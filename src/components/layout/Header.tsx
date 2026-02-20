import { Bell, Building2 } from 'lucide-react';
import { useAuth } from '../../App';
import { useIsMobile } from '../../hooks/useIsMobile';

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  employee: 'Сотрудник',
};

export default function Header({ title }: { title: string }) {
  const { role } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-cyan-400 font-bold text-sm tracking-wider">A</span>
          <h2 className="text-base font-semibold text-white truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Bell size={16} className="text-white/60" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          </button>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
            {role?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-10 py-6 border-b border-white/5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 text-sm text-white/50">
          <Building2 size={15} />
          <span>Adaptix Demo</span>
        </div>

        <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-white/60" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {role?.[0]?.toUpperCase()}
          </div>
          <p className="text-sm text-white/80 font-medium">{roleLabels[role || ''] || ''}</p>
        </div>
      </div>
    </header>
  );
}

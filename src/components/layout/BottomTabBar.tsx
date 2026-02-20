import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, ArrowLeftRight, Users,
  Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../App';

const allTabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд', roles: ['admin', 'manager', 'employee'] },
  { to: '/schedule', icon: CalendarDays, label: 'Расписание', roles: ['admin', 'manager', 'employee'] },
  { to: '/shift-exchange', icon: ArrowLeftRight, label: 'Биржа', roles: ['admin', 'manager', 'employee'] },
  { to: '/employees', icon: Users, label: 'Люди', roles: ['admin', 'manager'] },
  { to: '/settings', icon: Settings, label: 'Настройки', roles: ['admin', 'manager'] },
];

export default function BottomTabBar() {
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const tabs = allTabs.filter(t => role && t.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-sidebar border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-white/40 active:text-white/60'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] leading-tight">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => { setRole(null); navigate('/'); }}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] text-white/30 active:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[10px] leading-tight">Выход</span>
        </button>
      </div>
    </nav>
  );
}

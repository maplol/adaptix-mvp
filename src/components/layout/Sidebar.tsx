import { createContext, useContext, useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, ArrowLeftRight,
  Blocks, PenTool, Settings, LogOut, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../../App';

interface SidebarCtx {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed(p => !p) }}>
      {children}
    </SidebarContext.Provider>
  );
}

const allLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд', roles: ['admin', 'manager', 'employee'] },
  { to: '/schedule', icon: CalendarDays, label: 'Расписание', roles: ['admin', 'manager', 'employee'] },
  { to: '/employees', icon: Users, label: 'Сотрудники', roles: ['admin', 'manager'] },
  { to: '/shift-exchange', icon: ArrowLeftRight, label: 'Биржа смен', roles: ['admin', 'manager', 'employee'] },
  { to: '/rule-builder', icon: Blocks, label: 'Rule Builder', roles: ['admin'] },
  { to: '/ui-designer', icon: PenTool, label: 'UI Designer', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Настройки', roles: ['admin', 'manager'] },
];

export default function Sidebar() {
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebar();
  const links = allLinks.filter(l => l.roles.includes(role));

  return (
    <aside
      className={`glass-sidebar h-full flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`flex items-center pt-7 pb-6 ${collapsed ? 'px-0 justify-center' : 'px-7 justify-between'}`}>
        <div className={`flex flex-col gap-1.5 overflow-hidden ${collapsed ? 'items-center' : ''}`}>
          <h1 className={`font-bold tracking-wider text-cyan-400 whitespace-nowrap transition-all duration-300 ${
            collapsed ? 'text-xl' : 'text-2xl'
          }`}>
            {collapsed ? 'A' : 'ADAPTIX'}
          </h1>
          <p className={`text-xs text-white/40 whitespace-nowrap transition-all duration-300 ${
            collapsed ? 'opacity-0 h-0' : 'opacity-100'
          }`}>
            WFM Platform
          </p>
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/60"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      <nav className={`flex-1 flex flex-col gap-1.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'}`}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm transition-all duration-150 ${
                collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'
              } ${
                isActive
                  ? 'bg-cyan-400/15 text-cyan-400 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className={`py-5 border-t border-white/5 flex flex-col gap-2 ${collapsed ? 'px-2' : 'px-4'}`}>
        {collapsed && (
          <button
            onClick={toggle}
            className="flex items-center justify-center py-3 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 w-full transition-all"
            title="Развернуть"
          >
            <ChevronsRight size={18} />
          </button>
        )}
        <button
          onClick={() => { setRole(null); navigate('/'); }}
          title={collapsed ? 'Выйти' : undefined}
          className={`flex items-center gap-3 py-3 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-white/5 w-full transition-all ${
            collapsed ? 'px-0 justify-center' : 'px-4'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          }`}>
            Выйти
          </span>
        </button>
      </div>
    </aside>
  );
}

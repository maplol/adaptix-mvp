import { createContext, useContext, useState, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar, { SidebarProvider } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomTabBar from './components/layout/BottomTabBar';
import { ToastProvider } from './components/ui/Toast';
import { useIsMobile } from './hooks/useIsMobile';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import EmployeesPage from './pages/EmployeesPage';
import ShiftExchangePage from './pages/ShiftExchangePage';
import RuleBuilderPage from './pages/RuleBuilderPage';
import UIDesignerPage from './pages/UIDesignerPage';
import SettingsPage from './pages/SettingsPage';

type Role = 'admin' | 'manager' | 'employee';

interface AuthCtx {
  role: Role | null;
  setRole: (r: Role | null) => void;
}

const AuthContext = createContext<AuthCtx>({ role: null, setRole: () => {} });
export const useAuth = () => useContext(AuthContext);

const pageTitles: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/schedule': 'Расписание смен',
  '/employees': 'Сотрудники',
  '/shift-exchange': 'Биржа смен',
  '/rule-builder': 'Visual Rule Builder',
  '/ui-designer': 'UI Designer',
  '/settings': 'Настройки',
};

function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Adaptix';
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full relative z-10">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-full w-full relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header title={title} />
          <main className="flex-1 overflow-y-auto px-10 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      <ToastProvider>
        <div className="bg-blobs" />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/shift-exchange" element={<ShiftExchangePage />} />
              <Route path="/rule-builder" element={<AdminRoute><RuleBuilderPage /></AdminRoute>} />
              <Route path="/ui-designer" element={<AdminRoute><UIDesignerPage /></AdminRoute>} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

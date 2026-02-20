import { useNavigate } from 'react-router-dom';
import { Shield, Briefcase, User } from 'lucide-react';
import { useAuth } from '../App';

const roles = [
  { id: 'admin' as const, label: 'Администратор', desc: 'Полный доступ: Rule Builder, UI Designer, настройки', icon: Shield, color: 'from-cyan-400 to-blue-600' },
  { id: 'manager' as const, label: 'Менеджер', desc: 'Управление сменами, сотрудниками и биржей', icon: Briefcase, color: 'from-violet-400 to-purple-600' },
  { id: 'employee' as const, label: 'Сотрудник', desc: 'Просмотр расписания, обмен сменами', icon: User, color: 'from-emerald-400 to-teal-600' },
];

export default function LoginPage() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: 'admin' | 'manager' | 'employee') => {
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="h-full flex items-center justify-center relative z-10 p-4">
      <div className="glass-strong rounded-3xl p-10 max-w-lg w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-wider text-cyan-400 mb-2">ADAPTIX</h1>
          <p className="text-white/40 text-sm">WFM-платформа нового поколения</p>
          <p className="text-white/25 text-xs mt-1">Low-Code решение для управления персоналом</p>
        </div>

        <p className="text-white/60 text-sm text-center mb-6">Выберите роль для входа в демо:</p>

        <div className="space-y-3">
          {roles.map(({ id, label, desc, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className="w-full glass glass-hover rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

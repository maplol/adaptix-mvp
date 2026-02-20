import { useState } from 'react';
import { Building2, User, Globe, Save } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [tenant, setTenant] = useState({
    name: 'Adaptix Demo',
    subdomain: 'demo',
    timezone: 'Europe/Moscow',
    country: 'Россия',
    minBreakHours: '8',
  });
  const [profile, setProfile] = useState({
    name: 'Татьяна Соколова',
    email: 'sokolova@adaptix.io',
  });

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <GlassCard>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Building2 size={20} className="text-cyan-400" />
            </div>
            <h3 className="text-white text-lg font-semibold">Настройки тенанта</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Название компании</label>
              <input
                value={tenant.name}
                onChange={e => setTenant({ ...tenant, name: e.target.value })}
                className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Поддомен</label>
              <div className="flex items-center">
                <input
                  value={tenant.subdomain}
                  onChange={e => setTenant({ ...tenant, subdomain: e.target.value })}
                  className="w-full bg-white/5 rounded-l-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
                />
                <span className="bg-white/3 border border-l-0 border-white/10 rounded-r-xl px-4 py-3.5 text-sm text-white/30">.adaptix.io</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Часовой пояс</label>
              <select
                value={tenant.timezone}
                onChange={e => setTenant({ ...tenant, timezone: e.target.value })}
                className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 cursor-pointer"
              >
                <option className="bg-[#111538]" value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                <option className="bg-[#111538]" value="Europe/London">Europe/London (UTC+0)</option>
                <option className="bg-[#111538]" value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                <option className="bg-[#111538]" value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Страна</label>
              <input
                value={tenant.country}
                onChange={e => setTenant({ ...tenant, country: e.target.value })}
                className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2.5 sm:col-span-2">
              <label className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                <Globe size={12} />
                Мин. перерыв между сменами (часов)
              </label>
              <input
                type="number"
                value={tenant.minBreakHours}
                onChange={e => setTenant({ ...tenant, minBreakHours: e.target.value })}
                className="w-36 bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
              />
              <p className="text-white/20 text-xs">Для международного рынка: 8 ч (РФ) / 11 ч (ЕС)</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <User size={20} className="text-violet-400" />
            </div>
            <h3 className="text-white text-lg font-semibold">Настройки профиля</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Имя</label>
              <input
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-white/50 text-xs font-medium">Email</label>
              <input
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <Button onClick={() => toast('Настройки сохранены', 'success')}>
          <Save size={16} /> Сохранить изменения
        </Button>
      </div>
    </div>
  );
}

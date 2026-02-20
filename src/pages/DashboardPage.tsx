import { Users, CalendarClock, ArrowLeftRight, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../components/layout/GlassCard';
import Badge from '../components/ui/Badge';
import { statsCards, weeklyLoad, notifications, upcomingShifts } from '../data/dashboard';

const iconMap: Record<string, React.ElementType> = { Users, CalendarClock, ArrowLeftRight, TrendingUp };
const notifIcon: Record<string, React.ElementType> = { warning: AlertTriangle, success: CheckCircle, info: Info };
const notifColor: Record<string, string> = { warning: 'text-amber-400', success: 'text-emerald-400', info: 'text-cyan-400' };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map(card => {
          const Icon = iconMap[card.icon];
          const positive = card.change.startsWith('+');
          return (
            <GlassCard key={card.label}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-white/40 text-xs">{card.label}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                </div>
                <p className={`text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change} за сегодня
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2">
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-semibold">Загрузка персонала по дням</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyLoad}>
                <defs>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0099CC" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0099CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#ffffff30" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff60', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17,21,56,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                />
                <Area type="monotone" dataKey="target" stroke="#ffffff20" strokeDasharray="5 5" fill="none" name="Цель" />
                <Area type="monotone" dataKey="load" stroke="#0099CC" fill="url(#loadGrad)" strokeWidth={2} name="Загрузка %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-semibold">Уведомления</h3>
            <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-1">
              {notifications.map(n => {
                const Icon = notifIcon[n.type];
                return (
                  <div key={n.id} className="flex items-start gap-3">
                    <Icon size={16} className={`shrink-0 mt-0.5 ${notifColor[n.type]}`} />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-white/80 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-white/30">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-5">
          <h3 className="text-white font-semibold">Ближайшие смены</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-left text-xs">
                  <th className="pb-4 pl-2 font-medium">Сотрудник</th>
                  <th className="pb-4 font-medium">Время</th>
                  <th className="pb-4 font-medium">Тип</th>
                  <th className="pb-4 font-medium">Локация</th>
                </tr>
              </thead>
              <tbody>
                {upcomingShifts.map((s, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="py-4 pl-2 text-white/80">{s.employee}</td>
                    <td className="py-4 text-white/60">{s.time}</td>
                    <td className="py-4"><Badge variant="info">{s.type}</Badge></td>
                    <td className="py-4 text-white/60">{s.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

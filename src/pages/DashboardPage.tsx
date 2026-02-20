import { Users, CalendarClock, ArrowLeftRight, TrendingUp, AlertTriangle, CheckCircle, Info, Clock, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../components/layout/GlassCard';
import Badge from '../components/ui/Badge';
import { statsCards, weeklyLoad, notifications, upcomingShifts } from '../data/dashboard';
import { useIsMobile } from '../hooks/useIsMobile';

const iconMap: Record<string, React.ElementType> = { Users, CalendarClock, ArrowLeftRight, TrendingUp };
const notifIcon: Record<string, React.ElementType> = { warning: AlertTriangle, success: CheckCircle, info: Info };
const notifColor: Record<string, string> = { warning: 'text-amber-400', success: 'text-emerald-400', info: 'text-cyan-400' };

export default function DashboardPage() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        {statsCards.map(card => {
          const Icon = iconMap[card.icon];
          const positive = card.change.startsWith('+');
          return (
            <GlassCard key={card.label}>
              <div className="flex flex-col gap-2 md:gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-white/40 text-[10px] md:text-xs">{card.label}</p>
                    <p className="text-xl md:text-3xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                    <Icon size={isMobile ? 16 : 20} className="text-cyan-400" />
                  </div>
                </div>
                <p className={`text-[10px] md:text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change} за сегодня
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <GlassCard className="xl:col-span-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <h3 className="text-white font-semibold text-sm md:text-base">Загрузка персонала</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 280}>
              <AreaChart data={weeklyLoad}>
                <defs>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0099CC" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0099CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#ffffff30" tick={{ fill: '#ffffff60', fontSize: isMobile ? 10 : 12 }} />
                <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff60', fontSize: isMobile ? 10 : 12 }} domain={[0, 100]} width={isMobile ? 30 : 40} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17,21,56,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="target" stroke="#ffffff20" strokeDasharray="5 5" fill="none" name="Цель" />
                <Area type="monotone" dataKey="load" stroke="#0099CC" fill="url(#loadGrad)" strokeWidth={2} name="Загрузка %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-4 md:gap-5">
            <h3 className="text-white font-semibold text-sm md:text-base">Уведомления</h3>
            <div className="flex flex-col gap-3 md:gap-4 max-h-[280px] overflow-y-auto pr-1">
              {notifications.map(n => {
                const Icon = notifIcon[n.type];
                return (
                  <div key={n.id} className="flex items-start gap-2.5 md:gap-3">
                    <Icon size={isMobile ? 14 : 16} className={`shrink-0 mt-0.5 ${notifColor[n.type]}`} />
                    <div className="flex flex-col gap-0.5 md:gap-1">
                      <p className="text-xs md:text-sm text-white/80 leading-relaxed">{n.text}</p>
                      <p className="text-[10px] md:text-xs text-white/30">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 md:gap-5">
          <h3 className="text-white font-semibold text-sm md:text-base">Ближайшие смены</h3>

          {isMobile ? (
            <div className="flex flex-col gap-2.5">
              {upcomingShifts.map((s, i) => (
                <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{s.employee}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                      <span className="flex items-center gap-1"><Clock size={10} />{s.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} />{s.location}</span>
                    </div>
                  </div>
                  <Badge variant="info">{s.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </GlassCard>
    </div>
  );
}

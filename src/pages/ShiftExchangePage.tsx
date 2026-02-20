import { useState } from 'react';
import { ArrowLeftRight, Clock, MapPin } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { shifts as allShifts } from '../data/shifts';
import { employees } from '../data/employees';

export default function ShiftExchangePage() {
  const { toast } = useToast();
  const [exchanged, setExchanged] = useState<Set<string>>(new Set());

  const openShifts = allShifts.filter(s => s.status === 'open');
  const myShifts = allShifts.filter(s => s.employeeId === 'e3');
  const me = employees.find(e => e.id === 'e3')!;

  const handleExchange = (shiftId: string) => {
    const shift = openShifts.find(s => s.id === shiftId);
    if (!shift) return;
    toast(`Обмен одобрен автоматически: ${me.name} → ${shift.type} (${shift.date})`, 'success');
    setExchanged(prev => new Set(prev).add(shiftId));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 text-white/40 text-sm">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
          ДС
        </div>
        <span className="text-white/80">Вы вошли как: <strong>{me.name}</strong> ({me.jobRole})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-cyan-400" />
            Доступные смены
          </h3>
          <div className="flex flex-col gap-4">
            {openShifts.length === 0 && (
              <p className="text-white/30 text-sm">Нет доступных смен для обмена</p>
            )}
            {openShifts.map(shift => (
              <GlassCard key={shift.id} className="flex items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="info">{shift.type}</Badge>
                    <span className="text-white/80 text-sm font-medium">{shift.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><Clock size={12} />{shift.startTime}–{shift.endTime}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} />{shift.location}</span>
                  </div>
                </div>
                {exchanged.has(shift.id) ? (
                  <Badge variant="success">Взята</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleExchange(shift.id)}>
                    Взять смену
                  </Button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Clock size={18} className="text-violet-400" />
            Мои смены
          </h3>
          <div className="flex flex-col gap-4">
            {myShifts.length === 0 && (
              <p className="text-white/30 text-sm">У вас нет назначенных смен</p>
            )}
            {myShifts.map(shift => (
              <GlassCard key={shift.id} className="flex items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{shift.type}</Badge>
                    <span className="text-white/80 text-sm font-medium">{shift.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><Clock size={12} />{shift.startTime}–{shift.endTime}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} />{shift.location}</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => toast('Запрос на обмен отправлен менеджеру', 'info')}>
                  Предложить обмен
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

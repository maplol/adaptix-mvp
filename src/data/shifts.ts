export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location: string;
  status: 'scheduled' | 'completed' | 'open';
}

export type ViewMode = 'week' | '2weeks' | 'month';

export const shiftTypes = ['Операционная', 'Дежурство', 'Утренняя', 'Вечерняя', 'Склад', 'Приём'] as const;

export const shiftLocations = ['Клиника Центральная', 'Кофейня на Арбате', 'Кофейня на Тверской', 'Склад Южный'] as const;

export function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function getMonday(d: Date = new Date()): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getDateRange(start: Date, mode: ViewMode): string[] {
  const count = mode === 'week' ? 7 : mode === '2weeks' ? 14 : getDaysInMonth(start);
  const baseDate = mode === 'month' ? new Date(start.getFullYear(), start.getMonth(), 1) : start;
  return Array.from({ length: count }, (_, i) => fmt(addDays(baseDate, i)));
}

function getDaysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[d.getDay()];
}

export function formatDateRange(start: Date, mode: ViewMode): string {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  if (mode === 'month') {
    const fullMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${fullMonths[start.getMonth()]} ${start.getFullYear()}`;
  }
  const count = mode === 'week' ? 6 : 13;
  const end = addDays(start, count);
  const s = `${start.getDate()} ${months[start.getMonth()]}`;
  const e = `${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  return `${s} — ${e}`;
}

export function navigatePeriod(current: Date, mode: ViewMode, direction: number): Date {
  if (mode === 'month') {
    const next = new Date(current);
    next.setMonth(next.getMonth() + direction);
    return next;
  }
  const days = mode === 'week' ? 7 : 14;
  return addDays(current, days * direction);
}

const monday = getMonday();

export const shifts: Shift[] = [
  { id: 's1', employeeId: 'e1', date: fmt(monday), startTime: '08:00', endTime: '16:00', type: 'Операционная', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's2', employeeId: 'e2', date: fmt(monday), startTime: '08:00', endTime: '20:00', type: 'Дежурство', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's3', employeeId: 'e3', date: fmt(monday), startTime: '07:00', endTime: '15:00', type: 'Утренняя', location: 'Кофейня на Арбате', status: 'scheduled' },
  { id: 's4', employeeId: 'e5', date: fmt(monday), startTime: '06:00', endTime: '14:00', type: 'Склад', location: 'Склад Южный', status: 'scheduled' },
  { id: 's5', employeeId: 'e6', date: fmt(monday), startTime: '09:00', endTime: '17:00', type: 'Приём', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's6', employeeId: 'e9', date: fmt(monday), startTime: '15:00', endTime: '23:00', type: 'Вечерняя', location: 'Кофейня на Тверской', status: 'scheduled' },
  { id: 's7', employeeId: 'e11', date: fmt(monday), startTime: '06:00', endTime: '14:00', type: 'Склад', location: 'Склад Южный', status: 'scheduled' },

  { id: 's8', employeeId: 'e1', date: fmt(addDays(monday, 1)), startTime: '08:00', endTime: '16:00', type: 'Приём', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's9', employeeId: 'e3', date: fmt(addDays(monday, 1)), startTime: '15:00', endTime: '23:00', type: 'Вечерняя', location: 'Кофейня на Арбате', status: 'scheduled' },
  { id: 's10', employeeId: 'e5', date: fmt(addDays(monday, 1)), startTime: '14:00', endTime: '22:00', type: 'Склад', location: 'Склад Южный', status: 'scheduled' },
  { id: 's11', employeeId: 'e12', date: fmt(addDays(monday, 1)), startTime: '08:00', endTime: '16:00', type: 'Операционная', location: 'Клиника Центральная', status: 'scheduled' },

  { id: 's12', employeeId: 'e2', date: fmt(addDays(monday, 2)), startTime: '08:00', endTime: '20:00', type: 'Дежурство', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's13', employeeId: 'e9', date: fmt(addDays(monday, 2)), startTime: '07:00', endTime: '15:00', type: 'Утренняя', location: 'Кофейня на Тверской', status: 'scheduled' },
  { id: 's14', employeeId: 'e11', date: fmt(addDays(monday, 2)), startTime: '06:00', endTime: '14:00', type: 'Склад', location: 'Склад Южный', status: 'scheduled' },

  { id: 's15', employeeId: 'e1', date: fmt(addDays(monday, 3)), startTime: '08:00', endTime: '16:00', type: 'Операционная', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's16', employeeId: 'e6', date: fmt(addDays(monday, 3)), startTime: '09:00', endTime: '17:00', type: 'Приём', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's17', employeeId: 'e3', date: fmt(addDays(monday, 3)), startTime: '07:00', endTime: '15:00', type: 'Утренняя', location: 'Кофейня на Арбате', status: 'scheduled' },

  { id: 's18', employeeId: 'e12', date: fmt(addDays(monday, 4)), startTime: '08:00', endTime: '16:00', type: 'Операционная', location: 'Клиника Центральная', status: 'scheduled' },
  { id: 's19', employeeId: 'e5', date: fmt(addDays(monday, 4)), startTime: '06:00', endTime: '14:00', type: 'Склад', location: 'Склад Южный', status: 'scheduled' },

  { id: 's20', employeeId: '', date: fmt(addDays(monday, 4)), startTime: '15:00', endTime: '23:00', type: 'Вечерняя', location: 'Кофейня на Арбате', status: 'open' },
  { id: 's21', employeeId: '', date: fmt(addDays(monday, 3)), startTime: '14:00', endTime: '22:00', type: 'Склад', location: 'Склад Южный', status: 'open' },
  { id: 's22', employeeId: '', date: fmt(addDays(monday, 2)), startTime: '08:00', endTime: '16:00', type: 'Приём', location: 'Клиника Центральная', status: 'open' },
];

export const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function getWeekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => fmt(addDays(monday, i)));
}

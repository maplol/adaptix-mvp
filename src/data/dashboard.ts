export const statsCards = [
  { label: 'Сотрудников сегодня', value: '47', change: '+3', icon: 'Users' },
  { label: 'Открытых смен', value: '3', change: '-2', icon: 'CalendarClock' },
  { label: 'Запросов на обмен', value: '5', change: '+1', icon: 'ArrowLeftRight' },
  { label: 'Экономия ФОТ', value: '12.4%', change: '+2.1%', icon: 'TrendingUp' },
];

export const weeklyLoad = [
  { day: 'Пн', load: 92, target: 85 },
  { day: 'Вт', load: 87, target: 85 },
  { day: 'Ср', load: 78, target: 85 },
  { day: 'Чт', load: 95, target: 85 },
  { day: 'Пт', load: 88, target: 85 },
  { day: 'Сб', load: 45, target: 50 },
  { day: 'Вс', load: 30, target: 40 },
];

export const notifications = [
  { id: 'n1', type: 'warning' as const, text: 'Сертификат BLS/ACLS у Алексея Петрова просрочен', time: '10 мин назад' },
  { id: 'n2', type: 'info' as const, text: 'Николай Кузнецов запросил обмен смены (Пт 15:00-23:00)', time: '25 мин назад' },
  { id: 'n3', type: 'warning' as const, text: 'Сертификат «Охрана труда» у Ольги Федоровой просрочен', time: '1 ч назад' },
  { id: 'n4', type: 'success' as const, text: 'Обмен смены одобрен: Сидоров ↔ Кузнецов', time: '2 ч назад' },
  { id: 'n5', type: 'info' as const, text: 'Создано 3 открытых смены на эту неделю', time: '3 ч назад' },
];

export const upcomingShifts = [
  { employee: 'Алексей Петров', time: '08:00–16:00', type: 'Операционная', location: 'Клиника Центральная' },
  { employee: 'Мария Иванова', time: '08:00–20:00', type: 'Дежурство', location: 'Клиника Центральная' },
  { employee: 'Дмитрий Сидоров', time: '07:00–15:00', type: 'Утренняя', location: 'Кофейня на Арбате' },
  { employee: 'Игорь Волков', time: '06:00–14:00', type: 'Склад', location: 'Склад Южный' },
  { employee: 'Анна Морозова', time: '09:00–17:00', type: 'Приём', location: 'Клиника Центральная' },
];

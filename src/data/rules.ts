export type FieldType = 'text' | 'number' | 'date' | 'select' | 'date-range' | 'time';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface UserEndpoint {
  id: string;
  label: string;
  endpoint: string;
  icon: string;
  color: string;
  description: string;
  formFields: FormField[];
}

export const userEndpoints: UserEndpoint[] = [
  {
    id: 'take-shift',
    label: 'Взять смену',
    endpoint: 'api/take-shift',
    icon: 'CalendarPlus',
    color: 'cyan',
    description: 'Сотрудник берёт открытую смену из биржи',
    formFields: [
      { id: 'shift_type', label: 'Тип смены', type: 'select', options: ['Дневная', 'Ночная', 'Операционная', 'Дежурная'], required: true },
      { id: 'shift_date', label: 'Дата смены', type: 'date', required: true },
      { id: 'shift_start', label: 'Начало', type: 'time', required: true },
      { id: 'shift_end', label: 'Конец', type: 'time', required: true },
      { id: 'shift_location', label: 'Локация', type: 'select', options: ['Корпус А', 'Корпус Б', 'Операционная', 'Приёмная'], required: true },
    ],
  },
  {
    id: 'change-shift',
    label: 'Обмен смены',
    endpoint: 'api/change-shift',
    icon: 'ArrowLeftRight',
    color: 'violet',
    description: 'Обмен сменами между двумя сотрудниками',
    formFields: [
      { id: 'my_shift_date', label: 'Моя смена (дата)', type: 'date', required: true },
      { id: 'partner', label: 'С кем меняюсь', type: 'select', options: ['Иванов И.', 'Петрова А.', 'Сидоров К.', 'Козлова М.'], required: true },
      { id: 'partner_shift_date', label: 'Смена коллеги (дата)', type: 'date', required: true },
      { id: 'reason', label: 'Причина обмена', type: 'text', placeholder: 'Укажите причину...' },
    ],
  },
  {
    id: 'take-vacation',
    label: 'Взять отпуск',
    endpoint: 'api/take-vacation',
    icon: 'Palmtree',
    color: 'emerald',
    description: 'Запрос на оплачиваемый или неоплачиваемый отпуск',
    formFields: [
      { id: 'vacation_type', label: 'Тип отпуска', type: 'select', options: ['Оплачиваемый', 'За свой счёт', 'Учебный'], required: true },
      { id: 'date_from', label: 'С', type: 'date', required: true },
      { id: 'date_to', label: 'По', type: 'date', required: true },
      { id: 'days_count', label: 'Кол-во дней', type: 'number', placeholder: '14', required: true },
      { id: 'comment', label: 'Комментарий', type: 'text', placeholder: 'Дополнительная информация...' },
    ],
  },
  {
    id: 'cancel-shift',
    label: 'Отменить смену',
    endpoint: 'api/cancel-shift',
    icon: 'CalendarX',
    color: 'red',
    description: 'Отмена назначенной смены сотрудником',
    formFields: [
      { id: 'shift_date', label: 'Дата смены', type: 'date', required: true },
      { id: 'shift_time', label: 'Время смены', type: 'time', required: true },
      { id: 'reason', label: 'Причина отмены', type: 'select', options: ['Болезнь', 'Семейные обстоятельства', 'Другое'], required: true },
      { id: 'comment', label: 'Пояснение', type: 'text', placeholder: 'Подробности...' },
    ],
  },
  {
    id: 'assign-shift',
    label: 'Назначить смену',
    endpoint: 'api/assign-shift',
    icon: 'CalendarCheck',
    color: 'amber',
    description: 'Менеджер назначает смену сотруднику',
    formFields: [
      { id: 'employee', label: 'Сотрудник', type: 'select', options: ['Иванов И.', 'Петрова А.', 'Сидоров К.', 'Козлова М.'], required: true },
      { id: 'shift_type', label: 'Тип смены', type: 'select', options: ['Дневная', 'Ночная', 'Операционная', 'Дежурная'], required: true },
      { id: 'shift_date', label: 'Дата', type: 'date', required: true },
      { id: 'shift_start', label: 'Начало', type: 'time', required: true },
      { id: 'shift_end', label: 'Конец', type: 'time', required: true },
    ],
  },
  {
    id: 'request-overtime',
    label: 'Запрос переработки',
    endpoint: 'api/request-overtime',
    icon: 'Clock',
    color: 'orange',
    description: 'Сотрудник запрашивает дополнительные часы',
    formFields: [
      { id: 'ot_date', label: 'Дата', type: 'date', required: true },
      { id: 'ot_hours', label: 'Часы переработки', type: 'number', placeholder: '2', required: true },
      { id: 'ot_reason', label: 'Обоснование', type: 'text', placeholder: 'Почему нужна переработка...', required: true },
    ],
  },
];

export type SystemAction = 'block' | 'allow' | 'notify' | 'require-approval' | 'auto-approve';

export const systemActions: { value: SystemAction; label: string }[] = [
  { value: 'block', label: 'Блокировать' },
  { value: 'allow', label: 'Разрешить' },
  { value: 'notify', label: 'Уведомить менеджера' },
  { value: 'require-approval', label: 'Требовать подтверждение' },
  { value: 'auto-approve', label: 'Авто-одобрить' },
];

export interface Rule {
  id: string;
  endpointId: string;
  field: string;
  op: string;
  value: string;
  action: SystemAction;
  active: boolean;
}

export const mockRules: Rule[] = [
  { id: 'r1', endpointId: 'take-shift',   field: 'Сертификат.Срок',    op: '<',  value: 'Сегодня',       action: 'block', active: true },
  { id: 'r2', endpointId: 'take-shift',   field: 'Смена.Длительность', op: '>',  value: '12 ч',          action: 'block', active: true },
  { id: 'r3', endpointId: 'take-shift',   field: 'Перерыв.Часы',       op: '<',  value: '8',             action: 'block', active: true },
  { id: 'r4', endpointId: 'take-shift',   field: 'Смена.Длительность', op: '<=', value: '4 ч',           action: 'auto-approve', active: true },
  { id: 'r5', endpointId: 'change-shift', field: 'Сотрудник_А.Роль',   op: '==', value: 'Сотрудник_Б.Роль', action: 'allow', active: true },
  { id: 'r6', endpointId: 'change-shift', field: 'Сотрудник.Статус',   op: '==', value: 'Больничный',    action: 'block', active: true },
  { id: 'r7', endpointId: 'cancel-shift', field: 'Смена.До_начала',    op: '<',  value: '2 ч',           action: 'block', active: true },
  { id: 'r8', endpointId: 'cancel-shift', field: 'Смена.До_начала',    op: '>=', value: '24 ч',          action: 'auto-approve', active: true },
  { id: 'r9', endpointId: 'cancel-shift', field: 'Смена.До_начала',    op: '<',  value: '24 ч',          action: 'notify', active: false },
  { id: 'r10', endpointId: 'take-vacation', field: 'Отпуск.Дней_осталось', op: '<=', value: '0',         action: 'block', active: true },
  { id: 'r11', endpointId: 'take-vacation', field: 'Отпуск.Длительность', op: '>', value: '14 дн',       action: 'require-approval', active: true },
  { id: 'r12', endpointId: 'assign-shift', field: 'Сертификат.Срок',   op: '<',  value: 'Сегодня',       action: 'block', active: true },
  { id: 'r13', endpointId: 'assign-shift', field: 'Сотрудник.Статус',  op: '==', value: 'Больничный',    action: 'notify', active: true },
];

export const conditionFields = [
  'Смена.Тип', 'Смена.Длительность', 'Смена.До_начала',
  'Сертификат.Срок', 'Сертификат.Категория',
  'Сотрудник.Роль', 'Сотрудник.Статус',
  'Сотрудник_А.Роль', 'Сотрудник_Б.Роль',
  'Перерыв.Часы', 'Локация.Тип',
  'Отпуск.Дней_осталось', 'Отпуск.Длительность',
];

export const operators = ['==', '!=', '<', '>', '<=', '>='];

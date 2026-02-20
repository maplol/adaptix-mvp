export interface RuleCondition {
  id: string;
  field: string;
  op: string;
  value: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  conditions: RuleCondition[];
  actionId: string;
}

export interface ActionDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const actionDefs: ActionDef[] = [
  {
    id: 'block-assignment',
    label: 'Блокировать назначение',
    icon: 'ShieldBan',
    color: 'red',
    description: 'Запрещает назначение смены при нарушении условий',
  },
  {
    id: 'allow-exchange',
    label: 'Разрешить обмен',
    icon: 'ArrowLeftRight',
    color: 'emerald',
    description: 'Автоматически разрешает обмен сменами',
  },
  {
    id: 'notify-manager',
    label: 'Уведомить менеджера',
    icon: 'Bell',
    color: 'amber',
    description: 'Отправляет уведомление менеджеру при срабатывании',
  },
  {
    id: 'require-approval',
    label: 'Требовать подтверждение',
    icon: 'CheckCircle',
    color: 'violet',
    description: 'Запрашивает ручное подтверждение от менеджера',
  },
  {
    id: 'auto-approve',
    label: 'Автоматически одобрить',
    icon: 'Zap',
    color: 'cyan',
    description: 'Одобряет запрос автоматически при выполнении условий',
  },
];

export const mockRules: Rule[] = [
  {
    id: 'r1',
    name: 'Проверка сертификата для операционной',
    description: 'Блокирует врача с просроченным сертификатом',
    active: true,
    actionId: 'block-assignment',
    conditions: [
      { id: 'c1', field: 'Смена.Тип', op: '==', value: 'Операционная' },
      { id: 'c2', field: 'Сертификат.Срок', op: '<', value: 'Сегодня' },
    ],
  },
  {
    id: 'r2',
    name: 'Ограничение длительности смены',
    description: 'Сотрудник не может работать более 12 часов подряд',
    active: true,
    actionId: 'block-assignment',
    conditions: [
      { id: 'c3', field: 'Смена.Длительность', op: '>', value: '12 ч' },
    ],
  },
  {
    id: 'r3',
    name: 'Перерыв между сменами (ТК РФ)',
    description: 'Минимальный перерыв между сменами — 8 часов',
    active: true,
    actionId: 'block-assignment',
    conditions: [
      { id: 'c4', field: 'Перерыв.Часы', op: '<', value: '8' },
    ],
  },
  {
    id: 'r4',
    name: 'Обмен между сотрудниками одной роли',
    description: 'Разрешает обмен если роли совпадают',
    active: true,
    actionId: 'allow-exchange',
    conditions: [
      { id: 'c5', field: 'Сотрудник_А.Роль', op: '==', value: 'Сотрудник_Б.Роль' },
    ],
  },
  {
    id: 'r5',
    name: 'Оповещение о переработке',
    description: 'Уведомляет менеджера если сотрудник на больничном',
    active: false,
    actionId: 'notify-manager',
    conditions: [
      { id: 'c6', field: 'Сотрудник.Статус', op: '==', value: 'Больничный' },
    ],
  },
  {
    id: 'r6',
    name: 'Авто-одобрение коротких смен',
    description: 'Автоматически одобряет смены до 4 часов',
    active: true,
    actionId: 'auto-approve',
    conditions: [
      { id: 'c7', field: 'Смена.Длительность', op: '<=', value: '4 ч' },
    ],
  },
];

export const conditionFields = [
  'Смена.Тип', 'Смена.Длительность', 'Сертификат.Срок', 'Сертификат.Категория',
  'Сотрудник.Роль', 'Сотрудник.Статус', 'Перерыв.Часы', 'Локация.Тип',
  'Сотрудник_А.Роль', 'Сотрудник_Б.Роль',
];

export const operators = ['==', '!=', '<', '>', '<=', '>='];

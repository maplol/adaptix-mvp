export interface RuleBlock {
  id: string;
  type: 'condition' | 'operator' | 'action';
  field?: string;
  op?: string;
  value?: string;
  label: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  blocks: RuleBlock[];
}

export const mockRules: Rule[] = [
  {
    id: 'r1',
    name: 'Проверка сертификата для операционной',
    description: 'Блокирует назначение на операционную врача с просроченным сертификатом',
    active: true,
    blocks: [
      { id: 'b1', type: 'condition', field: 'Смена.Тип', op: '==', value: 'Операционная', label: 'Смена.Тип == "Операционная"' },
      { id: 'b2', type: 'operator', label: 'И' },
      { id: 'b3', type: 'condition', field: 'Сертификат.Срок', op: '<', value: 'Сегодня', label: 'Сертификат.Срок < Сегодня' },
      { id: 'b4', type: 'operator', label: 'ТО' },
      { id: 'b5', type: 'action', label: 'Блокировать назначение' },
    ],
  },
  {
    id: 'r2',
    name: 'Ограничение длительности смены',
    description: 'Сотрудник не может работать более 12 часов подряд',
    active: true,
    blocks: [
      { id: 'b6', type: 'condition', field: 'Смена.Длительность', op: '>', value: '12', label: 'Смена.Длительность > 12 ч' },
      { id: 'b7', type: 'operator', label: 'ТО' },
      { id: 'b8', type: 'action', label: 'Блокировать назначение' },
    ],
  },
  {
    id: 'r3',
    name: 'Автоматический обмен сменами',
    description: 'Разрешает обмен сменами между сотрудниками одной роли',
    active: true,
    blocks: [
      { id: 'b9', type: 'condition', field: 'Сотрудник_А.Роль', op: '==', value: 'Сотрудник_Б.Роль', label: 'Роль_А == Роль_Б' },
      { id: 'b10', type: 'operator', label: 'ТО' },
      { id: 'b11', type: 'action', label: 'Разрешить обмен' },
    ],
  },
  {
    id: 'r4',
    name: 'Перерыв между сменами (РФ)',
    description: 'Минимальный перерыв между сменами — 8 часов',
    active: true,
    blocks: [
      { id: 'b12', type: 'condition', field: 'Перерыв.Часы', op: '<', value: '8', label: 'Перерыв < 8 часов' },
      { id: 'b13', type: 'operator', label: 'ТО' },
      { id: 'b14', type: 'action', label: 'Блокировать назначение' },
    ],
  },
];

export const conditionFields = [
  'Смена.Тип', 'Смена.Длительность', 'Сертификат.Срок', 'Сертификат.Категория',
  'Сотрудник.Роль', 'Перерыв.Часы', 'Локация.Тип',
];

export const operators = ['==', '!=', '<', '>', '<=', '>='];

export const actions = [
  'Блокировать назначение', 'Разрешить обмен', 'Уведомить менеджера',
  'Требовать подтверждение', 'Автоматически одобрить',
];

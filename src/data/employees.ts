export interface Certificate {
  name: string;
  expiresAt: string;
  expired: boolean;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  position: string;
  jobRole: string;
  appRole: 'admin' | 'manager' | 'employee';
  location: string;
  status: 'active' | 'on_leave' | 'sick';
  phone: string;
  email: string;
  certificates: Certificate[];
  hireDate: string;
}

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4`;

export const employees: Employee[] = [
  {
    id: 'e1', name: 'Алексей Петров', avatar: avatarUrl('alexey'),
    position: 'Хирург', jobRole: 'Врач', appRole: 'employee',
    location: 'Клиника Центральная', status: 'active',
    phone: '+7 (900) 111-22-33', email: 'petrov@adaptix.io',
    certificates: [
      { name: 'Сертификат хирурга', expiresAt: '2026-08-15', expired: false },
      { name: 'BLS/ACLS', expiresAt: '2025-12-01', expired: true },
    ],
    hireDate: '2022-03-10',
  },
  {
    id: 'e2', name: 'Мария Иванова', avatar: avatarUrl('maria'),
    position: 'Старшая медсестра', jobRole: 'Медсестра', appRole: 'employee',
    location: 'Клиника Центральная', status: 'active',
    phone: '+7 (900) 222-33-44', email: 'ivanova@adaptix.io',
    certificates: [
      { name: 'Сертификат медсестры', expiresAt: '2027-01-20', expired: false },
    ],
    hireDate: '2021-07-01',
  },
  {
    id: 'e3', name: 'Дмитрий Сидоров', avatar: avatarUrl('dmitry'),
    position: 'Бариста', jobRole: 'Бариста', appRole: 'employee',
    location: 'Кофейня на Арбате', status: 'active',
    phone: '+7 (900) 333-44-55', email: 'sidorov@adaptix.io',
    certificates: [],
    hireDate: '2024-09-15',
  },
  {
    id: 'e4', name: 'Елена Козлова', avatar: avatarUrl('elena'),
    position: 'Бариста', jobRole: 'Бариста', appRole: 'employee',
    location: 'Кофейня на Арбате', status: 'on_leave',
    phone: '+7 (900) 444-55-66', email: 'kozlova@adaptix.io',
    certificates: [],
    hireDate: '2024-11-01',
  },
  {
    id: 'e5', name: 'Игорь Волков', avatar: avatarUrl('igor'),
    position: 'Комплектовщик', jobRole: 'Складской рабочий', appRole: 'employee',
    location: 'Склад Южный', status: 'active',
    phone: '+7 (900) 555-66-77', email: 'volkov@adaptix.io',
    certificates: [
      { name: 'Охрана труда', expiresAt: '2026-06-01', expired: false },
    ],
    hireDate: '2023-01-20',
  },
  {
    id: 'e6', name: 'Анна Морозова', avatar: avatarUrl('anna'),
    position: 'Терапевт', jobRole: 'Врач', appRole: 'employee',
    location: 'Клиника Центральная', status: 'active',
    phone: '+7 (900) 666-77-88', email: 'morozova@adaptix.io',
    certificates: [
      { name: 'Сертификат терапевта', expiresAt: '2027-03-10', expired: false },
    ],
    hireDate: '2020-05-15',
  },
  {
    id: 'e7', name: 'Сергей Новиков', avatar: avatarUrl('sergey'),
    position: 'Менеджер смен', jobRole: 'Менеджер', appRole: 'manager',
    location: 'Клиника Центральная', status: 'active',
    phone: '+7 (900) 777-88-99', email: 'novikov@adaptix.io',
    certificates: [],
    hireDate: '2019-11-01',
  },
  {
    id: 'e8', name: 'Ольга Федорова', avatar: avatarUrl('olga'),
    position: 'Комплектовщик', jobRole: 'Складской рабочий', appRole: 'employee',
    location: 'Склад Южный', status: 'sick',
    phone: '+7 (900) 888-99-00', email: 'fedorova@adaptix.io',
    certificates: [
      { name: 'Охрана труда', expiresAt: '2025-11-15', expired: true },
    ],
    hireDate: '2023-06-10',
  },
  {
    id: 'e9', name: 'Николай Кузнецов', avatar: avatarUrl('nikolay'),
    position: 'Бариста', jobRole: 'Бариста', appRole: 'employee',
    location: 'Кофейня на Тверской', status: 'active',
    phone: '+7 (900) 999-00-11', email: 'kuznetsov@adaptix.io',
    certificates: [],
    hireDate: '2025-01-10',
  },
  {
    id: 'e10', name: 'Татьяна Соколова', avatar: avatarUrl('tatyana'),
    position: 'Администратор', jobRole: 'Администратор', appRole: 'admin',
    location: 'Главный офис', status: 'active',
    phone: '+7 (900) 100-20-30', email: 'sokolova@adaptix.io',
    certificates: [],
    hireDate: '2018-03-01',
  },
  {
    id: 'e11', name: 'Павел Лебедев', avatar: avatarUrl('pavel'),
    position: 'Грузчик', jobRole: 'Складской рабочий', appRole: 'employee',
    location: 'Склад Южный', status: 'active',
    phone: '+7 (900) 200-30-40', email: 'lebedev@adaptix.io',
    certificates: [
      { name: 'Охрана труда', expiresAt: '2026-09-20', expired: false },
    ],
    hireDate: '2024-02-14',
  },
  {
    id: 'e12', name: 'Виктория Попова', avatar: avatarUrl('vika'),
    position: 'Анестезиолог', jobRole: 'Врач', appRole: 'employee',
    location: 'Клиника Центральная', status: 'active',
    phone: '+7 (900) 300-40-50', email: 'popova@adaptix.io',
    certificates: [
      { name: 'Сертификат анестезиолога', expiresAt: '2026-12-01', expired: false },
      { name: 'BLS/ACLS', expiresAt: '2026-05-20', expired: false },
    ],
    hireDate: '2021-09-01',
  },
];

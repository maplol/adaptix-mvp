import { useState, useEffect } from 'react';
import { Search, Pencil } from 'lucide-react';
import { employees as initialEmployees, type Employee } from '../data/employees';
import GlassCard from '../components/layout/GlassCard';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../App';
import { useToast } from '../components/ui/Toast';
import { useIsMobile } from '../hooks/useIsMobile';

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  active: { label: 'Активен', variant: 'success' },
  on_leave: { label: 'В отпуске', variant: 'warning' },
  sick: { label: 'Больничный', variant: 'danger' },
};

const statusOptions: { value: Employee['status']; label: string }[] = [
  { value: 'active', label: 'Активен' },
  { value: 'on_leave', label: 'В отпуске' },
  { value: 'sick', label: 'Больничный' },
];

const roleOptions: { value: Employee['appRole']; label: string }[] = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'admin', label: 'Администратор' },
];

interface EditFormData {
  name: string; position: string; jobRole: string;
  appRole: Employee['appRole']; location: string;
  status: Employee['status']; phone: string; email: string;
}

function EditEmployeeModal({ open, onClose, employee, onSave }: {
  open: boolean; onClose: () => void;
  employee: Employee; onSave: (data: EditFormData) => void;
}) {
  const [form, setForm] = useState<EditFormData>({
    name: employee.name, position: employee.position, jobRole: employee.jobRole,
    appRole: employee.appRole, location: employee.location,
    status: employee.status, phone: employee.phone, email: employee.email,
  });

  useEffect(() => {
    if (open) setForm({
      name: employee.name, position: employee.position, jobRole: employee.jobRole,
      appRole: employee.appRole, location: employee.location,
      status: employee.status, phone: employee.phone, email: employee.email,
    });
  }, [open, employee]);

  const inputCls = "w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors";
  const selectCls = "w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white/80 outline-none border border-white/10 cursor-pointer";

  return (
    <Modal open={open} onClose={onClose} title="Редактировать сотрудника">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 pb-2">
          <Avatar src={employee.avatar} name={employee.name} size="lg" />
          <div className="flex flex-col gap-0.5">
            <p className="text-white font-semibold">{employee.name}</p>
            <p className="text-white/40 text-xs">ID: {employee.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Имя</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Должность</label>
            <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Роль в компании</label>
            <input value={form.jobRole} onChange={e => setForm({ ...form, jobRole: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Системная роль</label>
            <select value={form.appRole} onChange={e => setForm({ ...form, appRole: e.target.value as Employee['appRole'] })} className={selectCls}>
              {roleOptions.map(r => <option key={r.value} value={r.value} className="bg-[#111538]">{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Локация</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Статус</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Employee['status'] })} className={selectCls}>
              {statusOptions.map(s => <option key={s.value} value={s.value} className="bg-[#111538]">{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Телефон</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={() => onSave(form)}>Сохранить</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function EmployeesPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const canEdit = role === 'admin' || role === 'manager';

  const [employeesList, setEmployeesList] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = employeesList.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || e.jobRole === roleFilter;
    return matchSearch && matchRole;
  });

  const jobRoles = [...new Set(employeesList.map(e => e.jobRole))];

  const handleSaveEmployee = (data: EditFormData) => {
    if (!editing) return;
    setEmployeesList(prev => prev.map(e => e.id === editing.id ? { ...e, ...data } : e));
    toast(`${data.name} — данные обновлены`, 'success');
    setEditing(null);
    if (selected?.id === editing.id) {
      setSelected(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="glass rounded-xl flex items-center px-5 py-3 gap-3 flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск сотрудников..."
            className="bg-transparent text-sm text-white/80 outline-none w-full placeholder:text-white/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="glass rounded-xl px-5 py-3 text-sm text-white/80 bg-transparent outline-none cursor-pointer"
        >
          <option value="" className="bg-[#111538]">Все должности</option>
          {jobRoles.map(r => (
            <option key={r} value={r} className="bg-[#111538]">{r}</option>
          ))}
        </select>
        <Badge variant="info">{filtered.length} сотрудников</Badge>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map(emp => {
            const st = statusMap[emp.status];
            const expiredCerts = emp.certificates.filter(c => c.expired);
            return (
              <div
                key={emp.id}
                onClick={() => setSelected(emp)}
                className="glass rounded-2xl p-3.5 active:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={emp.avatar} name={emp.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm font-medium truncate">{emp.name}</span>
                      <Badge variant={st.variant} className="text-[9px] px-1.5 py-0">{st.label}</Badge>
                    </div>
                    <p className="text-white/40 text-xs truncate">{emp.position} · {emp.location}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {expiredCerts.length > 0 ? (
                      <Badge variant="danger" className="text-[9px] px-1.5 py-0">{expiredCerts.length} просроч.</Badge>
                    ) : emp.certificates.length > 0 ? (
                      <Badge variant="success" className="text-[9px] px-1.5 py-0">{emp.certificates.length} OK</Badge>
                    ) : null}
                    {canEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(emp); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/30"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <GlassCard className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-left text-xs">
                <th className="px-7 py-5 font-medium">Сотрудник</th>
                <th className="px-6 py-5 font-medium">Должность</th>
                <th className="px-6 py-5 font-medium">Локация</th>
                <th className="px-6 py-5 font-medium">Статус</th>
                <th className="px-6 py-5 font-medium">Сертификаты</th>
                {canEdit && <th className="px-6 py-5 font-medium w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const st = statusMap[emp.status];
                const expiredCerts = emp.certificates.filter(c => c.expired);
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelected(emp)}
                    className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatar} name={emp.name} size="sm" />
                        <span className="text-white/80">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{emp.position}</td>
                    <td className="px-6 py-4 text-white/60">{emp.location}</td>
                    <td className="px-6 py-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-6 py-4">
                      {expiredCerts.length > 0 ? (
                        <Badge variant="danger">{expiredCerts.length} просрочен</Badge>
                      ) : emp.certificates.length > 0 ? (
                        <Badge variant="success">{emp.certificates.length} OK</Badge>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditing(emp); }}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-cyan-400 transition-colors"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* View Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''}>
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar src={selected.avatar} name={selected.name} size="lg" />
              <div className="flex flex-col gap-1">
                <p className="text-white font-semibold">{selected.name}</p>
                <p className="text-white/40 text-sm">{selected.position} / {selected.jobRole}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={statusMap[selected.status].variant} className="w-fit">{statusMap[selected.status].label}</Badge>
                  {canEdit && (
                    <button
                      onClick={() => { setSelected(null); setEditing(selected); }}
                      className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-cyan-400 transition-colors"
                      title="Редактировать"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Системная роль</p>
                <p className="text-white/80">{selected.appRole}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Должностная роль</p>
                <p className="text-white/80">{selected.jobRole}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Локация</p>
                <p className="text-white/80">{selected.location}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Дата найма</p>
                <p className="text-white/80">{selected.hireDate}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Телефон</p>
                <p className="text-white/80">{selected.phone}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white/40 text-xs">Email</p>
                <p className="text-white/80">{selected.email}</p>
              </div>
            </div>

            {selected.certificates.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="text-white/40 text-xs">Сертификаты</p>
                <div className="flex flex-col gap-2">
                  {selected.certificates.map((c, i) => (
                    <div key={i} className="flex items-center justify-between glass rounded-lg px-4 py-3">
                      <span className="text-white/80 text-sm">{c.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs">до {c.expiresAt}</span>
                        <Badge variant={c.expired ? 'danger' : 'success'}>
                          {c.expired ? 'Просрочен' : 'Действует'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      {editing && (
        <EditEmployeeModal
          open={!!editing}
          onClose={() => setEditing(null)}
          employee={editing}
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  );
}

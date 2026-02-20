import { useState, useEffect, useRef, useCallback } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensors, useSensor, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ChevronLeft, ChevronRight, Plus, Pencil, Copy, ClipboardPaste, Trash2, CopyPlus, CalendarDays, X } from 'lucide-react';
import { employees } from '../data/employees';
import {
  shifts as initialShifts, shiftTypes, shiftLocations,
  getMonday, getDateRange, getDayLabel, formatDateRange, navigatePeriod, fmt,
  type Shift, type ViewMode,
} from '../data/shifts';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../App';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const shiftColors: Record<string, string> = {
  'Операционная': 'bg-red-500/20 border-red-500/30 text-red-300',
  'Дежурство': 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  'Утренняя': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
  'Вечерняя': 'bg-violet-500/20 border-violet-500/30 text-violet-300',
  'Склад': 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  'Приём': 'bg-blue-500/20 border-blue-500/30 text-blue-300',
};

let shiftIdCounter = 100;
const MAX_VISIBLE_SHIFTS = 2;

function nextDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + 1);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// ─── ShiftBlock ───────────────────────────────────────────────

function ShiftBlock({ shift, isDragging, onContextMenu }: {
  shift: Shift; isDragging?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const cls = shiftColors[shift.type] || 'bg-white/10 border-white/20 text-white/70';
  return (
    <div
      onContextMenu={onContextMenu}
      className={`px-2.5 py-1.5 rounded-lg border text-xs leading-tight ${cls} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="font-semibold">{shift.type}</div>
      <div className="opacity-70 text-[10px]">{shift.startTime}–{shift.endTime}</div>
    </div>
  );
}

// ─── DraggableShift ───────────────────────────────────────────

function DraggableShift({ shift, onContextMenu }: {
  shift: Shift;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: shift.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <ShiftBlock shift={shift} isDragging={isDragging} onContextMenu={onContextMenu} />
    </div>
  );
}

// ─── DroppableCell ────────────────────────────────────────────

function DroppableCell({ id, children, onClick, onContextMenu }: {
  id: string; children: React.ReactNode;
  onClick?: () => void; onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`h-full rounded-lg border border-transparent transition-colors ${
        isOver ? 'border-cyan-400/30 bg-cyan-400/5' : ''
      }`}
    >
      {children}
    </div>
  );
}

// ─── OverflowPopover ──────────────────────────────────────────

function OverflowPopover({ shifts, onClose, onContextMenu }: {
  shifts: Shift[];
  onClose: () => void;
  onContextMenu: (e: React.MouseEvent, shift: Shift) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', handleKey); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 rounded-xl shadow-2xl p-2.5 min-w-[180px] flex flex-col gap-1.5"
      style={{
        background: 'rgba(17, 21, 56, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/10">
        <span className="text-[10px] text-white/50 font-medium">Скрытые смены (+{shifts.length})</span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 transition-colors">
          <X size={12} className="text-white/40" />
        </button>
      </div>
      {shifts.map(s => (
        <DraggableShift key={s.id} shift={s} onContextMenu={(e) => onContextMenu(e, s)} />
      ))}
    </div>
  );
}

// ─── ContextMenu ──────────────────────────────────────────────

interface CtxMenuState {
  x: number; y: number;
  shift?: Shift;
  empId: string; date: string;
}

function ContextMenu({ ctx, onClose, onEdit, onCopy, onPaste, onDelete, onDuplicate, hasCopied }: {
  ctx: CtxMenuState; onClose: () => void;
  onEdit: () => void; onCopy: () => void; onPaste: () => void;
  onDelete: () => void; onDuplicate: () => void; hasCopied: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') { onClose(); return; }
      if (e instanceof MouseEvent && ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', handle); };
  }, [onClose]);

  const items = ctx.shift
    ? [
        { icon: Pencil, label: 'Редактировать', action: onEdit },
        { icon: Copy, label: 'Копировать', action: onCopy },
        { icon: CopyPlus, label: 'Дублировать на завтра', action: onDuplicate },
        { icon: Trash2, label: 'Удалить', action: onDelete, danger: true },
      ]
    : [
        ...(hasCopied ? [{ icon: ClipboardPaste, label: 'Вставить смену', action: onPaste }] : []),
        { icon: Plus, label: 'Создать смену', action: onEdit },
      ];

  return (
    <div
      ref={ref}
      style={{ left: ctx.x, top: ctx.y }}
      className="fixed z-[100] glass-strong rounded-xl shadow-2xl py-1.5 min-w-[180px]"
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
              (item as any).danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── ShiftModal ───────────────────────────────────────────────

interface ShiftFormData {
  employeeId: string; date: string;
  type: string; startTime: string; endTime: string; location: string;
}

function ShiftModal({ open, onClose, onSave, initial, title }: {
  open: boolean; onClose: () => void;
  onSave: (data: ShiftFormData) => void;
  initial: ShiftFormData; title: string;
}) {
  const [form, setForm] = useState<ShiftFormData>(initial);

  useEffect(() => { if (open) setForm(initial); }, [open, initial]);

  const emp = employees.find(e => e.id === form.employeeId);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Сотрудник</label>
          <div className="glass rounded-xl px-5 py-3 text-sm text-white/80">
            {emp ? emp.name : 'Не выбран'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Дата</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Тип смены</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white/80 outline-none border border-white/10 cursor-pointer"
          >
            {shiftTypes.map(t => <option key={t} value={t} className="bg-[#111538]">{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Начало</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs font-medium">Окончание</label>
            <input
              type="time"
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.target.value })}
              className="w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Локация</label>
          <select
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full bg-white/5 rounded-xl px-5 py-3 text-sm text-white/80 outline-none border border-white/10 cursor-pointer"
          >
            {shiftLocations.map(l => <option key={l} value={l} className="bg-[#111538]">{l}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={() => onSave(form)}>
            {title.includes('Редакт') ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── ViewModeToggle labels ────────────────────────────────────

const viewModeLabels: Record<ViewMode, string> = {
  week: 'Неделя',
  '2weeks': '2 Недели',
  month: 'Месяц',
};

// ─── SchedulePage ─────────────────────────────────────────────

export default function SchedulePage() {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'manager';
  const { toast } = useToast();

  const [shiftsList, setShiftsList] = useState(initialShifts);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [filter, setFilter] = useState('');

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [startDate, setStartDate] = useState<Date>(getMonday());

  const [shiftModal, setShiftModal] = useState<{ open: boolean; editId?: string; empId: string; date: string } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);
  const [copiedShift, setCopiedShift] = useState<Shift | null>(null);
  const [overflowCell, setOverflowCell] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const dates = getDateRange(startDate, viewMode);

  const displayEmployees = employees.filter(e =>
    e.appRole !== 'admin' && (!filter || e.location === filter)
  );
  const locations = [...new Set(employees.map(e => e.location))];

  const today = fmt(new Date());

  const isWeek = viewMode === 'week';
  const fixedColWidth = 110;

  // ── drag handlers ───────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setActiveShift(shiftsList.find(s => s.id === event.active.id) || null);
    setOverflowCell(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveShift(null);
    const { active, over } = event;
    if (!over) return;
    const [empId, date] = (over.id as string).split('::');
    const shift = shiftsList.find(s => s.id === active.id);
    if (!shift) return;
    const emp = employees.find(e => e.id === empId);
    if (shift.type === 'Операционная' && emp) {
      if (emp.certificates.some(c => c.expired)) {
        toast(`Нельзя назначить ${emp.name}: сертификат просрочен!`, 'warning');
        return;
      }
    }
    setShiftsList(prev => prev.map(s => s.id === active.id ? { ...s, employeeId: empId, date } : s));
    toast(`Смена перемещена: ${emp?.name}, ${date}`, 'success');
  };

  // ── shift CRUD ──────────────────────────────────────────────

  const createShift = useCallback((data: ShiftFormData) => {
    const id = `s_new_${shiftIdCounter++}`;
    setShiftsList(prev => [...prev, { id, ...data, status: 'scheduled' }]);
    toast('Смена создана', 'success');
    setShiftModal(null);
  }, [toast]);

  const updateShift = useCallback((editId: string, data: ShiftFormData) => {
    setShiftsList(prev => prev.map(s => s.id === editId ? { ...s, ...data } : s));
    toast('Смена обновлена', 'success');
    setShiftModal(null);
  }, [toast]);

  const deleteShift = useCallback((id: string) => {
    setShiftsList(prev => prev.filter(s => s.id !== id));
    toast('Смена удалена', 'info');
  }, [toast]);

  const duplicateShift = useCallback((shift: Shift) => {
    const tomorrow = nextDateStr(shift.date);
    const id = `s_dup_${shiftIdCounter++}`;
    setShiftsList(prev => [...prev, { ...shift, id, date: tomorrow }]);
    toast(`Смена дублирована на ${tomorrow}`, 'success');
  }, [toast]);

  const pasteShift = useCallback((empId: string, date: string) => {
    if (!copiedShift) return;
    const id = `s_paste_${shiftIdCounter++}`;
    setShiftsList(prev => [...prev, {
      ...copiedShift, id, employeeId: empId, date, status: 'scheduled',
    }]);
    toast('Смена вставлена', 'success');
  }, [copiedShift, toast]);

  // ── context menu handlers ───────────────────────────────────

  const handleShiftContext = (e: React.MouseEvent, shift: Shift, empId: string, date: string) => {
    if (!canEdit) return;
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, shift, empId, date });
  };

  const handleCellContext = (e: React.MouseEvent, empId: string, date: string) => {
    if (!canEdit) return;
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, empId, date });
  };

  const handleCellClick = (empId: string, date: string) => {
    if (!canEdit) return;
    setShiftModal({ open: true, empId, date });
  };

  // ── modal data ──────────────────────────────────────────────

  const getModalInitial = (): ShiftFormData => {
    if (shiftModal?.editId) {
      const s = shiftsList.find(sh => sh.id === shiftModal.editId)!;
      return { employeeId: s.employeeId, date: s.date, type: s.type, startTime: s.startTime, endTime: s.endTime, location: s.location };
    }
    const emp = employees.find(e => e.id === shiftModal?.empId);
    return {
      employeeId: shiftModal?.empId || '',
      date: shiftModal?.date || today,
      type: shiftTypes[0],
      startTime: '08:00', endTime: '16:00',
      location: emp?.location || shiftLocations[0],
    };
  };

  // ── navigation ──────────────────────────────────────────────

  const goBack = () => setStartDate(prev => navigatePeriod(prev, viewMode, -1));
  const goForward = () => setStartDate(prev => navigatePeriod(prev, viewMode, 1));
  const goToday = () => setStartDate(getMonday());

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'month') {
      setStartDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    } else {
      setStartDate(getMonday(startDate));
    }
  };

  // ── render ──────────────────────────────────────────────────

  const empColWidth = 190;

  return (
    <DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6">
        {/* ── Toolbar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-xs transition-colors">
              Сегодня
            </button>
            <button onClick={goForward} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <span className="text-white/80 text-sm font-medium flex items-center gap-2">
            <CalendarDays size={16} className="text-cyan-400" />
            {formatDateRange(startDate, viewMode)}
          </span>

          <div className="flex items-center glass rounded-xl overflow-hidden">
            {(['week', '2weeks', 'month'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => changeViewMode(mode)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {viewModeLabels[mode]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="glass rounded-xl px-4 py-2 text-xs text-white/80 bg-transparent outline-none cursor-pointer"
            >
              <option value="" className="bg-[#111538]">Все локации</option>
              {locations.map(l => <option key={l} value={l} className="bg-[#111538]">{l}</option>)}
            </select>
            <Badge variant="info">{displayEmployees.length} сотрудников</Badge>
          </div>
        </div>

        {/* ── Schedule Table ─────────────────────────────────── */}
        <div className="glass rounded-2xl overflow-x-auto relative">
          <table
            className="text-sm border-collapse"
            style={isWeek
              ? { width: '100%', tableLayout: 'fixed' }
              : { width: `${empColWidth + dates.length * fixedColWidth}px`, tableLayout: 'fixed' }
            }
          >
            <colgroup>
              <col style={isWeek ? { width: empColWidth } : { width: empColWidth }} />
              {dates.map(d => (
                <col key={d} style={isWeek ? {} : { width: fixedColWidth }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium sticky left-0 z-20 bg-[#111538]/95 backdrop-blur-sm">
                  Сотрудник
                </th>
                {dates.map(date => {
                  const isToday = date === today;
                  return (
                    <th key={date} className="px-1 py-3 text-center text-xs font-medium">
                      <div className={`flex flex-col gap-0.5 ${isToday ? 'text-cyan-400' : 'text-white/40'}`}>
                        <span>{getDayLabel(date)}</span>
                        <span className={isToday ? 'text-cyan-400/70' : 'text-white/20'}>{date.slice(5)}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayEmployees.map(emp => (
                <tr key={emp.id} className="border-t border-white/5">
                  <td className="px-4 py-2 sticky left-0 z-10 bg-[#111538]/95 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {emp.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-white/80 text-xs font-medium truncate">{emp.name}</div>
                        <div className="text-white/30 text-[10px] truncate">{emp.position}</div>
                      </div>
                    </div>
                  </td>
                  {dates.map(date => {
                    const cellShifts = shiftsList.filter(s => s.employeeId === emp.id && s.date === date);
                    const cellKey = `${emp.id}::${date}`;
                    const visibleShifts = cellShifts.slice(0, MAX_VISIBLE_SHIFTS);
                    const hiddenShifts = cellShifts.slice(MAX_VISIBLE_SHIFTS);
                    const isOverflowOpen = overflowCell === cellKey;

                    return (
                      <td key={date} className="p-0.5 align-top" style={{ height: 82 }}>
                        <DroppableCell
                          id={cellKey}
                          onClick={cellShifts.length === 0 ? () => handleCellClick(emp.id, date) : undefined}
                          onContextMenu={(e) => handleCellContext(e, emp.id, date)}
                        >
                          <div className="relative flex flex-col gap-1 p-1 h-full">
                            {cellShifts.length === 0 && canEdit && (
                              <div className="flex-1 flex items-center justify-center group/empty">
                                <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center opacity-0 group-hover/empty:opacity-100 transition-opacity">
                                  <Plus size={12} className="text-cyan-400" />
                                </div>
                              </div>
                            )}

                            {visibleShifts.map(s => (
                              <DraggableShift
                                key={s.id}
                                shift={s}
                                onContextMenu={(e) => handleShiftContext(e, s, emp.id, date)}
                              />
                            ))}

                            {hiddenShifts.length > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOverflowCell(isOverflowOpen ? null : cellKey); }}
                                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-white/50 hover:text-white/80 transition-colors text-center"
                              >
                                +{hiddenShifts.length} ещё
                              </button>
                            )}

                            {canEdit && cellShifts.length > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, date); }}
                                className="flex items-center justify-center py-0.5 rounded-md opacity-0 hover:!opacity-100 group-hover:opacity-40 transition-opacity"
                              >
                                <Plus size={10} className="text-cyan-400" />
                              </button>
                            )}

                            {isOverflowOpen && (
                              <OverflowPopover
                                shifts={hiddenShifts}
                                onClose={() => setOverflowCell(null)}
                                onContextMenu={(e, s) => handleShiftContext(e, s, emp.id, date)}
                              />
                            )}
                          </div>
                        </DroppableCell>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Drag overlay ───────────────────────────────────────── */}
      <DragOverlay dropAnimation={null}>
        {activeShift ? (
          <div className="pointer-events-none" style={{ opacity: 0.9 }}>
            <ShiftBlock shift={activeShift} />
          </div>
        ) : null}
      </DragOverlay>

      {/* ── Context Menu ───────────────────────────────────────── */}
      {ctxMenu && (
        <ContextMenu
          ctx={ctxMenu}
          hasCopied={!!copiedShift}
          onClose={() => setCtxMenu(null)}
          onEdit={() => {
            if (ctxMenu.shift) {
              setShiftModal({ open: true, editId: ctxMenu.shift.id, empId: ctxMenu.empId, date: ctxMenu.date });
            } else {
              setShiftModal({ open: true, empId: ctxMenu.empId, date: ctxMenu.date });
            }
          }}
          onCopy={() => { if (ctxMenu.shift) setCopiedShift(ctxMenu.shift); toast('Смена скопирована', 'info'); }}
          onPaste={() => pasteShift(ctxMenu.empId, ctxMenu.date)}
          onDelete={() => { if (ctxMenu.shift) deleteShift(ctxMenu.shift.id); }}
          onDuplicate={() => { if (ctxMenu.shift) duplicateShift(ctxMenu.shift); }}
        />
      )}

      {/* ── Shift Modal ────────────────────────────────────────── */}
      {shiftModal && (
        <ShiftModal
          open={shiftModal.open}
          title={shiftModal.editId ? 'Редактировать смену' : 'Создать смену'}
          initial={getModalInitial()}
          onClose={() => setShiftModal(null)}
          onSave={(data) => {
            if (shiftModal.editId) {
              updateShift(shiftModal.editId, data);
            } else {
              createShift(data);
            }
          }}
        />
      )}
    </DndContext>
  );
}

import { useState, useCallback } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensors, useSensor, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  Type, ListFilter, CheckSquare, Calendar, Hash, Mail, Save, Trash2,
  GripVertical, Heading1, AlignLeft, CircleDot, TextCursorInput, Minus,
  ToggleLeft, Pencil, Eye, Code, Plus, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

// ─── Types ───────────────────────────────────────────────────

interface WidgetDef {
  type: string;
  label: string;
  icon: React.ElementType;
  category: 'layout' | 'input' | 'choice';
}

interface WidgetInstance {
  instanceId: string;
  type: string;
  label: string;
  icon: React.ElementType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  description?: string;
}

// ─── Palette ─────────────────────────────────────────────────

const palette: WidgetDef[] = [
  { type: 'heading', label: 'Заголовок', icon: Heading1, category: 'layout' },
  { type: 'paragraph', label: 'Описание / Текст', icon: AlignLeft, category: 'layout' },
  { type: 'divider', label: 'Разделитель', icon: Minus, category: 'layout' },
  { type: 'text', label: 'Текстовое поле', icon: Type, category: 'input' },
  { type: 'textarea', label: 'Многострочное поле', icon: TextCursorInput, category: 'input' },
  { type: 'number', label: 'Числовое поле', icon: Hash, category: 'input' },
  { type: 'email', label: 'Email', icon: Mail, category: 'input' },
  { type: 'date', label: 'Дата', icon: Calendar, category: 'input' },
  { type: 'select', label: 'Выпадающий список', icon: ListFilter, category: 'choice' },
  { type: 'radio', label: 'Выбор варианта', icon: CircleDot, category: 'choice' },
  { type: 'checkbox', label: 'Чекбокс', icon: CheckSquare, category: 'choice' },
  { type: 'toggle', label: 'Переключатель', icon: ToggleLeft, category: 'choice' },
];

const categoryLabels: Record<string, string> = {
  layout: 'Разметка',
  input: 'Ввод данных',
  choice: 'Выбор',
};

let widgetCounter = 100;

const demoWidgets: WidgetInstance[] = [
  { instanceId: 'demo-0', type: 'heading', label: 'Заявка на отпуск', icon: Heading1 },
  { instanceId: 'demo-1', type: 'paragraph', label: 'Описание', icon: AlignLeft, description: 'Заполните форму для подачи заявки на отпуск. Все обязательные поля отмечены звёздочкой.' },
  { instanceId: 'demo-2', type: 'divider', label: '', icon: Minus },
  { instanceId: 'demo-3', type: 'text', label: 'ФИО сотрудника', icon: Type, placeholder: 'Иванов Иван Иванович', required: true },
  { instanceId: 'demo-4', type: 'email', label: 'Email', icon: Mail, placeholder: 'ivan@adaptix.com', required: true },
  { instanceId: 'demo-5', type: 'select', label: 'Тип отпуска', icon: ListFilter, options: ['Ежегодный оплачиваемый', 'За свой счёт', 'Учебный', 'По уходу за ребёнком'], required: true },
  { instanceId: 'demo-6', type: 'date', label: 'Дата начала', icon: Calendar, required: true },
  { instanceId: 'demo-7', type: 'date', label: 'Дата окончания', icon: Calendar, required: true },
  { instanceId: 'demo-8', type: 'textarea', label: 'Комментарий', icon: TextCursorInput, placeholder: 'Укажите дополнительную информацию...' },
  { instanceId: 'demo-9', type: 'radio', label: 'Замещающий сотрудник', icon: CircleDot, options: ['Петров А.С.', 'Сидорова М.И.', 'Козлова Е.В.', 'Не требуется'] },
  { instanceId: 'demo-10', type: 'checkbox', label: 'Согласие', icon: CheckSquare, description: 'Подтверждаю корректность данных', required: true },
];

function defaultProps(type: string): Partial<WidgetInstance> {
  switch (type) {
    case 'heading': return { label: 'Заголовок формы' };
    case 'paragraph': return { label: 'Описание', description: 'Заполните форму ниже для подачи заявки.' };
    case 'divider': return { label: '' };
    case 'text': return { label: 'Текстовое поле', placeholder: 'Введите текст...' };
    case 'textarea': return { label: 'Комментарий', placeholder: 'Опишите подробнее...' };
    case 'number': return { label: 'Числовое поле', placeholder: '0' };
    case 'email': return { label: 'Email', placeholder: 'email@example.com' };
    case 'date': return { label: 'Дата' };
    case 'select': return { label: 'Выпадающий список', options: ['Вариант 1', 'Вариант 2', 'Вариант 3'] };
    case 'radio': return { label: 'Выбор варианта', options: ['Вариант A', 'Вариант B', 'Вариант C'] };
    case 'checkbox': return { label: 'Чекбокс', description: 'Включить опцию' };
    case 'toggle': return { label: 'Переключатель', description: 'Активировать' };
    default: return {};
  }
}

// ─── Palette Item ────────────────────────────────────────────

function PaletteItem({ widget }: { widget: WidgetDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `pal-${widget.type}`, data: widget });
  const Icon = widget.icon;
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      className={`flex items-center gap-2.5 px-3 py-2.5 glass glass-hover rounded-xl cursor-grab active:cursor-grabbing transition-all text-xs ${isDragging ? 'opacity-40' : ''}`}
    >
      <Icon size={14} className="text-cyan-400 shrink-0" />
      <span className="text-white/70">{widget.label}</span>
    </div>
  );
}

// ─── Canvas Drop Zone ────────────────────────────────────────

function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] p-4 rounded-2xl border-2 border-dashed transition-colors ${
        isOver ? 'border-cyan-400/40 bg-cyan-400/5' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      {children}
    </div>
  );
}

// ─── Canvas Widget (editable) ────────────────────────────────

function CanvasWidget({ widget, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: {
  widget: WidgetInstance;
  onUpdate: (data: Partial<WidgetInstance>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [optionInput, setOptionInput] = useState('');
  const Icon = widget.icon;
  const hasOptions = widget.type === 'select' || widget.type === 'radio';

  return (
    <div className="glass rounded-xl px-4 py-3 group relative">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5 mt-1">
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-0.5 rounded hover:bg-white/10 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition-colors">
            <ChevronUp size={12} />
          </button>
          <GripVertical size={14} className="text-white/15 mx-auto" />
          <button onClick={onMoveDown} disabled={isLast}
            className="p-0.5 rounded hover:bg-white/10 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition-colors">
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={13} className="text-cyan-400 shrink-0" />
            {editing ? (
              <input
                value={widget.label}
                onChange={e => onUpdate({ label: e.target.value })}
                className="bg-white/5 rounded px-2 py-0.5 text-sm text-white outline-none border border-cyan-400/30 flex-1"
                autoFocus
              />
            ) : (
              <span className="text-sm text-white/60 truncate">{widget.label || '(без названия)'}</span>
            )}
            {widget.required && <span className="text-red-400 text-xs">*</span>}
          </div>

          {editing && (
            <div className="flex flex-col gap-2 mt-2 pl-5">
              {widget.type !== 'heading' && widget.type !== 'divider' && (
                <label className="flex items-center gap-2 text-[11px] text-white/40">
                  <input type="checkbox" checked={widget.required || false}
                    onChange={e => onUpdate({ required: e.target.checked })} className="rounded" />
                  Обязательное
                </label>
              )}

              {(widget.placeholder !== undefined && !['heading', 'paragraph', 'divider', 'checkbox', 'toggle', 'radio'].includes(widget.type)) && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-white/30">Placeholder</span>
                  <input value={widget.placeholder || ''} onChange={e => onUpdate({ placeholder: e.target.value })}
                    className="bg-white/5 rounded px-2 py-1 text-xs text-white/80 outline-none border border-white/10" />
                </div>
              )}

              {(widget.type === 'paragraph' || widget.type === 'checkbox' || widget.type === 'toggle') && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-white/30">
                    {widget.type === 'paragraph' ? 'Текст' : 'Подпись'}
                  </span>
                  <textarea value={widget.description || ''} onChange={e => onUpdate({ description: e.target.value })}
                    rows={2} className="bg-white/5 rounded px-2 py-1 text-xs text-white/80 outline-none border border-white/10 resize-none" />
                </div>
              )}

              {hasOptions && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-white/30">Варианты</span>
                  {(widget.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input value={opt}
                        onChange={e => {
                          const newOpts = [...(widget.options || [])];
                          newOpts[i] = e.target.value;
                          onUpdate({ options: newOpts });
                        }}
                        className="bg-white/5 rounded px-2 py-1 text-xs text-white/80 outline-none border border-white/10 flex-1" />
                      <button onClick={() => onUpdate({ options: (widget.options || []).filter((_, j) => j !== i) })}
                        className="p-0.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <input value={optionInput} onChange={e => setOptionInput(e.target.value)}
                      placeholder="Новый вариант..."
                      onKeyDown={e => {
                        if (e.key === 'Enter' && optionInput.trim()) {
                          onUpdate({ options: [...(widget.options || []), optionInput.trim()] });
                          setOptionInput('');
                        }
                      }}
                      className="bg-white/5 rounded px-2 py-1 text-xs text-white/80 outline-none border border-white/10 flex-1" />
                    <button onClick={() => {
                      if (optionInput.trim()) {
                        onUpdate({ options: [...(widget.options || []), optionInput.trim()] });
                        setOptionInput('');
                      }
                    }} className="p-1 rounded hover:bg-cyan-500/10 text-cyan-400/60 hover:text-cyan-400 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!editing && widget.type !== 'heading' && widget.type !== 'divider' && widget.type !== 'paragraph' && (
            <div className="pl-5 mt-0.5">
              {widget.type === 'text' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10">{widget.placeholder}</div>
              )}
              {widget.type === 'textarea' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10 h-12">{widget.placeholder}</div>
              )}
              {widget.type === 'select' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10 flex items-center justify-between">
                  {widget.options?.[0] || 'Выберите...'} <ChevronDown size={10} className="text-white/20" />
                </div>
              )}
              {widget.type === 'radio' && (
                <div className="flex flex-col gap-1">
                  {(widget.options || []).slice(0, 2).map((o, i) => (
                    <span key={i} className="text-[11px] text-white/30 flex items-center gap-1.5">
                      <CircleDot size={10} className="text-white/15" /> {o}
                    </span>
                  ))}
                  {(widget.options || []).length > 2 && <span className="text-[10px] text-white/20">+{(widget.options || []).length - 2} ещё</span>}
                </div>
              )}
              {widget.type === 'checkbox' && (
                <span className="text-[11px] text-white/30 flex items-center gap-1.5"><CheckSquare size={10} className="text-white/15" /> {widget.description}</span>
              )}
              {widget.type === 'toggle' && (
                <span className="text-[11px] text-white/30 flex items-center gap-1.5"><ToggleLeft size={10} className="text-white/15" /> {widget.description}</span>
              )}
              {widget.type === 'number' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10">{widget.placeholder}</div>
              )}
              {widget.type === 'email' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10">{widget.placeholder}</div>
              )}
              {widget.type === 'date' && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 border border-white/10">дд.мм.гггг</div>
              )}
            </div>
          )}
          {!editing && widget.type === 'paragraph' && (
            <p className="pl-5 mt-0.5 text-[11px] text-white/30 leading-relaxed">{widget.description}</p>
          )}
          {!editing && widget.type === 'divider' && (
            <div className="pl-5 mt-1 border-t border-white/10" />
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(!editing)}
            className={`p-1.5 rounded-lg transition-colors ${editing ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/10 text-white/30 hover:text-white/60'}`}>
            <Pencil size={12} />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live Preview (light theme form render) ──────────────────

function LivePreview({ widgets }: { widgets: WidgetInstance[] }) {
  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Добавьте компоненты для превью
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {widgets.map(w => (
        <div key={w.instanceId}>
          {w.type === 'heading' && (
            <h2 className="text-xl font-bold text-gray-800">{w.label}</h2>
          )}

          {w.type === 'paragraph' && (
            <p className="text-sm text-gray-500 leading-relaxed">{w.description}</p>
          )}

          {w.type === 'divider' && (
            <hr className="border-gray-200 my-1" />
          )}

          {w.type === 'text' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <input type="text" placeholder={w.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
          )}

          {w.type === 'textarea' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <textarea placeholder={w.placeholder} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none" />
            </div>
          )}

          {w.type === 'number' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <input type="number" placeholder={w.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
          )}

          {w.type === 'email' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <input type="email" placeholder={w.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
          )}

          {w.type === 'date' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <input type="date"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
          )}

          {w.type === 'select' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white cursor-pointer">
                <option value="">Выберите...</option>
                {(w.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {w.type === 'radio' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex flex-col gap-2">
                {(w.options || []).map((o, i) => (
                  <label key={i} className="flex items-center gap-2.5 cursor-pointer group/radio">
                    <input type="radio" name={`radio-${w.instanceId}`}
                      className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600 group-hover/radio:text-gray-900 transition-colors">{o}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {w.type === 'checkbox' && (
            <label className="flex items-center gap-2.5 cursor-pointer group/cb">
              <input type="checkbox" className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm text-gray-600 group-hover/cb:text-gray-900 transition-colors">
                {w.description || w.label}
              </span>
              {w.required && <span className="text-red-500 text-xs">*</span>}
            </label>
          )}

          {w.type === 'toggle' && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {w.label} {w.required && <span className="text-red-500">*</span>}
              </label>
              <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:ring-2 focus:ring-blue-500">
                <span className="inline-block h-4 w-4 rounded-full bg-white shadow transform translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="pt-3 border-t border-gray-200 mt-2">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          Отправить
        </button>
      </div>
    </div>
  );
}

// ─── Tab Switcher ────────────────────────────────────────────

type RightTab = 'preview' | 'json';

// ─── Main Page ───────────────────────────────────────────────

export default function UIDesignerPage() {
  const [canvasWidgets, setCanvasWidgets] = useState<WidgetInstance[]>(demoWidgets);
  const [activeWidget, setActiveWidget] = useState<WidgetDef | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('preview');
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const type = (event.active.id as string).replace('pal-', '');
    const w = palette.find(p => p.type === type);
    setActiveWidget(w || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveWidget(null);
    const { active, over } = event;
    if (!over || over.id !== 'canvas') return;

    const type = (active.id as string).replace('pal-', '');
    const def = palette.find(w => w.type === type);
    if (def) {
      const props = defaultProps(def.type);
      setCanvasWidgets(prev => [...prev, {
        instanceId: `inst-${widgetCounter++}`,
        type: def.type,
        label: props.label || def.label,
        icon: def.icon,
        placeholder: props.placeholder,
        options: props.options,
        description: props.description,
        required: false,
      }]);
    }
  };

  const updateWidget = useCallback((instanceId: string, data: Partial<WidgetInstance>) => {
    setCanvasWidgets(prev => prev.map(w => w.instanceId === instanceId ? { ...w, ...data } : w));
  }, []);

  const removeWidget = useCallback((instanceId: string) => {
    setCanvasWidgets(prev => prev.filter(w => w.instanceId !== instanceId));
  }, []);

  const moveWidget = useCallback((instanceId: string, direction: -1 | 1) => {
    setCanvasWidgets(prev => {
      const idx = prev.findIndex(w => w.instanceId === instanceId);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }, []);

  const jsonSchema = canvasWidgets.map(w => {
    const obj: Record<string, unknown> = { type: w.type, label: w.label };
    if (w.required) obj.required = true;
    if (w.placeholder) obj.placeholder = w.placeholder;
    if (w.options?.length) obj.options = w.options;
    if (w.description) obj.description = w.description;
    return obj;
  });

  const groupedPalette = ['layout', 'input', 'choice'].map(cat => ({
    category: cat,
    label: categoryLabels[cat],
    items: palette.filter(w => w.category === cat),
  }));

  return (
    <DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-[220px_1fr_340px] gap-6 h-full">
        {/* ── Left: Palette ──────────────────────────────── */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          <h3 className="text-white/60 text-[11px] font-medium uppercase tracking-wider">Компоненты</h3>
          {groupedPalette.map(g => (
            <div key={g.category} className="flex flex-col gap-2">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{g.label}</span>
              {g.items.map(w => <PaletteItem key={w.type} widget={w} />)}
            </div>
          ))}
        </div>

        {/* ── Center: Canvas ─────────────────────────────── */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-white/60 text-[11px] font-medium uppercase tracking-wider">
              Канвас формы ({canvasWidgets.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCanvasWidgets([])}>Очистить</Button>
              <Button size="sm" onClick={() => toast('Форма сохранена', 'success')}>
                <Save size={13} /> Сохранить
              </Button>
            </div>
          </div>

          <CanvasDropZone>
            {canvasWidgets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[280px] text-white/15 text-sm gap-2">
                <Plus size={28} className="text-white/10" />
                Перетащите компоненты сюда
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {canvasWidgets.map((w, i) => (
                <CanvasWidget
                  key={w.instanceId}
                  widget={w}
                  onUpdate={(data) => updateWidget(w.instanceId, data)}
                  onRemove={() => removeWidget(w.instanceId)}
                  onMoveUp={() => moveWidget(w.instanceId, -1)}
                  onMoveDown={() => moveWidget(w.instanceId, 1)}
                  isFirst={i === 0}
                  isLast={i === canvasWidgets.length - 1}
                />
              ))}
            </div>
          </CanvasDropZone>
        </div>

        {/* ── Right: Preview / JSON ──────────────────────── */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center gap-1 glass rounded-xl overflow-hidden self-start">
            <button
              onClick={() => setRightTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                rightTab === 'preview' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Eye size={13} /> Превью
            </button>
            <button
              onClick={() => setRightTab('json')}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                rightTab === 'json' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Code size={13} /> JSON
            </button>
          </div>

          {rightTab === 'preview' ? (
            <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[300px]">
              <LivePreview widgets={canvasWidgets} />
            </div>
          ) : (
            <GlassCard className="!p-4">
              <pre className="text-[11px] text-cyan-300/80 bg-black/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {canvasWidgets.length > 0
                  ? JSON.stringify(jsonSchema, null, 2)
                  : '// Добавьте компоненты на канвас'}
              </pre>
            </GlassCard>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeWidget ? (() => {
          const Icon = activeWidget.icon;
          return (
            <div className="opacity-90 pointer-events-none flex items-center gap-2.5 px-3 py-2.5 glass rounded-xl text-xs">
              <Icon size={14} className="text-cyan-400" />
              <span className="text-white/70">{activeWidget.label}</span>
            </div>
          );
        })() : null}
      </DragOverlay>
    </DndContext>
  );
}

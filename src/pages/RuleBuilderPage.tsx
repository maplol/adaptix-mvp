import { useState, useEffect } from 'react';
import {
  CalendarPlus, ArrowLeftRight, Palmtree, CalendarX, CalendarCheck, Clock,
  Plus, Trash2, Power, Pencil, ChevronLeft, Monitor, X, Check,
  FileText, Shield, ChevronRight,
} from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  userEndpoints, systemActions, mockRules, conditionFields, operators,
  type UserEndpoint, type Rule, type SystemAction, type FormField,
} from '../data/rules';

const iconMap: Record<string, React.ElementType> = {
  CalendarPlus, ArrowLeftRight, Palmtree, CalendarX, CalendarCheck, Clock,
};

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    iconBg: 'bg-cyan-500/15' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  iconBg: 'bg-violet-500/15' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/15' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     iconBg: 'bg-red-500/15' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   iconBg: 'bg-amber-500/15' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  iconBg: 'bg-orange-500/15' },
};

const actionBadgeColor: Record<SystemAction, string> = {
  'block':            'bg-red-500/15 text-red-400 border-red-500/20',
  'allow':            'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'notify':           'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'require-approval': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'auto-approve':     'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

let ruleIdCounter = 300;

// ─── Endpoint Card ─────────────────────────────────────────────

function EndpointCard({ ep, rulesCount, onClick }: {
  ep: UserEndpoint; rulesCount: number; onClick: () => void;
}) {
  const Icon = iconMap[ep.icon] || Clock;
  const c = colorMap[ep.color] || colorMap.cyan;

  return (
    <button
      onClick={onClick}
      className="glass glass-hover rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={22} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm mb-0.5">{ep.label}</h4>
          <p className="text-white/30 text-xs mb-2">{ep.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <code className={`text-[10px] px-2 py-0.5 rounded-md ${c.bg} ${c.text} font-mono`}>{ep.endpoint}</code>
            <Badge variant="info">
              {rulesCount} {rulesCount === 1 ? 'правило' : rulesCount < 5 ? 'правила' : 'правил'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-white/20 text-[10px]">
            <FileText size={10} />
            <span>{ep.formFields.length} полей формы</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 mt-1 transition-colors" />
      </div>
    </button>
  );
}

// ─── Form Preview ──────────────────────────────────────────────

function FormPreview({ fields, color, activeRuleField }: {
  fields: FormField[]; color: string; activeRuleField: string | null;
}) {
  const c = colorMap[color] || colorMap.cyan;

  const fieldTypeIcons: Record<string, string> = {
    text: 'Аа', number: '#', date: '📅', select: '▼', 'date-range': '📅↔📅', time: '🕐',
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={14} className={c.text} />
        <span className="text-white/50 text-xs font-medium">Форма сотрудника</span>
      </div>

      {fields.map((field) => {
        const isHighlighted = activeRuleField !== null &&
          field.label.toLowerCase().includes(activeRuleField.toLowerCase());

        return (
          <div
            key={field.id}
            className={`rounded-xl border p-3 transition-all duration-300 ${
              isHighlighted
                ? `${c.border} ${c.bg} ring-1 ring-offset-0 ${c.border}`
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-medium transition-colors ${isHighlighted ? c.text : 'text-white/50'}`}>
                {field.label}
                {field.required && <span className="text-red-400/60 ml-0.5">*</span>}
              </label>
              <span className="text-[10px] text-white/15">{fieldTypeIcons[field.type] || '?'}</span>
            </div>

            {field.type === 'select' ? (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/25 border border-white/5 flex items-center justify-between">
                <span>{field.options?.[0] || 'Выберите...'}</span>
                <span className="text-[10px]">▾</span>
              </div>
            ) : field.type === 'number' ? (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/25 border border-white/5">
                {field.placeholder || '0'}
              </div>
            ) : field.type === 'date' ? (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/25 border border-white/5">
                дд.мм.гггг
              </div>
            ) : field.type === 'time' ? (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/25 border border-white/5">
                чч:мм
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/25 border border-white/5">
                {field.placeholder || 'Введите...'}
              </div>
            )}

            {isHighlighted && (
              <div className="flex items-center gap-1 mt-2">
                <Shield size={10} className={c.text} />
                <span className={`text-[10px] ${c.text}`}>Привязано правило</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Inline Rule Row ───────────────────────────────────────────

function RuleRow({ rule, onToggle, onEdit, onDelete, onHover }: {
  rule: Rule;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
  onHover: (field: string | null) => void;
}) {
  const actionLabel = systemActions.find(a => a.value === rule.action)?.label || rule.action;

  return (
    <tr
      className={`border-t border-white/5 transition-all ${!rule.active ? 'opacity-40' : ''}`}
      onMouseEnter={() => onHover(rule.field)}
      onMouseLeave={() => onHover(null)}
    >
      <td className="px-4 py-3">
        <span className="text-white/70 text-sm">{rule.field}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-amber-300 text-sm">{rule.op}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-white/80 text-sm">{rule.value}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${actionBadgeColor[rule.action]}`}>
          {actionLabel}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title={rule.active ? 'Выключить' : 'Включить'}>
            <Power size={13} className={rule.active ? 'text-emerald-400' : 'text-white/20'} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/25 hover:text-cyan-400" title="Редактировать">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-white/20 hover:text-red-400" title="Удалить">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Inline Add/Edit Rule Row ──────────────────────────────────

function RuleFormRow({ initial, onSave, onCancel }: {
  initial?: Rule;
  onSave: (data: { field: string; op: string; value: string; action: SystemAction }) => void;
  onCancel: () => void;
}) {
  const [field, setField] = useState(initial?.field || conditionFields[0]);
  const [op, setOp] = useState(initial?.op || operators[0]);
  const [value, setValue] = useState(initial?.value || '');
  const [action, setAction] = useState<SystemAction>(initial?.action || 'block');

  useEffect(() => {
    if (initial) {
      setField(initial.field);
      setOp(initial.op);
      setValue(initial.value);
      setAction(initial.action);
    }
  }, [initial]);

  const selectCls = "bg-white/5 rounded-lg px-3 py-2 text-xs text-white/80 outline-none border border-cyan-400/20 cursor-pointer w-full";
  const inputCls = "bg-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none border border-cyan-400/20 focus:border-cyan-400/40 transition-colors w-full";

  return (
    <tr className="border-t border-cyan-400/10 bg-cyan-400/[0.03]">
      <td className="px-4 py-2.5">
        <select value={field} onChange={e => setField(e.target.value)} className={selectCls}>
          {conditionFields.map(f => <option key={f} value={f} className="bg-[#111538]">{f}</option>)}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <select value={op} onChange={e => setOp(e.target.value)} className={`${selectCls} w-16 font-mono`}>
          {operators.map(o => <option key={o} value={o} className="bg-[#111538]">{o}</option>)}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onSave({ field, op, value: value.trim(), action }); }}
          placeholder="Значение..."
          className={inputCls}
          autoFocus
        />
      </td>
      <td className="px-4 py-2.5">
        <select value={action} onChange={e => setAction(e.target.value as SystemAction)} className={selectCls}>
          {systemActions.map(a => <option key={a.value} value={a.value} className="bg-[#111538]">{a.label}</option>)}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-0.5 justify-end">
          <button
            onClick={() => { if (value.trim()) onSave({ field, op, value: value.trim(), action }); }}
            className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-emerald-400"
            title="Сохранить"
          >
            <Check size={14} />
          </button>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30" title="Отмена">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function RuleBuilderPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [selectedEpId, setSelectedEpId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredRuleField, setHoveredRuleField] = useState<string | null>(null);

  const selectedEp = userEndpoints.find(e => e.id === selectedEpId);
  const epRules = selectedEpId ? rules.filter(r => r.endpointId === selectedEpId) : [];

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast('Правило удалено', 'info');
  };

  const addRule = (data: { field: string; op: string; value: string; action: SystemAction }) => {
    const newRule: Rule = {
      id: `r_${ruleIdCounter++}`,
      endpointId: selectedEpId!,
      ...data,
      active: true,
    };
    setRules(prev => [...prev, newRule]);
    setAddingNew(false);
    toast('Правило добавлено', 'success');
  };

  const updateRule = (id: string, data: { field: string; op: string; value: string; action: SystemAction }) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    setEditingId(null);
    toast('Правило обновлено', 'success');
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Monitor size={28} className="text-white/20" />
        </div>
        <h3 className="text-white/60 font-semibold text-lg">Только на десктопе</h3>
        <p className="text-white/30 text-sm max-w-xs">
          Visual Rule Builder требует большой экран. Откройте на компьютере.
        </p>
      </div>
    );
  }

  // ── Level 1: Endpoint grid ────────────────────────────────────

  if (!selectedEpId) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">Выберите действие пользователя для настройки правил</p>
          <Badge variant="info">{rules.length} правил всего</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {userEndpoints.map(ep => (
            <EndpointCard
              key={ep.id}
              ep={ep}
              rulesCount={rules.filter(r => r.endpointId === ep.id).length}
              onClick={() => { setSelectedEpId(ep.id); setAddingNew(false); setEditingId(null); }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Level 2: Form preview + Rules table ───────────────────────

  const c = colorMap[selectedEp?.color || 'cyan'];
  const EpIcon = iconMap[selectedEp?.icon || 'Clock'] || Clock;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setSelectedEpId(null); setAddingNew(false); setEditingId(null); setHoveredRuleField(null); }}
          className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          <EpIcon size={18} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold">{selectedEp?.label}</h3>
            <code className={`text-[10px] px-2 py-0.5 rounded-md ${c.bg} ${c.text} font-mono`}>{selectedEp?.endpoint}</code>
          </div>
          <p className="text-white/30 text-xs">{selectedEp?.description}</p>
        </div>
        <Button onClick={() => { setAddingNew(true); setEditingId(null); }}>
          <Plus size={16} /> Добавить правило
        </Button>
      </div>

      {/* Two-column layout: form + rules */}
      <div className="grid grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Left: Form preview */}
        <GlassCard className="sticky top-6">
          <FormPreview
            fields={selectedEp?.formFields || []}
            color={selectedEp?.color || 'cyan'}
            activeRuleField={hoveredRuleField}
          />
        </GlassCard>

        {/* Right: Rules table */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield size={14} className={c.text} />
              <span className="text-white/50 text-xs font-medium">Правила валидации</span>
            </div>
            <span className="text-white/20 text-xs">{epRules.length} {epRules.length === 1 ? 'правило' : 'правил'}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-left text-xs">
                <th className="px-4 py-3 font-medium">Поле</th>
                <th className="px-4 py-3 font-medium w-[80px]">Оператор</th>
                <th className="px-4 py-3 font-medium">Значение</th>
                <th className="px-4 py-3 font-medium">Действие</th>
                <th className="px-3 py-3 font-medium text-right w-[110px]">Управление</th>
              </tr>
            </thead>
            <tbody>
              {epRules.map(rule => (
                editingId === rule.id ? (
                  <RuleFormRow
                    key={rule.id}
                    initial={rule}
                    onSave={(data) => updateRule(rule.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onToggle={() => toggleRule(rule.id)}
                    onEdit={() => { setEditingId(rule.id); setAddingNew(false); }}
                    onDelete={() => deleteRule(rule.id)}
                    onHover={setHoveredRuleField}
                  />
                )
              ))}
              {addingNew && (
                <RuleFormRow
                  onSave={addRule}
                  onCancel={() => setAddingNew(false)}
                />
              )}
              {epRules.length === 0 && !addingNew && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-white/20 text-sm mb-3">Нет правил для этого действия</p>
                    <Button size="sm" onClick={() => setAddingNew(true)}>
                      <Plus size={14} /> Добавить первое правило
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  ShieldBan, ArrowLeftRight, Bell, CheckCircle, Zap,
  Plus, Trash2, Power, Save, Pencil, X, ChevronLeft, Monitor,
} from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  actionDefs, mockRules, conditionFields, operators,
  type ActionDef, type Rule, type RuleCondition,
} from '../data/rules';

const iconMap: Record<string, React.ElementType> = {
  ShieldBan, ArrowLeftRight, Bell, CheckCircle, Zap,
};

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     badge: 'danger'  },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'success' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   badge: 'warning' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  badge: 'info'    },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    badge: 'info'    },
};

let ruleIdCounter = 200;
let condIdCounter = 200;

function ConditionBadge({ condition }: { condition: RuleCondition }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-xs">
      <span className="text-white/50">{condition.field}</span>
      <span className="text-amber-300 font-mono">{condition.op}</span>
      <span className="text-white/80">{condition.value}</span>
    </span>
  );
}

interface RuleFormState {
  name: string;
  description: string;
  conditions: RuleCondition[];
}

function RuleFormModal({ open, onClose, onSave, initial, title }: {
  open: boolean; onClose: () => void;
  onSave: (data: RuleFormState) => void;
  initial: RuleFormState; title: string;
}) {
  const [form, setForm] = useState<RuleFormState>(initial);
  const [newField, setNewField] = useState(conditionFields[0]);
  const [newOp, setNewOp] = useState(operators[0]);
  const [newValue, setNewValue] = useState('');

  const addCondition = () => {
    if (!newValue.trim()) return;
    setForm(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        id: `c_new_${condIdCounter++}`,
        field: newField,
        op: newOp,
        value: newValue.trim(),
      }],
    }));
    setNewValue('');
  };

  const removeCondition = (id: string) => {
    setForm(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) }));
  };

  const inputCls = "w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors";
  const selectCls = "bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80 outline-none border border-white/10 cursor-pointer";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Название</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Название правила..."
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs font-medium">Описание</label>
          <input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Краткое описание..."
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white/40 text-xs font-medium">Условия (ЕСЛИ все выполнены)</label>

          {form.conditions.length > 0 && (
            <div className="flex flex-col gap-2">
              {form.conditions.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-amber-300/60 text-[10px] font-medium">И</span>}
                  <div className="flex-1 flex items-center gap-2 glass rounded-lg px-3 py-2">
                    <span className="text-white/50 text-xs">{c.field}</span>
                    <span className="text-amber-300 font-mono text-xs">{c.op}</span>
                    <span className="text-white/80 text-xs">{c.value}</span>
                  </div>
                  <button
                    onClick={() => removeCondition(c.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <select value={newField} onChange={e => setNewField(e.target.value)} className={`${selectCls} flex-1 min-w-[120px]`}>
              {conditionFields.map(f => <option key={f} value={f} className="bg-[#111538]">{f}</option>)}
            </select>
            <select value={newOp} onChange={e => setNewOp(e.target.value)} className={`${selectCls} w-20`}>
              {operators.map(o => <option key={o} value={o} className="bg-[#111538]">{o}</option>)}
            </select>
            <input
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCondition(); }}
              placeholder="Значение"
              className={`${inputCls} flex-1 min-w-[100px]`}
            />
            <Button variant="secondary" size="sm" onClick={addCondition}>
              <Plus size={14} /> Добавить
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => {
              if (!form.name.trim()) return;
              onSave(form);
            }}
            disabled={!form.name.trim()}
          >
            <Save size={14} /> Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Action Card (tile in the grid) ────────────────────────────

function ActionCard({ action, rulesCount, isSelected, onClick }: {
  action: ActionDef; rulesCount: number;
  isSelected: boolean; onClick: () => void;
}) {
  const Icon = iconMap[action.icon] || Zap;
  const c = colorMap[action.color] || colorMap.cyan;

  return (
    <button
      onClick={onClick}
      className={`glass glass-hover rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer group ${
        isSelected ? `ring-2 ${c.border} ring-offset-0` : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium text-sm truncate">{action.label}</h4>
          </div>
          <p className="text-white/30 text-xs line-clamp-2">{action.description}</p>
          <div className="mt-3">
            <Badge variant={c.badge as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
              {rulesCount} {rulesCount === 1 ? 'правило' : rulesCount < 5 ? 'правила' : 'правил'}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Rule Row ──────────────────────────────────────────────────

function RuleRow({ rule, color, onToggle, onEdit, onDelete }: {
  rule: Rule; color: string;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`glass rounded-xl p-4 transition-all ${!rule.active ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-white text-sm font-medium truncate">{rule.name}</h5>
            <Badge variant={rule.active ? 'success' : 'default'} className="text-[10px] px-1.5 py-0">
              {rule.active ? 'Вкл' : 'Выкл'}
            </Badge>
          </div>
          <p className="text-white/30 text-xs mb-3">{rule.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {rule.conditions.map((cond, i) => (
              <span key={cond.id} className="contents">
                {i > 0 && <span className="text-amber-300/50 text-[10px] self-center font-medium px-0.5">И</span>}
                <ConditionBadge condition={cond} />
              </span>
            ))}
            <span className="text-amber-300/50 text-[10px] self-center font-medium px-0.5">→</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border ${c.border} ${c.bg} ${c.text} text-xs font-medium`}>
              {actionDefs.find(a => a.id === rule.actionId)?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title={rule.active ? 'Выключить' : 'Включить'}>
            <Power size={14} className={rule.active ? 'text-emerald-400' : 'text-white/20'} />
          </button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-cyan-400" title="Редактировать">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-white/20 hover:text-red-400" title="Удалить">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function RuleBuilderPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<{ open: boolean; editId?: string } | null>(null);

  const selectedAction = actionDefs.find(a => a.id === selectedActionId);
  const actionRules = selectedActionId
    ? rules.filter(r => r.actionId === selectedActionId)
    : [];

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    toast(`Правило «${rule?.name}» удалено`, 'info');
  };

  const saveRule = (data: RuleFormState, editId?: string) => {
    if (editId) {
      setRules(prev => prev.map(r => r.id === editId ? { ...r, ...data } : r));
      toast(`Правило «${data.name}» обновлено`, 'success');
    } else {
      const newRule: Rule = {
        id: `r_${ruleIdCounter++}`,
        ...data,
        active: true,
        actionId: selectedActionId!,
      };
      setRules(prev => [...prev, newRule]);
      toast(`Правило «${data.name}» создано`, 'success');
    }
    setFormModal(null);
  };

  const getFormInitial = (): RuleFormState => {
    if (formModal?.editId) {
      const r = rules.find(rule => rule.id === formModal.editId)!;
      return { name: r.name, description: r.description, conditions: [...r.conditions] };
    }
    return { name: '', description: '', conditions: [] };
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Monitor size={28} className="text-white/20" />
        </div>
        <h3 className="text-white/60 font-semibold text-lg">Только на десктопе</h3>
        <p className="text-white/30 text-sm max-w-xs">
          Visual Rule Builder требует большой экран для визуального редактирования. Откройте на компьютере.
        </p>
      </div>
    );
  }

  if (!selectedActionId) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-white/40 text-sm">Выберите действие для управления правилами</p>
          </div>
          <Badge variant="info">{rules.length} правил всего</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {actionDefs.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              rulesCount={rules.filter(r => r.actionId === action.id).length}
              isSelected={false}
              onClick={() => setSelectedActionId(action.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  const actionColor = selectedAction?.color || 'cyan';
  const c = colorMap[actionColor];
  const ActionIcon = iconMap[selectedAction?.icon || 'Zap'] || Zap;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedActionId(null)}
          className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <ActionIcon size={18} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold">{selectedAction?.label}</h3>
          <p className="text-white/30 text-xs">{selectedAction?.description}</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })}>
          <Plus size={16} /> Новое правило
        </Button>
      </div>

      {actionRules.length === 0 ? (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center`}>
              <ActionIcon size={24} className={`${c.text} opacity-50`} />
            </div>
            <p className="text-white/30 text-sm">Нет правил для этого действия</p>
            <Button size="sm" onClick={() => setFormModal({ open: true })}>
              <Plus size={14} /> Создать первое правило
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {actionRules.map(rule => (
            <RuleRow
              key={rule.id}
              rule={rule}
              color={actionColor}
              onToggle={() => toggleRule(rule.id)}
              onEdit={() => setFormModal({ open: true, editId: rule.id })}
              onDelete={() => deleteRule(rule.id)}
            />
          ))}
        </div>
      )}

      {formModal && (
        <RuleFormModal
          open={formModal.open}
          title={formModal.editId ? 'Редактировать правило' : 'Новое правило'}
          initial={getFormInitial()}
          onClose={() => setFormModal(null)}
          onSave={(data) => saveRule(data, formModal.editId)}
        />
      )}
    </div>
  );
}

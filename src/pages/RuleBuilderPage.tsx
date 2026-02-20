import { useState } from 'react';
import { Plus, Trash2, Power, Save, GripVertical } from 'lucide-react';
import GlassCard from '../components/layout/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { mockRules, conditionFields, operators, actions, type Rule, type RuleBlock } from '../data/rules';

let blockIdCounter = 100;

function RuleBlockView({ block, onRemove }: { block: RuleBlock; onRemove: () => void }) {
  const colors: Record<string, string> = {
    condition: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    operator: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    action: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${colors[block.type]}`}>
      <GripVertical size={14} className="opacity-40 cursor-grab" />
      <span>{block.label}</span>
      <button onClick={onRemove} className="opacity-40 hover:opacity-100 transition-opacity">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function RuleBuilderPage() {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [editingBlocks, setEditingBlocks] = useState<RuleBlock[]>([]);
  const [ruleName, setRuleName] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const { toast } = useToast();

  const [newField, setNewField] = useState(conditionFields[0]);
  const [newOp, setNewOp] = useState(operators[0]);
  const [newValue, setNewValue] = useState('');
  const [newAction, setNewAction] = useState(actions[0]);

  const addCondition = () => {
    if (!newValue) return;
    const id = `nb${blockIdCounter++}`;
    const label = `${newField} ${newOp} ${newValue}`;
    if (editingBlocks.length > 0 && editingBlocks[editingBlocks.length - 1].type !== 'operator') {
      setEditingBlocks(prev => [...prev, { id: `no${blockIdCounter++}`, type: 'operator', label: 'И' }]);
    }
    setEditingBlocks(prev => [...prev, { id, type: 'condition', field: newField, op: newOp, value: newValue, label }]);
    setNewValue('');
  };

  const addAction = () => {
    if (editingBlocks.length > 0 && editingBlocks[editingBlocks.length - 1].type !== 'operator') {
      setEditingBlocks(prev => [...prev, { id: `no${blockIdCounter++}`, type: 'operator', label: 'ТО' }]);
    }
    setEditingBlocks(prev => [...prev, { id: `nb${blockIdCounter++}`, type: 'action', label: newAction }]);
  };

  const saveRule = () => {
    if (!ruleName || editingBlocks.length === 0) return;
    const rule: Rule = {
      id: `r${Date.now()}`,
      name: ruleName,
      description: 'Пользовательское правило',
      active: true,
      blocks: editingBlocks,
    };
    setRules(prev => [...prev, rule]);
    setEditingBlocks([]);
    setRuleName('');
    setShowBuilder(false);
    toast(`Правило «${ruleName}» сохранено`, 'success');
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="info">{rules.length} правил</Badge>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)}>
          <Plus size={16} /> Новое правило
        </Button>
      </div>

      {showBuilder && (
        <GlassCard>
          <div className="flex flex-col gap-6">
            <input
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              placeholder="Название правила..."
              className="w-full bg-white/5 rounded-xl px-5 py-3.5 text-sm text-white outline-none border border-white/10 focus:border-cyan-400/30 transition-colors"
            />

            <div className="flex flex-wrap gap-2.5 min-h-[56px] p-4 rounded-xl border border-dashed border-white/10 bg-white/3">
              {editingBlocks.length === 0 && (
                <span className="text-white/20 text-sm">Добавьте условия и действия...</span>
              )}
              {editingBlocks.map((block, i) => (
                <RuleBlockView key={block.id} block={block} onRemove={() => setEditingBlocks(prev => prev.filter((_, j) => j !== i))} />
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-xs font-medium">Поле</label>
                <select value={newField} onChange={e => setNewField(e.target.value)} className="glass rounded-lg px-4 py-2.5 text-sm text-white/80 bg-transparent outline-none">
                  {conditionFields.map(f => <option key={f} value={f} className="bg-[#111538]">{f}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-xs font-medium">Оператор</label>
                <select value={newOp} onChange={e => setNewOp(e.target.value)} className="glass rounded-lg px-4 py-2.5 text-sm text-white/80 bg-transparent outline-none">
                  {operators.map(o => <option key={o} value={o} className="bg-[#111538]">{o}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-xs font-medium">Значение</label>
                <input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="Значение"
                  className="glass rounded-lg px-4 py-2.5 text-sm text-white/80 bg-transparent outline-none w-36"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={addCondition}>+ Условие</Button>

              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-xs font-medium">Действие</label>
                <select value={newAction} onChange={e => setNewAction(e.target.value)} className="glass rounded-lg px-4 py-2.5 text-sm text-white/80 bg-transparent outline-none">
                  {actions.map(a => <option key={a} value={a} className="bg-[#111538]">{a}</option>)}
                </select>
              </div>
              <Button variant="secondary" size="sm" onClick={addAction}>+ Действие</Button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setShowBuilder(false); setEditingBlocks([]); setRuleName(''); }}>Отмена</Button>
              <Button onClick={saveRule}><Save size={16} /> Сохранить</Button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="flex flex-col gap-5">
        {rules.map(rule => (
          <GlassCard key={rule.id}>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-medium">{rule.name}</h4>
                    <Badge variant={rule.active ? 'success' : 'default'}>
                      {rule.active ? 'Активно' : 'Выключено'}
                    </Badge>
                  </div>
                  <p className="text-white/40 text-xs">{rule.description}</p>
                </div>
                <button onClick={() => toggleRule(rule.id)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Power size={16} className={rule.active ? 'text-emerald-400' : 'text-white/30'} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {rule.blocks.map(block => (
                  <div
                    key={block.id}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      block.type === 'condition' ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300' :
                      block.type === 'operator' ? 'border-amber-500/20 bg-amber-500/5 text-amber-300' :
                      'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                    }`}
                  >
                    {block.label}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react'
import type { AnyTransformationRule, TransformationRuleFactory } from '../types/transformation'
import RuleEditor from './RuleEditor'

interface RuleListProps {
  rules: AnyTransformationRule[]
  availableRuleTypes: string[]
  ruleFactories: Record<string, TransformationRuleFactory>
  onAddRule: (ruleType: string) => void
  onUpdateRule: (id: string, rule: AnyTransformationRule) => void
  onRemoveRule: (id: string) => void
  onReorderRules: (rules: AnyTransformationRule[]) => void
}

export default function RuleList({
  rules,
  availableRuleTypes,
  ruleFactories,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onReorderRules
}: RuleListProps) {
  const [selectedRuleType, setSelectedRuleType] = useState('')
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)

  const handleAddRule = () => {
    if (selectedRuleType) {
      onAddRule(selectedRuleType)
      setSelectedRuleType('')
    }
  }

  const moveRule = (index: number, direction: 'up' | 'down') => {
    const newRules = [...rules]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newRules.length) {
      [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]]
      onReorderRules(newRules)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">変換ルール</h2>
        <div className="flex gap-2">
          <select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">ルールを選択...</option>
            {availableRuleTypes.map(type => (
              <option key={type} value={type}>
                {ruleFactories[type].name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddRule}
            disabled={!selectedRuleType}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">まだルールが追加されていません。</p>
          <p>上のドロップダウンからルールを選択して追加してください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => (
            <div key={rule.id} className={`border border-gray-200 rounded bg-white ${!rule.enabled ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{rule.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {ruleFactories[rule.type]?.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onUpdateRule(rule.id, { ...rule, enabled: e.target.checked })}
                      className="rounded"
                    />
                    有効
                  </label>
                  
                  <button
                    onClick={() => moveRule(index, 'up')}
                    disabled={index === 0}
                    className="text-base p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="上に移動"
                  >
                    ↑
                  </button>
                  
                  <button
                    onClick={() => moveRule(index, 'down')}
                    disabled={index === rules.length - 1}
                    className="text-base p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="下に移動"
                  >
                    ↓
                  </button>
                  
                  <button
                    onClick={() => setEditingRuleId(editingRuleId === rule.id ? null : rule.id)}
                    className="text-base p-1 rounded hover:bg-gray-200 transition-colors"
                    title="編集"
                  >
                    ⚙️
                  </button>
                  
                  <button
                    onClick={() => onRemoveRule(rule.id)}
                    className="text-base p-1 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {editingRuleId === rule.id && (
                <RuleEditor
                  rule={rule}
                  ruleFactory={ruleFactories[rule.type]}
                  onUpdate={(updatedRule) => onUpdateRule(rule.id, updatedRule)}
                  onClose={() => setEditingRuleId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
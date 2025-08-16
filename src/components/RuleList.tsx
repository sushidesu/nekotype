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
    <div className="rule-list">
      <div className="rule-list-header">
        <h2>変換ルール</h2>
        <div className="add-rule-section">
          <select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value)}
            className="rule-type-select"
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
            className="add-rule-button"
          >
            追加
          </button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="no-rules">
          <p>まだルールが追加されていません。</p>
          <p>上のドロップダウンからルールを選択して追加してください。</p>
        </div>
      ) : (
        <div className="rules-container">
          {rules.map((rule, index) => (
            <div key={rule.id} className={`rule-item ${!rule.enabled ? 'disabled' : ''}`}>
              <div className="rule-header">
                <div className="rule-info">
                  <span className="rule-order">#{index + 1}</span>
                  <span className="rule-name">{rule.name}</span>
                  <span className="rule-type">{ruleFactories[rule.type]?.name}</span>
                </div>
                
                <div className="rule-controls">
                  <label className="enable-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onUpdateRule(rule.id, { ...rule, enabled: e.target.checked })}
                    />
                    有効
                  </label>
                  
                  <button
                    onClick={() => moveRule(index, 'up')}
                    disabled={index === 0}
                    className="move-button"
                    title="上に移動"
                  >
                    ↑
                  </button>
                  
                  <button
                    onClick={() => moveRule(index, 'down')}
                    disabled={index === rules.length - 1}
                    className="move-button"
                    title="下に移動"
                  >
                    ↓
                  </button>
                  
                  <button
                    onClick={() => setEditingRuleId(editingRuleId === rule.id ? null : rule.id)}
                    className="edit-button"
                    title="編集"
                  >
                    ⚙️
                  </button>
                  
                  <button
                    onClick={() => onRemoveRule(rule.id)}
                    className="remove-button"
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
import { useState } from 'react'
import type { AnyTransformationRule, TransformationRuleFactory, SimpleReplaceRule, RegexRule } from '../types/transformation'

interface RuleEditorProps {
  rule: AnyTransformationRule
  ruleFactory: TransformationRuleFactory
  onUpdate: (rule: AnyTransformationRule) => void
  onClose: () => void
}

export default function RuleEditor({ rule, ruleFactory, onUpdate, onClose }: RuleEditorProps) {
  const [localRule, setLocalRule] = useState(rule)

  const handleSave = () => {
    if (ruleFactory.validateConfig(localRule.config)) {
      onUpdate(localRule)
      onClose()
    }
  }

  const updateConfig = (updates: any) => {
    setLocalRule(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }))
  }

  const updateName = (name: string) => {
    setLocalRule(prev => ({ ...prev, name }))
  }

  const isValid = ruleFactory.validateConfig(localRule.config)

  const renderConfigEditor = () => {
    switch (rule.type) {
      case 'simple-replace': {
        const config = localRule.config as SimpleReplaceRule['config']
        return (
          <div className="config-editor">
            <div className="form-group">
              <label>検索文字列:</label>
              <input
                type="text"
                value={config.search}
                onChange={(e) => updateConfig({ search: e.target.value })}
                placeholder="置換したい文字列"
              />
            </div>
            <div className="form-group">
              <label>置換文字列:</label>
              <input
                type="text"
                value={config.replace}
                onChange={(e) => updateConfig({ replace: e.target.value })}
                placeholder="置換後の文字列"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.caseSensitive}
                  onChange={(e) => updateConfig({ caseSensitive: e.target.checked })}
                />
                大文字小文字を区別する
              </label>
            </div>
          </div>
        )
      }
      
      case 'regex': {
        const config = localRule.config as RegexRule['config']
        return (
          <div className="config-editor">
            <div className="form-group">
              <label>正規表現パターン:</label>
              <input
                type="text"
                value={config.pattern}
                onChange={(e) => updateConfig({ pattern: e.target.value })}
                placeholder="正規表現パターン"
                className={!isValid ? 'invalid' : ''}
              />
              {!isValid && <span className="error">無効な正規表現です</span>}
            </div>
            <div className="form-group">
              <label>置換文字列:</label>
              <input
                type="text"
                value={config.replacement}
                onChange={(e) => updateConfig({ replacement: e.target.value })}
                placeholder="置換後の文字列 ($1, $2等が使用可能)"
              />
            </div>
            <div className="form-group">
              <label>フラグ:</label>
              <input
                type="text"
                value={config.flags}
                onChange={(e) => updateConfig({ flags: e.target.value })}
                placeholder="g, i, m等"
              />
            </div>
          </div>
        )
      }
      
      case 'uppercase':
      case 'lowercase':
        return (
          <div className="config-editor">
            <p>このルールには設定項目がありません。</p>
          </div>
        )
      
      default:
        return (
          <div className="config-editor">
            <p>このルールタイプの設定エディタは実装されていません。</p>
          </div>
        )
    }
  }

  return (
    <div className="rule-editor">
      <div className="editor-header">
        <h4>ルール設定 - {ruleFactory.name}</h4>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="editor-content">
        <div className="form-group">
          <label>ルール名:</label>
          <input
            type="text"
            value={localRule.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="ルール名"
          />
        </div>
        
        {renderConfigEditor()}
      </div>
      
      <div className="editor-footer">
        <button onClick={onClose} className="cancel-button">
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="save-button"
        >
          保存
        </button>
      </div>
    </div>
  )
}
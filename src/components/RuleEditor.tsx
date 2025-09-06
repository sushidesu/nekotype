import { useState } from "react"
import type {
  AnyTransformationRule,
  TransformationRuleFactory,
} from "../types/transformation"

interface RuleEditorProps {
  rule: AnyTransformationRule
  ruleFactory: TransformationRuleFactory
  onUpdate: (rule: AnyTransformationRule) => void
  onClose: () => void
}

export default function RuleEditor({
  rule,
  ruleFactory,
  onUpdate,
  onClose,
}: RuleEditorProps) {
  const [localRule, setLocalRule] = useState(rule)

  const handleSave = () => {
    if (ruleFactory.validateConfig(localRule.config)) {
      onUpdate(localRule)
      onClose()
    }
  }

  const updateConfig = (updates: Record<string, unknown>) => {
    setLocalRule((prev) => {
      // typeごとに処理を分岐
      switch (prev.type) {
        case "simple-replace":
          return { ...prev, config: { ...prev.config, ...updates } }
        case "regex":
          return { ...prev, config: { ...prev.config, ...updates } }
        case "uppercase":
        case "lowercase":
          return prev // configの更新なし
        default:
          return prev
      }
    })
  }

  const isValid = ruleFactory.validateConfig(localRule.config)

  const renderConfigEditor = () => {
    switch (rule.type) {
      case "simple-replace": {
        if (localRule.type !== "simple-replace") return null
        const config = localRule.config
        return (
          <div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                検索文字列:
              </label>
              <input
                type="text"
                value={config.search}
                onChange={(e) => updateConfig({ search: e.target.value })}
                placeholder="置換したい文字列"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                置換文字列:
              </label>
              <input
                type="text"
                value={config.replace}
                onChange={(e) => updateConfig({ replace: e.target.value })}
                placeholder="置換後の文字列"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.caseSensitive}
                  onChange={(e) =>
                    updateConfig({ caseSensitive: e.target.checked })
                  }
                  className="rounded"
                />
                大文字小文字を区別する
              </label>
            </div>
          </div>
        )
      }

      case "regex": {
        if (localRule.type !== "regex") return null
        const config = localRule.config
        return (
          <div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                正規表現パターン:
              </label>
              <input
                type="text"
                value={config.pattern}
                onChange={(e) => updateConfig({ pattern: e.target.value })}
                placeholder="正規表現パターン"
                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${
                  !isValid
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {!isValid && (
                <span className="text-red-500 text-sm mt-1">
                  無効な正規表現です
                </span>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                置換文字列:
              </label>
              <input
                type="text"
                value={config.replacement}
                onChange={(e) => updateConfig({ replacement: e.target.value })}
                placeholder="置換後の文字列 ($1, $2等が使用可能)"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                フラグ:
              </label>
              <input
                type="text"
                value={config.flags}
                onChange={(e) => updateConfig({ flags: e.target.value })}
                placeholder="g, i, m等"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )
      }

      case "uppercase":
      case "lowercase":
        return (
          <div>
            <p className="text-gray-600">
              このルールには設定項目がありません。
            </p>
          </div>
        )

      default:
        return (
          <div>
            <p className="text-gray-600">
              このルールタイプの設定エディタは実装されていません。
            </p>
          </div>
        )
    }
  }

  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {ruleFactory.name}
        </h4>
        <button
          onClick={onClose}
          className="text-xl text-gray-500 hover:text-gray-700 p-0 bg-transparent border-none cursor-pointer"
        >
          ×
        </button>
      </div>

      <div className="mb-4">{renderConfigEditor()}</div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  )
}

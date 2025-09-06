import { useState, useMemo } from "react"
import type { AnyTransformationRule } from "./types/transformation"
import RuleList from "./components/RuleList"
import TextEditor from "./components/TextEditor"
import { transform } from "./core/transform"
import {
  addRule,
  removeRule,
  reorderRules,
  ruleFactories,
  updateRule,
} from "./core/rules"

function App() {
  const [inputText, setInputText] = useState("")
  const [rules, setRules] = useState<AnyTransformationRule[]>([])

  const outputText = useMemo(() => {
    return transform(rules)(inputText)
  }, [rules, inputText])

  const handleAddRule = (ruleType: string) => {
    const factory = ruleFactories[ruleType]
    if (factory) {
      const newRule = factory.createDefault()
      setRules((prev) => addRule(prev)(newRule))
    }
  }

  const handleUpdateRule = (id: string, updatedRule: AnyTransformationRule) => {
    setRules((prev) => updateRule(prev)(id, updatedRule))
  }

  const handleRemoveRule = (id: string) => {
    setRules((prev) => removeRule(prev)(id))
  }

  const handleReorderRules = (newRules: AnyTransformationRule[]) => {
    setRules(reorderRules(newRules))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 py-2 px-4">
        <h1 className="text-sm font-medium text-gray-900 text-center">
          NekoType
        </h1>
      </header>

      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 p-4 max-w-[1400px] mx-auto w-full">
        <div className="order-2 xl:order-1">
          <TextEditor
            inputText={inputText}
            outputText={outputText}
            onInputChange={setInputText}
          />
        </div>

        <div className="order-1 xl:order-2">
          <RuleList
            rules={rules}
            availableRuleTypes={Object.keys(ruleFactories)}
            ruleFactories={ruleFactories}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onRemoveRule={handleRemoveRule}
            onReorderRules={handleReorderRules}
          />
        </div>
      </main>
    </div>
  )
}

export default App

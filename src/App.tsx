import { useState, useEffect } from 'react'
import { createTransformationEngine, ruleFactories } from './utils/transformationEngine'
import type { AnyTransformationRule } from './types/transformation'
import RuleList from './components/RuleList'
import TextEditor from './components/TextEditor'

function App() {
  const [engine] = useState(() => createTransformationEngine())
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [rules, setRules] = useState<AnyTransformationRule[]>([])

  useEffect(() => {
    const result = engine.transform(inputText)
    setOutputText(result)
  }, [inputText, rules, engine])

  const handleAddRule = (ruleType: string) => {
    const factory = ruleFactories[ruleType]
    if (factory) {
      const newRule = factory.createDefault()
      engine.addRule(newRule)
      setRules([...engine.rules])
    }
  }

  const handleUpdateRule = (id: string, updatedRule: AnyTransformationRule) => {
    engine.updateRule(id, updatedRule)
    setRules([...engine.rules])
  }

  const handleRemoveRule = (id: string) => {
    engine.removeRule(id)
    setRules([...engine.rules])
  }

  const handleReorderRules = (newRules: AnyTransformationRule[]) => {
    engine.reorderRules(newRules)
    setRules([...engine.rules])
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-6 px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NekoType - テキスト変換ツール</h1>
        <p className="text-gray-600">複数の変換ルールを組み合わせてテキストを変換できます</p>
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

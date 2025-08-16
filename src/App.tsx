import { useState, useEffect } from 'react'
import './App.css'
import { createTransformationEngine, ruleFactories } from './utils/transformationEngine'
import { AnyTransformationRule } from './types/transformation'
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
    <div className="app">
      <header className="app-header">
        <h1>NekoType - テキスト変換ツール</h1>
        <p>複数の変換ルールを組み合わせてテキストを変換できます</p>
      </header>
      
      <main className="app-main">
        <div className="editor-section">
          <TextEditor
            inputText={inputText}
            outputText={outputText}
            onInputChange={setInputText}
          />
        </div>
        
        <div className="rules-section">
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

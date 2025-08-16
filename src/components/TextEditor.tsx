import { useState } from 'react'

interface TextEditorProps {
  inputText: string
  outputText: string
  onInputChange: (text: string) => void
}

export default function TextEditor({ inputText, outputText, onInputChange }: TextEditorProps) {
  const [isEditorVertical, setIsEditorVertical] = useState(true)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="text-editor">
      <div className="editor-controls">
        <h2>テキストエディタ</h2>
        <label className="layout-toggle">
          <input
            type="checkbox"
            checked={isEditorVertical}
            onChange={(e) => setIsEditorVertical(e.target.checked)}
          />
          縦並び表示
        </label>
      </div>
      
      <div className={`editor-container ${isEditorVertical ? 'vertical' : 'horizontal'}`}>
        <div className="input-section">
          <div className="section-header">
            <h3>入力テキスト</h3>
            <button 
              onClick={() => onInputChange('')}
              className="clear-button"
              title="クリア"
            >
              🗑️
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="変換したいテキストを入力してください..."
            className="text-input"
          />
        </div>
        
        <div className="output-section">
          <div className="section-header">
            <h3>出力テキスト</h3>
            <button 
              onClick={() => copyToClipboard(outputText)}
              className="copy-button"
              title="コピー"
              disabled={!outputText}
            >
              📋
            </button>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder="変換結果がここに表示されます..."
            className="text-output"
          />
        </div>
      </div>
    </div>
  )
}
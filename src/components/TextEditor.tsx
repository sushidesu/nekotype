import { useState } from "react"
import { EraserIcon, CopyIcon } from "@radix-ui/react-icons"

interface TextEditorProps {
  inputText: string
  outputText: string
  onInputChange: (text: string) => void
}

export default function TextEditor({
  inputText,
  outputText,
  onInputChange,
}: TextEditorProps) {
  const [isEditorVertical, setIsEditorVertical] = useState(true)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-fit">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          テキストエディタ
        </h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isEditorVertical}
            onChange={(e) => setIsEditorVertical(e.target.checked)}
            className="rounded"
          />
          縦並び表示
        </label>
      </div>

      <div
        className={`flex gap-4 ${isEditorVertical ? "flex-col" : "flex-row"}`}
      >
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium text-gray-700">
              入力テキスト
            </h3>
            <button
              onClick={() => onInputChange("")}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="クリア"
            >
              <EraserIcon className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="変換したいテキストを入力してください..."
            className="w-full min-h-[200px] p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm resize-y"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium text-gray-700">
              出力テキスト
            </h3>
            <button
              onClick={() => void copyToClipboard(outputText)}
              className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="コピー"
              disabled={!outputText}
            >
              <CopyIcon className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder="変換結果がここに表示されます..."
            className="w-full min-h-[200px] p-3 border border-gray-300 rounded bg-gray-50 text-gray-700 font-mono text-sm resize-y"
          />
        </div>
      </div>
    </div>
  )
}

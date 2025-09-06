import { useState } from "react"
import {
  EraserIcon,
  CopyIcon,
  ViewVerticalIcon,
  ViewHorizontalIcon,
  ClipboardIcon,
  CheckIcon,
} from "@radix-ui/react-icons"
import { preferences } from "../infrastructure/preferences"
import { useFeedback } from "../hooks/useFeedback"

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
  const [isEditorVertical, setIsEditorVertical] = useState(() => {
    const userPreferences = preferences.get()
    return userPreferences ? userPreferences.editorLayout === "vertical" : true
  })

  const [isShowFeedbackPaste, showPasteFeedback] = useFeedback()
  const [isShowFeedbackCopy, showCopyFeedback] = useFeedback()
  const [isShowFeedbackClear, showClearFeedback] = useFeedback()

  const handleLayoutChange = (vertical: boolean) => {
    setIsEditorVertical(vertical)
    preferences.save({
      editorLayout: vertical ? "vertical" : "horizontal",
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showCopyFeedback()
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onInputChange(text)
      showPasteFeedback()
    } catch (err) {
      console.error("Failed to paste text: ", err)
    }
  }

  const clearInput = () => {
    onInputChange("")
    showClearFeedback()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-fit">
      <div
        className={`flex gap-4 ${isEditorVertical ? "flex-col" : "flex-row"}`}
      >
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-700">
              入力テキスト
            </h3>
            <button
              onClick={() => void pasteFromClipboard()}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="ペースト"
            >
              {isShowFeedbackPaste ? (
                <CheckIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ClipboardIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={clearInput}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="クリア"
            >
              {isShowFeedbackClear ? (
                <CheckIcon className="w-5 h-5 text-green-600" />
              ) : (
                <EraserIcon className="w-5 h-5" />
              )}
            </button>
            {isEditorVertical && (
              <button
                onClick={() => handleLayoutChange(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors ml-auto"
                title="横並び表示に切り替え"
              >
                <ViewHorizontalIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="変換したいテキストを入力してください..."
            className="w-full min-h-[200px] p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm resize-y"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-700">
              出力テキスト
            </h3>
            <button
              onClick={() => void copyToClipboard(outputText)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="コピー"
            >
              {isShowFeedbackCopy ? (
                <CheckIcon className="w-5 h-5 text-green-600" />
              ) : (
                <CopyIcon className="w-5 h-5" />
              )}
            </button>
            {!isEditorVertical && (
              <button
                onClick={() => handleLayoutChange(true)}
                className="p-1 rounded hover:bg-gray-100 transition-colors ml-auto"
                title="縦並び表示に切り替え"
              >
                <ViewVerticalIcon className="w-5 h-5" />
              </button>
            )}
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

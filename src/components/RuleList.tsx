import { useState } from "react"
import type {
  AnyTransformationRule,
  TransformationRuleFactory,
} from "../types/transformation"
import RuleEditor from "./RuleEditor"
import { DragHandleDots2Icon, GearIcon, TrashIcon } from "@radix-ui/react-icons"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface RuleListProps {
  rules: AnyTransformationRule[]
  availableRuleTypes: string[]
  ruleFactories: Record<string, TransformationRuleFactory>
  onAddRule: (ruleType: string) => void
  onUpdateRule: (id: string, rule: AnyTransformationRule) => void
  onRemoveRule: (id: string) => void
  onReorderRules: (rules: AnyTransformationRule[]) => void
}

interface SortableRuleItemProps {
  rule: AnyTransformationRule
  ruleFactory: TransformationRuleFactory
  editingRuleId: string | null
  onUpdateRule: (id: string, rule: AnyTransformationRule) => void
  onRemoveRule: (id: string) => void
  onEditToggle: (id: string | null) => void
}

function SortableRuleItem({
  rule,
  ruleFactory,
  editingRuleId,
  onUpdateRule,
  onRemoveRule,
  onEditToggle,
}: SortableRuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded bg-white ${
        !rule.enabled ? "opacity-60" : ""
      } ${isDragging ? "opacity-0" : ""}`}
    >
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-gray-200 transition-colors cursor-grab active:cursor-grabbing"
            title="ドラッグして並び替え"
          >
            <DragHandleDots2Icon className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-gray-900">{rule.name}</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {ruleFactory?.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) =>
                onUpdateRule(rule.id, {
                  ...rule,
                  enabled: e.target.checked,
                })
              }
              className="rounded"
            />
            有効
          </label>

          <button
            onClick={() =>
              onEditToggle(editingRuleId === rule.id ? null : rule.id)
            }
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="編集"
          >
            <GearIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => onRemoveRule(rule.id)}
            className="p-1 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
            title="削除"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {editingRuleId === rule.id && (
        <RuleEditor
          rule={rule}
          ruleFactory={ruleFactory}
          onUpdate={(updatedRule) => onUpdateRule(rule.id, updatedRule)}
          onClose={() => onEditToggle(null)}
        />
      )}
    </div>
  )
}

export default function RuleList({
  rules,
  availableRuleTypes,
  ruleFactories,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onReorderRules,
}: RuleListProps) {
  const [selectedRuleType, setSelectedRuleType] = useState("")
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddRule = () => {
    if (selectedRuleType) {
      onAddRule(selectedRuleType)
      setSelectedRuleType("")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((rule) => rule.id === active.id)
      const newIndex = rules.findIndex((rule) => rule.id === over.id)

      onReorderRules(arrayMove(rules, oldIndex, newIndex))
    }

    setActiveId(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-visible">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-base font-medium text-gray-700 mb-4">変換ルール</h2>
        <div className="flex gap-2">
          <select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">ルールを選択...</option>
            {availableRuleTypes.map((type) => (
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rules.map((rule) => rule.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {rules.map((rule) => (
                <SortableRuleItem
                  key={rule.id}
                  rule={rule}
                  ruleFactory={ruleFactories[rule.type]}
                  editingRuleId={editingRuleId}
                  onUpdateRule={onUpdateRule}
                  onRemoveRule={onRemoveRule}
                  onEditToggle={setEditingRuleId}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId
              ? (() => {
                  const activeRule = rules.find((rule) => rule.id === activeId)
                  return activeRule ? (
                    <div className="border border-gray-200 rounded bg-white shadow-lg opacity-95">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2 flex-1">
                          <DragHandleDots2Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {activeRule.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            {ruleFactories[activeRule.type]?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activeRule.enabled}
                              className="rounded"
                              readOnly
                            />
                            有効
                          </label>
                          <GearIcon className="w-5 h-5" />
                          <TrashIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ) : null
                })()
              : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

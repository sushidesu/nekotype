import { useState } from "react"
import type {
  AnyTransformationRule,
  TransformationRuleFactory,
} from "../types/transformation"
import RuleEditor from "./RuleEditor"
import {
  DragHandleDots2Icon,
  GearIcon,
  TrashIcon,
  PlusIcon,
  CheckCircledIcon,
  CircleIcon,
  Share2Icon,
} from "@radix-ui/react-icons"
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
  onShare?: () => void
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
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-gray-200 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
            title="ドラッグして並び替え"
          >
            <DragHandleDots2Icon className="w-4 h-4 text-gray-400" />
          </button>
          <span
            className="text-gray-900 truncate"
            title={ruleFactory?.getTitle(rule)}
          >
            {ruleFactory?.getTitle(rule)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateRule(rule.id, {
                ...rule,
                enabled: !rule.enabled,
              })
            }
            className={`p-1 rounded transition-colors ${
              rule.enabled
                ? "hover:bg-gray-200 text-green-600"
                : "hover:bg-gray-200 text-gray-400"
            }`}
            title={
              rule.enabled
                ? "有効（クリックで無効化）"
                : "無効（クリックで有効化）"
            }
          >
            {rule.enabled ? (
              <CheckCircledIcon className="w-5 h-5" />
            ) : (
              <CircleIcon className="w-5 h-5" />
            )}
          </button>

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
  onShare,
}: RuleListProps) {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddRule = (ruleType: string) => {
    onAddRule(ruleType)
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-700">変換ルール</h2>
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-md transition-colors bg-white hover:bg-gray-50"
              title="設定を共有"
            >
              <Share2Icon className="w-3 h-3" />
              <span>共有</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableRuleTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleAddRule(type)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <PlusIcon className="w-3 h-3" />
              <span>{ruleFactories[type].name}</span>
            </button>
          ))}
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">まだルールが追加されていません。</p>
          <p>上のボタンからルールを選択して追加してください。</p>
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
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <DragHandleDots2Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span
                            className="text-gray-900 truncate"
                            title={ruleFactories[activeRule.type]?.getTitle(
                              activeRule
                            )}
                          >
                            {ruleFactories[activeRule.type]?.getTitle(
                              activeRule
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={
                              activeRule.enabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            {activeRule.enabled ? (
                              <CheckCircledIcon className="w-5 h-5" />
                            ) : (
                              <CircleIcon className="w-5 h-5" />
                            )}
                          </div>
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

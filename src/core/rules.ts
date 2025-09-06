import type {
  SimpleReplaceRule,
  AnyTransformationRule,
  RegexRule,
  UpperCaseRule,
  LowerCaseRule,
  TransformationRuleFactory,
} from "../types/transformation"
import { escapeRegExp } from "./escapeRegex"

export type RuleType = keyof typeof ruleFactories

export const ruleFactories: Record<string, TransformationRuleFactory> = {
  "simple-replace": {
    type: "simple-replace",
    name: "文字列置換",
    description: "指定した文字列を別の文字列に置き換えます",
    createDefault: (): SimpleReplaceRule => ({
      id: crypto.randomUUID(),
      type: "simple-replace",
      enabled: true,
      order: 0,
      config: {
        search: "",
        replace: "",
        caseSensitive: true,
      },
    }),
    transform: (text: string, rule: AnyTransformationRule) => {
      // Discriminated unionを使用して型を絞り込む
      if (rule.type !== "simple-replace") return text
      // この時点でTypeScriptはruleがSimpleReplaceRuleであることを知っている

      if (!rule.config.search) return text

      if (rule.config.caseSensitive) {
        return text.replaceAll(rule.config.search, rule.config.replace)
      } else {
        return text.replaceAll(
          new RegExp(escapeRegExp(rule.config.search), "gi"),
          rule.config.replace
        )
      }
    },
    validateConfig: (config: unknown) => {
      return (
        typeof config === "object" &&
        config !== null &&
        "search" in config &&
        "replace" in config &&
        "caseSensitive" in config
      )
    },
    getTitle: (rule: AnyTransformationRule) => {
      if (rule.type !== "simple-replace") return "文字列置換"
      const { search, replace } = rule.config
      if (!search && !replace) return "文字列置換"
      return `"${search}" → "${replace}"`
    },
  },

  regex: {
    type: "regex",
    name: "正規表現",
    description: "正規表現を使用して高度な文字列変換を行います",
    createDefault: (): RegexRule => ({
      id: crypto.randomUUID(),
      type: "regex",
      enabled: true,
      order: 0,
      config: {
        pattern: "",
        replacement: "",
        flags: "g",
      },
    }),
    transform: (text: string, rule: AnyTransformationRule) => {
      // Discriminated unionを使用して型を絞り込む
      if (rule.type !== "regex") return text
      // この時点でTypeScriptはruleがRegexRuleであることを知っている

      if (!rule.config.pattern) return text

      try {
        const regex = new RegExp(rule.config.pattern, rule.config.flags)
        return text.replace(regex, rule.config.replacement)
      } catch (error) {
        console.error("Invalid regex pattern:", error)
        return text
      }
    },
    validateConfig: () => {
      // バリデーションロジックはtransform内で実行
      return true
    },
    getTitle: (rule: AnyTransformationRule) => {
      if (rule.type !== "regex") return "正規表現"
      const { pattern } = rule.config
      if (!pattern) return "正規表現"
      return `/${pattern}/`
    },
  },

  uppercase: {
    type: "uppercase",
    name: "大文字変換",
    description: "すべての文字を大文字に変換します",
    createDefault: (): UpperCaseRule => ({
      id: crypto.randomUUID(),
      type: "uppercase",
      enabled: true,
      order: 0,
      config: {},
    }),
    transform: (text: string) => text.toUpperCase(),
    validateConfig: (config: unknown) => {
      return (
        typeof config === "object" &&
        config !== null &&
        Object.keys(config).length === 0
      )
    },
    getTitle: () => "大文字変換",
  },

  lowercase: {
    type: "lowercase",
    name: "小文字変換",
    description: "すべての文字を小文字に変換します",
    createDefault: (): LowerCaseRule => ({
      id: crypto.randomUUID(),
      type: "lowercase",
      enabled: true,
      order: 0,
      config: {},
    }),
    transform: (text: string) => text.toLowerCase(),
    validateConfig: (config: unknown) => {
      return (
        typeof config === "object" &&
        config !== null &&
        Object.keys(config).length === 0
      )
    },
    getTitle: () => "小文字変換",
  },
}

export const reorderRules = (
  newRules: readonly AnyTransformationRule[]
): AnyTransformationRule[] => {
  return newRules.map((rule, index) => ({
    ...rule,
    order: index,
  }))
}

export const addRule =
  (rules: readonly AnyTransformationRule[]) =>
  (rule: AnyTransformationRule): AnyTransformationRule[] => {
    return [...rules, { ...rule, order: rules.length }]
  }

export const removeRule =
  (rules: readonly AnyTransformationRule[]) =>
  (id: string): AnyTransformationRule[] => {
    return rules.filter((rule) => rule.id !== id)
  }

export const updateRule =
  (rules: readonly AnyTransformationRule[]) =>
  (id: string, updatedRule: AnyTransformationRule): AnyTransformationRule[] => {
    return rules.map((rule) => (rule.id === id ? { ...updatedRule, id } : rule))
  }

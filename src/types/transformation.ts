export interface TransformationRule {
  id: string
  name: string
  type: string
  enabled: boolean
  order: number
}

export interface SimpleReplaceRule extends TransformationRule {
  type: "simple-replace"
  config: {
    search: string
    replace: string
    caseSensitive: boolean
  }
}

export interface RegexRule extends TransformationRule {
  type: "regex"
  config: {
    pattern: string
    replacement: string
    flags: string
  }
}

export interface UpperCaseRule extends TransformationRule {
  type: "uppercase"
  config: Record<string, never>
}

export interface LowerCaseRule extends TransformationRule {
  type: "lowercase"
  config: Record<string, never>
}

export type AnyTransformationRule =
  | SimpleReplaceRule
  | RegexRule
  | UpperCaseRule
  | LowerCaseRule

export interface TransformationRuleFactory {
  type: string
  name: string
  description: string
  createDefault: () => AnyTransformationRule
  transform: (text: string, rule: AnyTransformationRule) => string
  validateConfig: (config: unknown) => boolean
}

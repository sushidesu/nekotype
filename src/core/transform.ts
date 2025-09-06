import type { AnyTransformationRule } from "../types/transformation"
import { ruleFactories } from "./rules"

export const transform =
  (rules: readonly AnyTransformationRule[]) =>
  (input: string): string => {
    return rules
      .filter((rule) => rule.enabled)
      .reduce((text, rule) => {
        const factory = ruleFactories[rule.type]
        if (!factory) {
          console.warn(`Unknown rule type: ${rule.type}`)
          return text
        }

        try {
          return factory.transform(text, rule)
        } catch (error) {
          console.error(`Error applying rule ${rule.name}:`, error)
          return text
        }
      }, input)
  }

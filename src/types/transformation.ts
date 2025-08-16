export interface TransformationRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order: number;
}

export interface SimpleReplaceRule extends TransformationRule {
  type: 'simple-replace';
  config: {
    search: string;
    replace: string;
    caseSensitive: boolean;
  };
}

export interface RegexRule extends TransformationRule {
  type: 'regex';
  config: {
    pattern: string;
    replacement: string;
    flags: string;
  };
}

export interface UpperCaseRule extends TransformationRule {
  type: 'uppercase';
  config: {};
}

export interface LowerCaseRule extends TransformationRule {
  type: 'lowercase';
  config: {};
}

export type AnyTransformationRule = 
  | SimpleReplaceRule 
  | RegexRule 
  | UpperCaseRule 
  | LowerCaseRule;

export interface TransformationRuleFactory<T extends TransformationRule = AnyTransformationRule> {
  type: string;
  name: string;
  description: string;
  createDefault: () => T;
  transform: (text: string, rule: T) => string;
  validateConfig: (config: T['config']) => boolean;
}

export interface TransformationEngine {
  rules: AnyTransformationRule[];
  transform: (input: string) => string;
  addRule: (rule: AnyTransformationRule) => void;
  removeRule: (id: string) => void;
  updateRule: (id: string, rule: AnyTransformationRule) => void;
  reorderRules: (rules: AnyTransformationRule[]) => void;
}
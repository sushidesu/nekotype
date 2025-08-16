import type { 
  AnyTransformationRule, 
  TransformationEngine, 
  TransformationRuleFactory,
  SimpleReplaceRule,
  RegexRule,
  UpperCaseRule,
  LowerCaseRule
} from '../types/transformation';

export const ruleFactories: Record<string, TransformationRuleFactory> = {
  'simple-replace': {
    type: 'simple-replace',
    name: '文字列置換',
    description: '指定した文字列を別の文字列に置き換えます',
    createDefault: (): SimpleReplaceRule => ({
      id: crypto.randomUUID(),
      name: '文字列置換',
      type: 'simple-replace',
      enabled: true,
      order: 0,
      config: {
        search: '',
        replace: '',
        caseSensitive: true
      }
    }),
    transform: (text: string, rule: AnyTransformationRule) => {
      // Discriminated unionを使用して型を絞り込む
      if (rule.type !== 'simple-replace') return text;
      // この時点でTypeScriptはruleがSimpleReplaceRuleであることを知っている
      
      if (!rule.config.search) return text;
      
      if (rule.config.caseSensitive) {
        return text.replaceAll(rule.config.search, rule.config.replace);
      } else {
        return text.replaceAll(
          new RegExp(escapeRegExp(rule.config.search), 'gi'),
          rule.config.replace
        );
      }
    },
    validateConfig: (config: unknown) => {
      return typeof config === 'object' && 
             config !== null &&
             'search' in config && 
             'replace' in config && 
             'caseSensitive' in config;
    }
  },

  'regex': {
    type: 'regex',
    name: '正規表現',
    description: '正規表現を使用して高度な文字列変換を行います',
    createDefault: (): RegexRule => ({
      id: crypto.randomUUID(),
      name: '正規表現',
      type: 'regex',
      enabled: true,
      order: 0,
      config: {
        pattern: '',
        replacement: '',
        flags: 'g'
      }
    }),
    transform: (text: string, rule: AnyTransformationRule) => {
      // Discriminated unionを使用して型を絞り込む
      if (rule.type !== 'regex') return text;
      // この時点でTypeScriptはruleがRegexRuleであることを知っている
      
      if (!rule.config.pattern) return text;
      
      try {
        const regex = new RegExp(rule.config.pattern, rule.config.flags);
        return text.replace(regex, rule.config.replacement);
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        return text;
      }
    },
    validateConfig: () => {
      // バリデーションロジックはtransform内で実行
      return true;
    }
  },

  'uppercase': {
    type: 'uppercase',
    name: '大文字変換',
    description: 'すべての文字を大文字に変換します',
    createDefault: (): UpperCaseRule => ({
      id: crypto.randomUUID(),
      name: '大文字変換',
      type: 'uppercase',
      enabled: true,
      order: 0,
      config: {}
    }),
    transform: (text: string) => text.toUpperCase(),
    validateConfig: (config: unknown) => {
      return typeof config === 'object' && 
             config !== null && 
             Object.keys(config).length === 0;
    }
  },

  'lowercase': {
    type: 'lowercase',
    name: '小文字変換',
    description: 'すべての文字を小文字に変換します',
    createDefault: (): LowerCaseRule => ({
      id: crypto.randomUUID(),
      name: '小文字変換',
      type: 'lowercase',
      enabled: true,
      order: 0,
      config: {}
    }),
    transform: (text: string) => text.toLowerCase(),
    validateConfig: (config: unknown) => {
      return typeof config === 'object' && 
             config !== null && 
             Object.keys(config).length === 0;
    }
  }
};

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createTransformationEngine(): TransformationEngine {
  let rules: AnyTransformationRule[] = [];

  return {
    get rules() {
      return [...rules].sort((a, b) => a.order - b.order);
    },

    transform(input: string): string {
      return this.rules
        .filter(rule => rule.enabled)
        .reduce((text, rule) => {
          const factory = ruleFactories[rule.type];
          if (!factory) {
            console.warn(`Unknown rule type: ${rule.type}`);
            return text;
          }
          
          try {
            return factory.transform(text, rule);
          } catch (error) {
            console.error(`Error applying rule ${rule.name}:`, error);
            return text;
          }
        }, input);
    },

    addRule(rule: AnyTransformationRule): void {
      rule.order = rules.length;
      rules.push(rule);
    },

    removeRule(id: string): void {
      rules = rules.filter(rule => rule.id !== id);
      this.reorderRules(rules);
    },

    updateRule(id: string, updatedRule: AnyTransformationRule): void {
      const index = rules.findIndex(rule => rule.id === id);
      if (index !== -1) {
        rules[index] = { ...updatedRule, id };
      }
    },

    reorderRules(newRules: AnyTransformationRule[]): void {
      rules = newRules.map((rule, index) => ({ ...rule, order: index }));
    }
  };
}
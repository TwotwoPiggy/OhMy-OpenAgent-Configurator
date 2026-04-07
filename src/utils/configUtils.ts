/**
 * 配置工具函数
 * Configuration utility functions
 */
import type { OMConfig, AgentConfig, CategoryConfig, OpencodeConfig } from '@/types';
import { AGENTS, CATEGORIES } from '@/data/constants';
import { parse } from 'jsonc-parser';

/**
 * 深度合并两个对象
 * Deep merge two objects
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        // 递归合并对象
        // Recursively merge objects
        result[key] = deepMerge(targetValue as any, sourceValue as any);
      } else {
        // 直接赋值（包括数组和基本类型）
        // Direct assignment (including arrays and primitive types)
        result[key] = sourceValue as any;
      }
    }
  }
  
  return result;
}

/**
 * 从本地配置和默认配置创建合并配置
 * Create merged config from local config and default config
 * @param localConfig 本地配置
 * @param defaultConfig 默认配置
 * @returns 合并后的配置
 */
export function mergeConfig(localConfig: Partial<OMConfig>, defaultConfig: OMConfig): OMConfig {
  // 深度合并配置
  // Deep merge configs
  const merged = deepMerge(defaultConfig, localConfig);
  
  // 确保必要的配置结构存在
  // Ensure necessary config structures exist
  if (!merged.agents) merged.agents = {};
  if (!merged.categories) merged.categories = {};
  if (!merged.background_task) merged.background_task = defaultConfig.background_task;
  if (!merged.experimental) merged.experimental = {};
  if (!merged.tmux) merged.tmux = defaultConfig.tmux;
  if (!merged.disabled_agents) merged.disabled_agents = [];
  if (!merged.disabled_categories) merged.disabled_categories = [];
  if (!merged.disabled_skills) merged.disabled_skills = [];
  if (!merged.disabled_hooks) merged.disabled_hooks = [];
  if (!merged.disabled_mcps) merged.disabled_mcps = [];
  
  return merged;
}

/**
 * 解析 JSONC 配置文件
 * Parse JSONC config file
 * @param content 配置文件内容
 * @returns 解析后的配置对象
 */
export function parseConfig(content: string): Partial<OMConfig> {
  try {
    return parse(content) as Partial<OMConfig>;
  } catch (error) {
    console.error('配置文件解析失败:', error);
    return {};
  }
}

/**
 * 获取 Agent 的用户配置（仅用户配置的部分）
 * Get user config for Agent (only user-configured part)
 * @param agentId Agent ID
 * @param userConfig 用户配置
 * @returns 用户配置的 Agent 配置
 */
export function getAgentUserConfig(agentId: string, userConfig: OMConfig): Partial<AgentConfig> {
  return userConfig.agents?.[agentId] || {};
}

/**
 * 获取 Agent 的有效配置（合并用户配置和默认值）
 * Get effective config for Agent (merge user config and defaults)
 * @param agentId Agent ID
 * @param userConfig 用户配置
 * @returns 合并后的 Agent 配置
 */
export function getAgentEffectiveConfig(agentId: string, userConfig: OMConfig): AgentConfig {
  const userAgentConfig = getAgentUserConfig(agentId, userConfig);
  const agentMeta = AGENTS.find(a => a.id === agentId);
  
  const defaultConfig: AgentConfig = {
    model: agentMeta?.recommendedModel,
  };
  
  return userAgentConfig ? { ...defaultConfig, ...userAgentConfig } : defaultConfig;
}

/**
 * 获取 Category 的用户配置（仅用户配置的部分）
 * Get user config for Category (only user-configured part)
 * @param categoryId Category ID
 * @param userConfig 用户配置
 * @returns 用户配置的 Category 配置
 */
export function getCategoryUserConfig(categoryId: string, userConfig: OMConfig): Partial<CategoryConfig> {
  return userConfig.categories?.[categoryId] || {};
}

/**
 * 获取 Category 的有效配置（合并用户配置和默认值）
 * Get effective config for Category (merge user config and defaults)
 * @param categoryId Category ID
 * @param userConfig 用户配置
 * @returns 合并后的 Category 配置
 */
export function getCategoryEffectiveConfig(categoryId: string, userConfig: OMConfig): CategoryConfig {
  const userCategoryConfig = getCategoryUserConfig(categoryId, userConfig);
  const categoryMeta = CATEGORIES.find(c => c.id === categoryId);
  
  const defaultConfig: CategoryConfig = {
    model: categoryMeta?.defaultModel,
    variant: categoryMeta?.defaultVariant,
  };
  
  return userCategoryConfig ? { ...defaultConfig, ...userCategoryConfig } : defaultConfig;
}

/**
 * 验证配置结构
 * Validate config structure
 * @param config 配置对象
 * @returns 验证结果
 */
export function validateConfig(config: Partial<OMConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 基本结构验证
  // Basic structure validation
  if (!config) {
    errors.push('配置对象为空');
  }
  
  // 验证 agents 结构
  // Validate agents structure
  if (config.agents && typeof config.agents !== 'object') {
    errors.push('agents 必须是对象');
  }
  
  // 验证 categories 结构
  // Validate categories structure
  if (config.categories && typeof config.categories !== 'object') {
    errors.push('categories 必须是对象');
  }
  
  // 验证禁用列表
  // Validate disabled lists
  const disabledLists = ['disabled_agents', 'disabled_categories', 'disabled_skills', 'disabled_hooks', 'disabled_mcps'];
  disabledLists.forEach(listName => {
    if (config[listName as keyof OMConfig] && !Array.isArray(config[listName as keyof OMConfig])) {
      errors.push(`${listName} 必须是数组`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 生成默认配置
 * Generate default config
 * @returns 默认配置对象
 */
export function generateDefaultConfig(): OMConfig {
  return {
    $schema: 'https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json',
    agents: {},
    categories: {},
    background_task: {
      providerConcurrency: {
        anthropic: 3,
        openai: 3,
        opencode: 10,
      },
      modelConcurrency: {},
    },
    experimental: {},
    tmux: { enabled: false },
    disabled_agents: [],
    disabled_categories: [],
    disabled_skills: [],
    disabled_hooks: [],
    disabled_mcps: [],
  };
}

/**
 * 解析 opencode.json 内容
 * Parse opencode.json content
 * @param content opencode.json 文件内容
 * @returns 解析后的配置对象
 */
export function parseOpencodeConfig(content: string): OpencodeConfig {
  try {
    return parse(content) as OpencodeConfig;
  } catch (error) {
    console.error('opencode.json 解析失败:', error);
    return {};
  }
}

/**
 * 从 opencode 配置中获取特定 provider 的模型配置
 * Get model config for specific provider from opencode config
 * @param providerId Provider ID
 * @param opencodeConfig 解析后的 opencode 配置
 * @returns 模型配置对象
 */
export function getProviderModels(providerId: string, opencodeConfig: OpencodeConfig): Record<string, { name: string }> {
  return opencodeConfig.provider?.[providerId]?.models || {};
}

/**
 * 合并默认 provider 配置和 opencode.json 中的配置
 * Merge default provider config with opencode.json config
 * @param defaultProviders 默认 provider 配置
 * @param opencodeConfig 解析后的 opencode 配置
 * @returns 合并后的 provider 配置
 */
export function mergeProviderConfig(defaultProviders: any[], opencodeConfig: OpencodeConfig): any[] {
  return defaultProviders.map(provider => {
    const opencodeProvider = opencodeConfig.provider?.[provider.id];
    if (!opencodeProvider || !opencodeProvider.models) {
      return provider;
    }
    
    // 合并模型列表
    // Merge model lists
    const defaultModels = provider.models || [];
    const opencodeModels = Object.keys(opencodeProvider.models);
    
    // 去重合并
    // Deduplicate and merge
    const mergedModels = [...new Set([...defaultModels, ...opencodeModels])];
    
    return {
      ...provider,
      models: mergedModels,
      opencodeModels: opencodeModels,
    };
  });
}

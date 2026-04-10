/**
 * 应用状态管理
 * Application state management
 */
import { create } from 'zustand';
import i18n from '@/i18n';
import type {
  OMConfig,
  AgentConfig,
  CategoryConfig,
  BackgroundTaskConfig,
  ExperimentalConfig,
  TmuxConfig,
  SkillExtension,
  McpExtension,
  PluginExtension,
  OpencodeConfig,
} from '@/types';
import { mergeConfig, generateDefaultConfig } from '@/utils/configUtils';

/**
 * 应用状态接口
 * Application state interface
 */
interface AppState {
  // 配置相关状态
  // Config related state
  config: OMConfig;              // 主配置对象
  configPath: string | null;     // 配置文件路径
  configLoaded: boolean;         // 配置是否已加载
  opencodeConfig: { found: boolean; path: string; content?: string }; // opencode.json 配置
  parsedOpencodeConfig: OpencodeConfig; // 解析后的 opencode 配置
  
  // 环境状态
  // Environment state
  opencodeInstalled: boolean;    // opencode 是否安装
  opencodeVersion: string | null; // opencode 版本
  opencodeSupported: boolean;    // opencode 是否支持
  ohMyOpenAgentInstalled: boolean; // oh-my-openagent 是否安装
  ohMyOpenAgentVersion: string | null; // oh-my-openagent 版本
  runtimeInfo: Record<string, { installed: boolean; version?: string }>; // 运行时信息
  platformInfo: {
    platform: string;
    arch: string;
    osVersion: string;
    homeDir: string;
    configDir: string;
  } | null; // 平台信息
  
  // UI 状态
  // UI state
  currentStep: number;           // 当前步骤（用于向导）
  sidebarCollapsed: boolean;     // 侧边栏是否折叠
  activeTab: string;             // 当前激活的标签页
  isDarkMode: boolean;           // 是否为深色模式
  currentLanguage: string;       // 当前语言
  
  // 操作状态
  // Operation state
  isInstalling: boolean;         // 是否正在安装
  installLog: string;            // 安装日志
  isDoctorRunning: boolean;      // 是否正在运行诊断
  doctorLog: string;             // 诊断日志
  
  // 扩展管理
  // Extension management
  installedSkills: SkillExtension[]; // 已安装的技能
  installedMcps: McpExtension[];    // 已安装的 MCP 扩展
  installedPlugins: PluginExtension[]; // 已安装的插件
  
  // Actions
  setConfig: (config: OMConfig) => void;
  updateConfig: (partial: Partial<OMConfig>) => void;
  setConfigPath: (path: string | null) => void;
  setConfigLoaded: (loaded: boolean) => void;
  setOpencodeConfig: (config: { found: boolean; path: string; content?: string }) => void;
  setParsedOpencodeConfig: (config: OpencodeConfig) => void;
  
  // 配置管理
  // Config management
  mergeConfig: (partialConfig: Partial<OMConfig>) => void;
  resetConfig: () => void;
  ensureConfigConsistency: () => void;
  
  setOpencodeInstalled: (installed: boolean) => void;
  setOpencodeVersion: (version: string | null) => void;
  setOpencodeSupported: (supported: boolean) => void;
  setOhMyOpenAgentInstalled: (installed: boolean) => void;
  setOhMyOpenAgentVersion: (version: string | null) => void;
  setRuntimeInfo: (info: Record<string, { installed: boolean; version?: string }>) => void;
  setPlatformInfo: (info: AppState['platformInfo']) => void;
  
  setCurrentStep: (step: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
  toggleLanguage: () => void;
  
  setInstalling: (installing: boolean) => void;
  appendInstallLog: (log: string) => void;
  clearInstallLog: () => void;
  setDoctorRunning: (running: boolean) => void;
  appendDoctorLog: (log: string) => void;
  clearDoctorLog: () => void;
  
  // Agent 配置
  // Agent configuration
  updateAgent: (agentId: string, config: Partial<AgentConfig>) => void;
  removeAgent: (agentId: string) => void;
  
  // Category 配置
  // Category configuration
  updateCategory: (categoryId: string, config: Partial<CategoryConfig>) => void;
  removeCategory: (categoryId: string) => void;
  
  // 其他配置
  // Other configurations
  updateBackgroundTask: (config: Partial<BackgroundTaskConfig>) => void;
  updateExperimental: (config: Partial<ExperimentalConfig>) => void;
  updateTmux: (config: Partial<TmuxConfig>) => void;
  
  // 扩展管理
  // Extension management
  addSkill: (skill: SkillExtension) => void;
  removeSkill: (skillId: string) => void;
  toggleSkill: (skillId: string) => void;
  addMcp: (mcp: McpExtension) => void;
  removeMcp: (mcpId: string) => void;
  toggleMcp: (mcpId: string) => void;

  // 插件管理
  // Plugin management
  addPlugin: (plugin: PluginExtension) => void;
  removePlugin: (pluginId: string) => void;
  togglePlugin: (pluginId: string) => void;
  setInstalledPlugins: (plugins: PluginExtension[]) => void;
  
  // 禁用列表管理
  // Disabled list management
  toggleDisabledAgent: (agentId: string) => void;
  toggleDisabledCategory: (categoryId: string) => void;
  toggleDisabledHook: (hookId: string) => void;
  toggleDisabledMcp: (mcpId: string) => void;
  toggleDisabledSkill: (skillId: string) => void;
}

/**
 * 默认配置
 * Default configuration
 */
const DEFAULT_CONFIG: OMConfig = {
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

/**
 * 应用状态存储
 * Application state store
 */
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  // Initial state
  config: { ...DEFAULT_CONFIG },
  configPath: null,
  configLoaded: false,
  opencodeConfig: { found: false, path: '' },
  parsedOpencodeConfig: {},
  
  opencodeInstalled: false,
  opencodeVersion: null,
  opencodeSupported: false,
  ohMyOpenAgentInstalled: false,
  ohMyOpenAgentVersion: null,
  runtimeInfo: {},
  platformInfo: null,
  
  currentStep: 0,
  sidebarCollapsed: false,
  activeTab: 'overview',
  isDarkMode: true,
  currentLanguage: 'zh',
  
  isInstalling: false,
  installLog: '',
  isDoctorRunning: false,
  doctorLog: '',
  
  installedSkills: [],
  installedMcps: [],
  installedPlugins: [],
  
  // Actions
  setConfig: (config) => set({ config }),
  updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
  setConfigPath: (path) => set({ configPath: path }),
  setConfigLoaded: (loaded) => set({ configLoaded: loaded }),
  setOpencodeConfig: (config) => set({ opencodeConfig: config }),
  setParsedOpencodeConfig: (config) => set({ parsedOpencodeConfig: config }),
  
  // 配置管理
  // Config management
  mergeConfig: (partialConfig) => set((state) => {
    const defaultConfig = generateDefaultConfig();
    const merged = mergeConfig(partialConfig, defaultConfig);
    return { config: merged };
  }),
  resetConfig: () => set({ config: generateDefaultConfig() }),
  ensureConfigConsistency: () => set((state) => {
    const defaultConfig = generateDefaultConfig();
    const merged = mergeConfig(state.config, defaultConfig);
    return { config: merged };
  }),
  
  setOpencodeInstalled: (installed) => set({ opencodeInstalled: installed }),
  setOpencodeVersion: (version) => set({ opencodeVersion: version }),
  setOpencodeSupported: (supported) => set({ opencodeSupported: supported }),
  setOhMyOpenAgentInstalled: (installed) => set({ ohMyOpenAgentInstalled: installed }),
  setOhMyOpenAgentVersion: (version) => set({ ohMyOpenAgentVersion: version }),
  setRuntimeInfo: (info) => set({ runtimeInfo: info }),
  setPlatformInfo: (info) => set({ platformInfo: info }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLanguage: (language) => {
    set({ currentLanguage: language });
    i18n.changeLanguage(language);
  },
  toggleLanguage: () => set((state) => {
    const newLanguage = state.currentLanguage === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLanguage);
    return { currentLanguage: newLanguage };
  }),
  
  setInstalling: (installing) => set({ isInstalling: installing }),
  appendInstallLog: (log) => set((state) => ({ installLog: state.installLog + log })),
  clearInstallLog: () => set({ installLog: '' }),
  setDoctorRunning: (running) => set({ isDoctorRunning: running }),
  appendDoctorLog: (log) => set((state) => ({ doctorLog: state.doctorLog + log })),
  clearDoctorLog: () => set({ doctorLog: '' }),
  
  // Agent 配置
  // Agent configuration
  updateAgent: (agentId, config) =>
    set((state) => ({
      config: {
        ...state.config,
        agents: {
          ...state.config.agents,
          [agentId]: { ...state.config.agents?.[agentId], ...config },
        },
      },
    })),
  removeAgent: (agentId) =>
    set((state) => {
      const agents = { ...state.config.agents };
      delete agents[agentId];
      return { config: { ...state.config, agents } };
    }),
  
  // Category 配置
  // Category configuration
  updateCategory: (categoryId, config) =>
    set((state) => ({
      config: {
        ...state.config,
        categories: {
          ...state.config.categories,
          [categoryId]: { ...state.config.categories?.[categoryId], ...config },
        },
      },
    })),
  removeCategory: (categoryId) =>
    set((state) => {
      const categories = { ...state.config.categories };
      delete categories[categoryId];
      return { config: { ...state.config, categories } };
    }),
  
  // 其他配置
  // Other configurations
  updateBackgroundTask: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        background_task: { ...state.config.background_task, ...config },
      },
    })),
  updateExperimental: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        experimental: { ...state.config.experimental, ...config },
      },
    })),
  updateTmux: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        tmux: { ...state.config.tmux, ...config },
      },
    })),
  
  // 扩展管理
  // Extension management
  addSkill: (skill) =>
    set((state) => ({
      installedSkills: [...state.installedSkills, skill],
    })),
  removeSkill: (skillId) =>
    set((state) => ({
      installedSkills: state.installedSkills.filter((s) => s.id !== skillId),
    })),
  toggleSkill: (skillId) =>
    set((state) => ({
      installedSkills: state.installedSkills.map((s) =>
        s.id === skillId ? { ...s, enabled: !s.enabled } : s
      ),
    })),
  addMcp: (mcp) =>
    set((state) => ({
      installedMcps: [...state.installedMcps, mcp],
    })),
  removeMcp: (mcpId) =>
    set((state) => ({
      installedMcps: state.installedMcps.filter((m) => m.id !== mcpId),
    })),
  toggleMcp: (mcpId) =>
    set((state) => ({
      installedMcps: state.installedMcps.map((m) =>
        m.id === mcpId ? { ...m, enabled: !m.enabled } : m
      ),
    })),

  // 插件管理
  // Plugin management
  addPlugin: (plugin) =>
    set((state) => ({
      installedPlugins: [...state.installedPlugins, plugin],
    })),
  removePlugin: (pluginId) =>
    set((state) => ({
      installedPlugins: state.installedPlugins.filter((p) => p.id !== pluginId),
    })),
  togglePlugin: (pluginId) =>
    set((state) => ({
      installedPlugins: state.installedPlugins.map((p) =>
        p.id === pluginId ? { ...p, enabled: !p.enabled } : p
      ),
    })),
  setInstalledPlugins: (plugins) => set({ installedPlugins: plugins }),
  
  // 禁用列表管理
  // Disabled list management
  toggleDisabledAgent: (agentId) =>
    set((state) => {
      const list = state.config.disabled_agents || [];
      const updated = list.includes(agentId)
        ? list.filter((id) => id !== agentId)
        : [...list, agentId];
      return { config: { ...state.config, disabled_agents: updated } };
    }),
  toggleDisabledCategory: (categoryId) =>
    set((state) => {
      const list = state.config.disabled_categories || [];
      const updated = list.includes(categoryId)
        ? list.filter((id) => id !== categoryId)
        : [...list, categoryId];
      return { config: { ...state.config, disabled_categories: updated } };
    }),
  toggleDisabledHook: (hookId) =>
    set((state) => {
      const list = state.config.disabled_hooks || [];
      const updated = list.includes(hookId)
        ? list.filter((id) => id !== hookId)
        : [...list, hookId];
      return { config: { ...state.config, disabled_hooks: updated } };
    }),
  toggleDisabledMcp: (mcpId) =>
    set((state) => {
      const list = state.config.disabled_mcps || [];
      const updated = list.includes(mcpId)
        ? list.filter((id) => id !== mcpId)
        : [...list, mcpId];
      return { config: { ...state.config, disabled_mcps: updated } };
    }),
  toggleDisabledSkill: (skillId) =>
    set((state) => {
      const list = state.config.disabled_skills || [];
      const updated = list.includes(skillId)
        ? list.filter((id) => id !== skillId)
        : [...list, skillId];
      return { config: { ...state.config, disabled_skills: updated } };
    }),
}));

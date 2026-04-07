/**
 * 类型定义文件
 * Type definitions file
 */

// Electron API 类型声明
// Electron API type declarations
export interface ElectronAPI {
  /**
   * 检查 opencode 安装状态
   * Check opencode installation status
   */
  checkOpencode: () => Promise<{ installed: boolean; version: string | null; isSupported: boolean }>;
  
  /**
   * 检查运行时环境
   * Check runtime environment
   */
  checkRuntime: () => Promise<Record<string, { installed: boolean; version?: string }>>;
  
  /**
   * 获取平台信息
   * Get platform information
   */
  getPlatformInfo: () => Promise<{
    platform: string;
    arch: string;
    osVersion: string;
    homeDir: string;
    configDir: string;
  }>;
  
  /**
   * 读取配置文件
   * Read config file
   */
  readConfig: (configPath?: string) => Promise<ConfigReadResult>;
  
  /**
   * 写入配置文件
   * Write config file
   */
  writeConfig: (configPath: string, content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  
  /**
   * 读取 opencode.json 配置
   * Read opencode.json config
   */
  readOpencodeConfig: () => Promise<{ found: boolean; path: string; content?: string; error?: string }>;
  
  /**
   * 写入 opencode.json 配置
   * Write opencode.json config
   */
  writeOpencodeConfig: (content: string) => Promise<{ success: boolean; error?: string }>;
  
  /**
   * 获取配置目录
   * Get config directory
   */
  getConfigDir: () => Promise<string>;
  
  /**
   * 运行安装命令
   * Run install command
   */
  runInstall: (options: InstallOptions) => Promise<CommandResult>;
  
  /**
   * 运行诊断命令
   * Run doctor command
   */
  runDoctor: () => Promise<CommandResult>;
  
  /**
   * 列出可用模型
   * List available models
   */
  listModels: () => Promise<CommandResult>;
  
  /**
   * 选择目录
   * Select directory
   */
  selectDirectory: () => Promise<string | null>;
  
  /**
   * 选择文件
   * Select file
   */
  selectFile: (filters?: FileFilter[]) => Promise<string | null>;
  
  /**
   * 导出配置
   * Export config
   */
  exportConfig: (content: string, defaultName?: string) => Promise<{ success: boolean; path?: string; error?: string } | null>;
  
  /**
   * 导入配置
   * Import config
   */
  importConfig: () => Promise<{ success: boolean; content?: string; path?: string; error?: string } | null>;
  
  /**
   * 打开外部链接
   * Open external link
   */
  openExternal: (url: string) => Promise<void>;
  
  /**
   * 打开本地文件夹
   * Open local folder
   */
  openFolder: (path: string) => Promise<void>;
  
  /**
   * 检查 oh-my-openagent 安装状态
   * Check oh-my-openagent installation status
   */
  checkOhMyOpenAgent: () => Promise<{ installed: boolean; version: string | null }>;
}

/**
 * 配置读取结果
 * Config read result
 */
interface ConfigReadResult {
  found: boolean;
  path?: string;
  content?: string;
  filename?: string;
  configDir?: string;
  error?: string;
}

/**
 * 安装选项
 * Install options
 */
export interface InstallOptions {
  claude: string;
  openai: string;
  gemini: string;
  copilot: string;
  opencodeZen?: string;
  opencodeGo?: string;
  zaiCodingPlan?: string;
}

/**
 * 命令执行结果
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

/**
 * 文件过滤器
 * File filter
 */
export interface FileFilter {
  name: string;
  extensions: string[];
}

// 全局窗口类型扩展
// Global window type extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// ===== Oh My OpenAgent 配置类型 =====
// Oh My OpenAgent configuration types

/**
 * 主配置接口
 * Main configuration interface
 */
export interface OMConfig {
  $schema?: string;
  agents?: Record<string, AgentConfig>;
  categories?: Record<string, CategoryConfig>;
  background_task?: BackgroundTaskConfig;
  skills?: Record<string, SkillConfig>;
  hooks?: Record<string, HookConfig>;
  experimental?: ExperimentalConfig;
  tmux?: TmuxConfig;
  'git-master'?: GitMasterConfig;
  'comment-checker'?: CommentCheckerConfig;
  notification?: NotificationConfig;
  mcps?: Record<string, McpConfig>;
  lsp?: LspConfig[];
  disabled_agents?: string[];
  disabled_categories?: string[];
  disabled_skills?: string[];
  disabled_hooks?: string[];
  disabled_mcps?: string[];
  disabled_commands?: string[];
  disabled_tools?: string[];
}

/**
 * Agent 配置
 * Agent configuration
 */
export interface AgentConfig {
  model?: string;
  fallback_models?: string | (string | FallbackModelConfig)[];
  temperature?: number;
  top_p?: number;
  prompt?: string;
  prompt_append?: string;
  tools?: string[];
  disable?: boolean;
  mode?: string;
  color?: string;
  permission?: PermissionConfig;
  category?: string;
  variant?: ModelVariant;
  maxTokens?: number;
  thinking?: ThinkingConfig;
  reasoningEffort?: ReasoningEffort;
  textVerbosity?: TextVerbosity;
  providerOptions?: Record<string, unknown>;
  ultrawork?: {
    model?: string;
    variant?: ModelVariant;
  };
}

/**
 * 回退模型配置
 * Fallback model configuration
 */
export interface FallbackModelConfig {
  model: string;
  variant?: ModelVariant;
  reasoningEffort?: ReasoningEffort;
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  thinking?: ThinkingConfig;
}

/**
 * 权限配置
 * Permission configuration
 */
export interface PermissionConfig {
  edit?: PermissionLevel;
  bash?: PermissionLevel | Record<string, PermissionLevel>;
  webfetch?: PermissionLevel;
  doom_loop?: PermissionLevel;
  external_directory?: PermissionLevel;
}

/**
 * 权限级别
 * Permission level
 */
export type PermissionLevel = 'ask' | 'allow' | 'deny';

/**
 * 模型变体
 * Model variant
 */
export type ModelVariant = 'max' | 'high' | 'medium' | 'low' | 'xhigh';

/**
 * 推理努力程度
 * Reasoning effort level
 */
export type ReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

/**
 * 文本详细程度
 * Text verbosity level
 */
export type TextVerbosity = 'low' | 'medium' | 'high';

/**
 * 思考配置
 * Thinking configuration
 */
export interface ThinkingConfig {
  type: 'enabled' | 'disabled';
  budgetTokens?: number;
}

/**
 * 分类配置
 * Category configuration
 */
export interface CategoryConfig {
  model?: string;
  fallback_models?: string | (string | FallbackModelConfig)[];
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  thinking?: ThinkingConfig;
  reasoningEffort?: ReasoningEffort;
  textVerbosity?: TextVerbosity;
  tools?: string[];
  prompt_append?: string;
  variant?: ModelVariant;
  description?: string;
  is_unstable_agent?: boolean;
}

/**
 * 后台任务配置
 * Background task configuration
 */
export interface BackgroundTaskConfig {
  defaultConcurrency?: number;
  staleTimeoutMs?: number;
  providerConcurrency?: Record<string, number>;
  modelConcurrency?: Record<string, number>;
}

/**
 * 技能配置
 * Skill configuration
 */
export interface SkillConfig {
  description?: string;
  instructions?: string;
}

/**
 * 钩子配置
 * Hook configuration
 */
export interface HookConfig {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * 实验性功能配置
 * Experimental features configuration
 */
export interface ExperimentalConfig {
  aggressive_truncation?: boolean;
  auto_resume?: boolean;
  preemptive_compaction?: boolean;
  truncate_all_tool_outputs?: boolean;
  task_system?: boolean;
  dynamic_context_pruning?: boolean;
}

/**
 * Tmux 配置
 * Tmux configuration
 */
export interface TmuxConfig {
  enabled?: boolean;
  layout?: string;
  main_pane_size?: string;
}

/**
 * Git Master 配置
 * Git Master configuration
 */
export interface GitMasterConfig {
  commit_footer?: string;
  include_co_authored_by?: boolean;
}

/**
 * 评论检查器配置
 * Comment Checker configuration
 */
export interface CommentCheckerConfig {
  custom_prompt?: string;
}

/**
 * 通知配置
 * Notification configuration
 */
export interface NotificationConfig {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * MCP 配置
 * MCP configuration
 */
export interface McpConfig {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * LSP 配置
 * LSP configuration
 */
export interface LspConfig {
  command: string;
  extensions?: string[];
  priority?: number;
  env?: Record<string, string>;
  initialization?: Record<string, unknown>;
  disabled?: boolean;
}

// ===== Agent 元数据 =====
// Agent metadata

/**
 * Agent 元数据
 * Agent metadata
 */
export interface AgentMeta {
  id: string;
  name: string;
  description: string;
  recommendedModel: string;
  fallbackChain: string[];
  icon: string;
  color: string;
}

/**
 * 分类元数据
 * Category metadata
 */
export interface CategoryMeta {
  id: string;
  name: string;
  description: string;
  defaultModel: string;
  defaultVariant?: ModelVariant;
  icon: string;
}

/**
 * 提供商元数据
 * Provider metadata
 */
export interface ProviderMeta {
  id: string;
  name: string;
  description: string;
  authMethod: string;
  models: string[];
  icon: string;
  color: string;
}

// ===== opencode.json 配置类型 =====
// opencode.json configuration types

/**
 * 模型配置
 * Model configuration
 */
export interface ModelConfig {
  name: string;
}

/**
 * 提供商配置
 * Provider configuration
 */
export interface ProviderConfig {
  models: Record<string, ModelConfig>;
}

/**
 * Opencode 配置
 * Opencode configuration
 */
export interface OpencodeConfig {
  provider?: Record<string, ProviderConfig>;
  plugin?: string[];
  [key: string]: unknown;
}

// ===== Skills & MCP 扩展接口 =====
// Skills & MCP extension interfaces

/**
 * 技能扩展
 * Skill extension
 */
export interface SkillExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  source: 'local' | 'remote';
  sourceUrl?: string;
  localPath?: string;
  instructions: string;
  installed: boolean;
  enabled: boolean;
  tags: string[];
}

/**
 * MCP 扩展
 * MCP extension
 */
export interface McpExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  source: 'local' | 'remote';
  sourceUrl?: string;
  localPath?: string;
  config: Record<string, unknown>;
  installed: boolean;
  enabled: boolean;
  tags: string[];
}

/**
 * 扩展注册表
 * Extension registry
 */
export interface ExtensionRegistry {
  skills: SkillExtension[];
  mcps: McpExtension[];
}

/**
 * 扩展源
 * Extension source
 */
export interface ExtensionSource {
  type: 'github' | 'npm' | 'url' | 'local';
  url: string;
  name: string;
  description?: string;
}

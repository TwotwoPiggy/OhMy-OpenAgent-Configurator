/**
 * 常量定义文件
 * Constants definition file
 */
import type { AgentMeta, CategoryMeta, ProviderMeta } from '@/types';

/**
 * Agent 元数据列表
 * Agent metadata list
 */
export const AGENTS: AgentMeta[] = [
  {
    id: 'sisyphus',
    name: 'Sisyphus',
    description: '主编排器 - 规划并委派任务给其他 Agent',
    recommendedModel: 'anthropic/claude-opus-4-6',
    fallbackChain: ['kimi-for-coding/k2p5', 'openai/gpt-5.4', 'zai-coding-plan/glm-5'],
    icon: '🧠',
    color: '#6366f1',
  },
  {
    id: 'hephaestus',
    name: 'Hephaestus',
    description: '自主深度工作者 - 端到端执行复杂任务',
    recommendedModel: 'openai/gpt-5.4',
    fallbackChain: [],
    icon: '🔨',
    color: '#f59e0b',
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: '战略规划师 - 制定计划和策略',
    recommendedModel: 'anthropic/claude-opus-4-6',
    fallbackChain: ['openai/gpt-5.4', 'opencode-go/glm-5'],
    icon: '🔥',
    color: '#ef4444',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    description: '只读架构顾问 - 提供技术建议',
    recommendedModel: 'openai/gpt-5.4',
    fallbackChain: ['google/gemini-3.1-pro', 'anthropic/claude-opus-4-6'],
    icon: '🔮',
    color: '#8b5cf6',
  },
  {
    id: 'librarian',
    name: 'Librarian',
    description: '文档和代码搜索 - 快速检索信息',
    recommendedModel: 'opencode-go/minimax-m2.7',
    fallbackChain: ['claude-haiku-4-5', 'opencode/gpt-5-nano'],
    icon: '📚',
    color: '#10b981',
  },
  {
    id: 'explore',
    name: 'Explore',
    description: '快速代码库搜索 - 代码探索',
    recommendedModel: 'github-copilot/grok-code-fast-1',
    fallbackChain: ['claude-haiku-4-5', 'opencode/gpt-5-nano'],
    icon: '🔍',
    color: '#06b6d4',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: '计划执行协调器 - 管理任务执行',
    recommendedModel: 'anthropic/claude-sonnet-4-6',
    fallbackChain: ['opencode-go/kimi-k2.5', 'openai/gpt-5.4'],
    icon: '🗺️',
    color: '#3b82f6',
  },
  {
    id: 'metis',
    name: 'Metis',
    description: '计划差距分析 - 评估计划完整性',
    recommendedModel: 'anthropic/claude-opus-4-6',
    fallbackChain: ['openai/gpt-5.4', 'opencode-go/glm-5'],
    icon: '⚖️',
    color: '#ec4899',
  },
  {
    id: 'momus',
    name: 'Momus',
    description: '计划审查 - 批判性审查计划',
    recommendedModel: 'openai/gpt-5.4',
    fallbackChain: ['anthropic/claude-opus-4-6', 'google/gemini-3.1-pro'],
    icon: '🎭',
    color: '#f97316',
  },
  {
    id: 'multimodal-looker',
    name: 'Multimodal Looker',
    description: '视觉和截图分析 - 图像理解',
    recommendedModel: 'openai/gpt-5.4',
    fallbackChain: ['opencode-go/kimi-k2.5', 'zai-coding-plan/glm-4.6v'],
    icon: '👁️',
    color: '#14b8a6',
  },
];

/**
 * 分类元数据列表
 * Category metadata list
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'visual-engineering',
    name: 'Visual Engineering',
    description: '前端、UI/UX、设计、动画',
    defaultModel: 'google/gemini-3.1-pro',
    defaultVariant: 'high',
    icon: '🎨',
  },
  {
    id: 'ultrabrain',
    name: 'Ultrabrain',
    description: '深度逻辑推理、复杂架构',
    defaultModel: 'openai/gpt-5.4',
    defaultVariant: 'xhigh',
    icon: '🧬',
  },
  {
    id: 'deep',
    name: 'Deep',
    description: '自主问题解决、深入研究',
    defaultModel: 'openai/gpt-5.4',
    defaultVariant: 'medium',
    icon: '🔬',
  },
  {
    id: 'artistry',
    name: 'Artistry',
    description: '创意/非传统方法',
    defaultModel: 'google/gemini-3.1-pro',
    defaultVariant: 'high',
    icon: '🎭',
  },
  {
    id: 'quick',
    name: 'Quick',
    description: '琐碎任务、拼写修正、单文件变更',
    defaultModel: 'openai/gpt-5.4-mini',
    icon: '⚡',
  },
  {
    id: 'unspecified-low',
    name: 'Unspecified Low',
    description: '一般任务，低投入',
    defaultModel: 'anthropic/claude-sonnet-4-6',
    icon: '📝',
  },
  {
    id: 'unspecified-high',
    name: 'Unspecified High',
    description: '一般任务，高投入',
    defaultModel: 'anthropic/claude-opus-4-6',
    defaultVariant: 'max',
    icon: '🚀',
  },
  {
    id: 'writing',
    name: 'Writing',
    description: '文档、散文、技术写作',
    defaultModel: 'google/gemini-3-flash',
    icon: '✍️',
  },
];

/**
 * 提供商元数据列表
 * Provider metadata list
 */
export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude Opus 4.6, Sonnet 4.6, Haiku 4.5',
    authMethod: 'opencode auth login → Anthropic → Claude Pro/Max OAuth',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
    icon: '🤖',
    color: '#d97706',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-5.4, GPT-5.3-codex, GPT-5.4-mini, GPT-5-nano',
    authMethod: 'opencode auth login → OpenAI',
    models: ['gpt-5.4', 'gpt-5.3-codex', 'gpt-5.4-mini', 'gpt-5-nano'],
    icon: '💡',
    color: '#10a37f',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini 3.1 Pro, Gemini 3 Flash (需 Antigravity 插件)',
    authMethod: '安装 opencode-antigravity-auth 插件 + opencode auth login → Google',
    models: ['gemini-3.1-pro', 'gemini-3-flash', 'gemini-3-pro-preview'],
    icon: '💎',
    color: '#4285f4',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: '作为代理访问 Claude, GPT, Grok, Gemini 等模型',
    authMethod: 'opencode auth login → GitHub → OAuth',
    models: ['claude-opus-4-6', 'gpt-5.4', 'grok-code-fast-1', 'gemini-3-flash'],
    icon: '🐙',
    color: '#6e40c9',
  },
  {
    id: 'kimi-for-coding',
    name: 'Kimi for Coding',
    description: 'Kimi K2.5 - 出色的全能模型',
    authMethod: '通过 OpenCode 认证',
    models: ['kimi-k2p5', 'kimi-k2.5'],
    icon: '🌙',
    color: '#1a1a2e',
  },
  {
    id: 'opencode-zen',
    name: 'OpenCode Zen',
    description: '提供 opencode/ 前缀模型',
    authMethod: '通过 OpenCode 认证',
    models: ['claude-opus-4-6', 'gpt-5.4', 'gpt-5-nano', 'glm-5'],
    icon: '☯️',
    color: '#059669',
  },
  {
    id: 'opencode-go',
    name: 'OpenCode Go',
    description: '$10/月订阅，提供 GLM-5, Kimi K2.5, MiniMax',
    authMethod: '通过 OpenCode 认证（付费订阅）',
    models: ['kimi-k2.5', 'glm-5', 'minimax-m2.5', 'minimax-m2.7'],
    icon: '🏃',
    color: '#dc2626',
  },
  {
    id: 'zai-coding-plan',
    name: 'Z.ai Coding Plan',
    description: '主要提供 GLM-5/GLM-4.6v 回退',
    authMethod: '通过 OpenCode 认证',
    models: ['glm-5', 'glm-4.6v'],
    icon: '⚡',
    color: '#7c3aed',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    description: 'MiniMax M2.5, M2.7 模型',
    authMethod: '使用 api key',
    models: ['MiniMax-M2.5', 'MiniMax-M2.7'],
    icon: '🎯',
    color: '#8b5cf6',
  },
];

/**
 * 内置钩子列表
 * Built-in hooks list
 */
export const BUILT_IN_HOOKS = [
  'agent-usage-reminder',
  'anthropic-context-window-limit-recovery',
  'anthropic-effort',
  'atlas',
  'auto-slash-command',
  'auto-update-checker',
  'background-notification',
  'category-skill-reminder',
  'claude-code-hooks',
  'comment-checker',
  'compaction-context-injector',
  'compaction-todo-preserver',
  'delegate-task-retry',
  'directory-agents-injector',
  'directory-readme-injector',
  'edit-error-recovery',
  'interactive-bash-session',
  'keyword-detector',
  'non-interactive-env',
  'prometheus-md-only',
  'question-label-truncator',
  'ralph-loop',
  'rules-injector',
  'session-recovery',
  'sisyphus-junior-notepad',
  'start-work',
  'stop-continuation-guard',
  'subagent-question-blocker',
  'task-reminder',
  'task-resume-info',
  'tasks-todowrite-disabler',
  'think-mode',
  'thinking-block-validator',
  'unstable-agent-babysitter',
  'write-existing-file-guard',
];

/**
 * 内置技能列表
 * Built-in skills list
 */
export const BUILT_IN_SKILLS = ['playwright', 'agent-browser', 'git-master', 'frontend-ui-ux', 'github-pr-triage', 'github-issue-triage'];

/**
 * 内置 MCP 列表
 * Built-in MCPs list
 */
export const BUILT_IN_MCPS = ['websearch', 'context7', 'grep_app'];

/**
 * 模型变体选项
 * Model variant options
 */
export const MODEL_VARIANTS = ['max', 'xhigh', 'high', 'medium', 'low'] as const;

/**
 * 推理努力程度选项
 * Reasoning effort options
 */
export const REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'] as const;

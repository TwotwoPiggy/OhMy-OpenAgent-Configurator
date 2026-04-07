# Oh My OpenAgent Configurator 项目分析

## 1. 项目概述

**Oh My OpenAgent Configurator** 是一个桌面配置工具，用于快速方便地配置 [Oh My OpenAgent](https://ohmyopenagent.com/zh)。

### 核心功能
- 安装向导 - 交互式引导安装 Oh My OpenAgent
- Provider 配置 - 可视化配置 AI Provider 认证（Claude、OpenAI、Gemini、Copilot 等）
- Agent 配置 - 图形化配置 10 个内置 Agent 的模型、参数和行为
- 分类配置 - 配置任务分类的模型路由策略
- 并发控制 - 可视化管理 Provider/Model 级别的并发限制
- Hooks 管理 - 启用/禁用 36 个内置生命周期钩子
- Skills 管理 - 管理内置和自定义技能
- MCP 管理 - 管理 MCP 服务
- 高级设置 - 实验性功能、Tmux 集成、Git Master 等
- 配置编辑器 - 直接编辑 JSON 配置文件
- 导入/导出 - 配置文件的导入和导出
- 诊断工具 - 一键运行 `oh-my-opencode doctor`

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI 样式 | Tailwind CSS |
| 桌面框架 | Electron 33 |
| 构建工具 | Vite 6 |
| 状态管理 | Zustand 5 |
| 图标 | Lucide React |
| 动画 | Framer Motion |
| HTTP 请求 | Axios |
| 通知 | react-hot-toast |
| JSON 解析 | jsonc-parser |

---

## 3. 项目结构

```
oh-my-openagent-configurator/
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程入口，处理 IPC、文件操作、系统命令
│   └── preload.ts               # 预加载脚本，暴露安全 API 给渲染进程
├── src/
│   ├── types/
│   │   └── index.ts             # 全部 TypeScript 类型定义
│   ├── store/
│   │   └── useAppStore.ts       # Zustand 全局状态管理
│   ├── data/
│   │   └── constants.ts         # Agent/Category/Provider 元数据常量
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # 侧边栏导航
│   │   │   └── Header.tsx       # 顶部工具栏
│   │   └── pages/
│   │       ├── OverviewPage.tsx       # 概览仪表盘
│   │       ├── InstallWizard.tsx      # 安装向导
│   │       ├── ProviderPage.tsx       # Provider 配置
│   │       ├── AgentConfigPage.tsx    # Agent 配置
│   │       ├── CategoryConfigPage.tsx # 分类配置
│   │       ├── ConcurrencyPage.tsx    # 并发控制
│   │       ├── HooksPage.tsx          # Hooks 管理
│   │       ├── SkillsPage.tsx         # Skills 管理
│   │       ├── McpPage.tsx            # MCP 管理
│   │       ├── AdvancedPage.tsx       # 高级设置
│   │       └── EditorPage.tsx         # 配置编辑器
│   ├── App.tsx                  # 应用入口（路由配置）
│   ├── main.tsx                 # React 渲染入口
│   └── index.css                # 全局样式
├── vite.config.ts               # Vite 配置
└── tsconfig.json                # TypeScript 配置
```

---

## 4. 核心架构

### 4.1 Electron 主进程架构

**main.ts** 负责：
- 创建 BrowserWindow 窗口
- 处理 IPC 通信
- 文件系统操作（读取/写入配置文件）
- 执行外部命令（安装、诊断）
- 对话框操作（选择文件/目录）
- 平台信息获取

**preload.ts** 负责：
- 暴露安全的 API 给渲染进程
- 通过 contextBridge 隔离 Node.js 环境

### 4.2 状态管理架构

**useAppStore.ts** (Zustand) 管理：
- 配置状态：`config`, `configPath`, `configLoaded`
- 环境状态：`opencodeInstalled`, `opencodeVersion`, `runtimeInfo`, `platformInfo`
- UI 状态：`currentStep`, `sidebarCollapsed`, `activeTab`, `isDarkMode`
- 操作状态：`isInstalling`, `installLog`, `isDoctorRunning`, `doctorLog`
- 扩展管理：`installedSkills`, `installedMcps`
- 配置更新方法：`updateAgent`, `updateCategory`, `updateBackgroundTask`, `updateExperimental`, `updateTmux`
- 禁用列表管理：`toggleDisabledAgent`, `toggleDisabledCategory`, `toggleDisabledHook`, `toggleDisabledMcp`, `toggleDisabledSkill`

### 4.3 类型系统

**types/index.ts** 定义：

**核心配置类型：**
- `OMConfig` - 主配置对象
- `AgentConfig` - Agent 配置（模型、回退、参数、权限等）
- `CategoryConfig` - 分类配置
- `BackgroundTaskConfig` - 后台任务并发配置
- `HookConfig` / `SkillConfig` / `McpConfig` - 扩展配置

**元数据类型：**
- `AgentMeta` - Agent 元数据（id, name, description, recommendedModel, fallbackChain）
- `CategoryMeta` - 分类元数据
- `ProviderMeta` - Provider 元数据

**扩展接口类型：**
- `SkillExtension` - 技能扩展
- `McpExtension` - MCP 服务扩展
- `ExtensionRegistry` - 扩展注册表

### 4.4 数据常量

**constants.ts** 包含：
- `AGENTS` - 10 个内置 Agent 元数据
- `CATEGORIES` - 8 个任务分类元数据
- `PROVIDERS` - 8 个 AI Provider 元数据
- `BUILT_IN_HOOKS` - 36 个内置 Hook
- `BUILT_IN_SKILLS` - 6 个内置 Skill
- `BUILT_IN_MCPS` - 3 个内置 MCP

---

## 5. IPC 通信 API

### 5.1 环境检查
- `checkOpencode()` - 检查 OpenCode 是否安装及版本
- `checkRuntime()` - 检查 Bun/Npm/Node 是否安装
- `getPlatformInfo()` - 获取平台信息

### 5.2 配置管理
- `readConfig(configPath?)` - 读取配置文件
- `writeConfig(configPath, content)` - 写入配置文件
- `readOpencodeConfig()` - 读取 opencode.json
- `writeOpencodeConfig(content)` - 写入 opencode.json
- `getConfigDir()` - 获取配置目录路径

### 5.3 安装与诊断
- `runInstall(options)` - 运行安装命令
- `runDoctor()` - 运行诊断
- `listModels()` - 列出可用模型

### 5.4 文件操作
- `selectDirectory()` - 选择目录
- `selectFile(filters?)` - 选择文件
- `exportConfig(content, defaultName)` - 导出配置
- `importConfig()` - 导入配置

### 5.5 外部操作
- `openExternal(url)` - 在外部浏览器打开链接

---

## 6. 页面组件分析

| 页面 | 用途 | 关键功能 |
|------|------|----------|
| OverviewPage | 概览仪表盘 | 环境检查、状态显示 |
| InstallWizard | 安装向导 | 交互式安装流程 |
| ProviderPage | Provider 配置 | OAuth 认证配置 |
| AgentConfigPage | Agent 配置 | 10 个 Agent 的模型和参数配置 |
| CategoryConfigPage | 分类配置 | 任务分类路由策略 |
| ConcurrencyPage | 并发控制 | Provider/Model 并发限制 |
| HooksPage | Hooks 管理 | 启用/禁用 36 个内置 Hook |
| SkillsPage | Skills 管理 | 技能扩展管理 |
| McpPage | MCP 管理 | MCP 服务管理 |
| AdvancedPage | 高级设置 | 实验性功能、Tmux、Git Master |
| EditorPage | 配置编辑器 | 直接编辑 JSON |

---

## 7. 配置目标

配置文件路径：
- Windows: `%APPDATA%/opencode/oh-my-openagent.jsonc`
- macOS/Linux: `~/.config/opencode/oh-my-openagent.jsonc`

---

## 8. 开发规范（来自用户规则）

### 8.1 内存优化
- 避免不必要的对象创建
- 及时释放不再需要的资源
- 注意内存泄漏问题

### 8.2 计算优化
- 避免重复计算
- 使用适当的数据结构和算法
- 延迟计算直到必要时

### 8.3 并行优化
- 识别可并行化的任务
- 避免不必要的同步
- 注意线程安全问题

### 8.4 代码可读性
- 使用有意义的、描述性的名称
- 遵循项目或语言的命名规范
- 避免缩写和单字母变量
- 相关代码放在一起
- 函数只做一件事

### 8.5 交互规范
- 为关键逻辑和可能造成理解困难的部分添加简明的中文注释
- 当生成的代码超过 20 行时，优先考虑是否可以进行适当的抽象或聚合
- 修改某个类之后必须查看并列出所有受影响的类以及对应的行号
- 每个类创建或修改时必须写 unit test 进行单元测试

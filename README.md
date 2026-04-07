# Oh My OpenAgent Configurator

[中文版本](#oh-my-openagent-配置器)

A desktop application for quickly and easily configuring [Oh My OpenAgent](https://ohmyopenagent.com/en).

## ✨ Features

- **Installation Wizard** - Interactive guided installation of Oh My OpenAgent
- **Provider Configuration** - Visual configuration of AI Provider authentication (Claude, OpenAI, Gemini, Copilot, etc.)
- **Agent Configuration** - Graphical configuration of models, parameters and behaviors for 10 built-in Agents
- **Category Configuration** - Configure model routing strategies for task classification
- **Concurrency Control** - Visual management of Provider/Model level concurrency limits
- **Hooks Management** - Enable/disable 36 built-in lifecycle hooks
- **Skills Management** - Manage built-in and custom skills (reserved extension interface)
- **MCP Management** - Manage MCP services (reserved extension interface)
- **Advanced Settings** - Experimental features, Tmux integration, Git Master, etc.
- **Configuration Editor** - Directly edit JSON configuration files
- **Import/Export** - Import and export of configuration files
- **Diagnostic Tool** - One-click running of `oh-my-opencode doctor`
- **Multi-language Support** - Built-in Chinese and English interface switching

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 + TypeScript 5.7.0 + Tailwind CSS 3.4.15
- **Desktop Framework**: Electron 33.0.0
- **Build Tool**: Vite 6.0.0
- **State Management**: Zustand 5.0.0
- **Icons**: Lucide React 0.460.0
- **Internationalization**: i18next 26.0.3 + react-i18next 17.0.2
- **HTTP Client**: Axios 1.7.0
- **Animation**: Framer Motion 11.11.0
- **JSON Parsing**: jsonc-parser 3.3.1
- **Version Management**: semver 7.6.0

## 📦 Installation

### Prerequisites

- Node.js >= 18
- npm >= 9

### Development Installation

```bash
# Clone the project
git clone https://github.com/TwotwoPiggy/OhMy-OpenAgent-Configurator.git
cd oh-my-openagent-configurator

# Install dependencies
npm install

# If Electron download fails, use mirror
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install electron --save-dev

# Start development server
npm run dev

# Start Electron development mode
npm run electron:dev
```

### Build Release Version

```bash
npm run electron:build
```

## 🚀 Usage

1. **Check Environment** - After opening the application, the overview page will automatically check if OpenCode, Bun, and Node.js are installed
2. **Install Oh My OpenAgent** - Enter the "Installation Wizard", select your Provider subscription, and install with one click
3. **Configure Provider** - Enter "Provider Configuration" and follow the instructions to complete OAuth authentication for each Provider
4. **Adjust Agent** - Enter "Agent Configuration" and adjust the model and parameters for each Agent as needed
5. **Save Configuration** - Click the save button in the top toolbar, and the configuration will be written to `~/.config/opencode/oh-my-openagent.jsonc`

## 📁 Project Structure

```
oh-my-openagent-configurator/
├── electron/                    # Electron main process
│   ├── main.ts                  # Main process entry
│   └── preload.ts               # Preload script (IPC bridge)
├── src/
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # Configuration types, extension interface types
│   ├── store/                   # State management
│   │   └── useAppStore.ts       # Zustand global state
│   ├── data/                    # Static data
│   │   └── constants.ts         # Agent/Category/Provider metadata
│   ├── i18n/                    # Internationalization
│   │   ├── locales/             # Language packs
│   │   │   ├── en.ts            # English
│   │   │   └── zh.ts            # Chinese
│   │   └── index.ts             # Internationalization configuration
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   │   ├── Sidebar.tsx      # Sidebar navigation
│   │   │   └── Header.tsx       # Top toolbar
│   │   └── pages/               # Page components
│   │       ├── OverviewPage.tsx       # Overview dashboard
│   │       ├── InstallWizard.tsx      # Installation wizard
│   │       ├── ProviderPage.tsx       # Provider configuration
│   │       ├── AgentConfigPage.tsx    # Agent configuration
│   │       ├── CategoryConfigPage.tsx # Category configuration
│   │       ├── ConcurrencyPage.tsx    # Concurrency control
│   │       ├── HooksPage.tsx          # Hooks management
│   │       ├── SkillsPage.tsx         # Skills management
│   │       ├── McpPage.tsx            # MCP management
│   │       ├── AdvancedPage.tsx       # Advanced settings
│   │       └── EditorPage.tsx         # Configuration editor
│   ├── App.tsx                  # Application entry
│   ├── main.tsx                 # React rendering entry
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project configuration
```

## 🔌 Skills & MCP Extension Interface

The application has reserved extension interfaces for Skills and MCP management:

### Current Support
- Manually add local/remote custom Skills
- Manually add local/remote custom MCP services
- Enable/disable built-in Skills and MCP
- Import/export configuration

### Future Planning
- One-click installation of Skills/MCP from GitHub repositories
- Install Skills/MCP from npm packages
- Skills/MCP marketplace browsing and search
- Version management and automatic updates
- Configuration template library

## 📄 License

MIT License

## 🙏 Acknowledgements

- [Oh My OpenAgent](https://github.com/code-yeongyu/oh-my-openagent) - Core project
- [OpenCode](https://opencode.ai) - Basic runtime environment

---

# Oh My OpenAgent 配置器

[English Version](#oh-my-openagent-configurator)

一个用于快速方便地配置 [Oh My OpenAgent](https://ohmyopenagent.com/zh) 的桌面应用程序。

## ✨ 功能特性

- **安装向导** - 交互式引导安装 Oh My OpenAgent
- **Provider 配置** - 可视化配置 AI Provider 认证（Claude、OpenAI、Gemini、Copilot 等）
- **Agent 配置** - 图形化配置 10 个内置 Agent 的模型、参数和行为
- **分类配置** - 配置任务分类的模型路由策略
- **并发控制** - 可视化管理 Provider/Model 级别的并发限制
- **Hooks 管理** - 启用/禁用 36 个内置生命周期钩子
- **Skills 管理** - 管理内置和自定义技能（预留扩展接口）
- **MCP 管理** - 管理 MCP 服务（预留扩展接口）
- **高级设置** - 实验性功能、Tmux 集成、Git Master 等
- **配置编辑器** - 直接编辑 JSON 配置文件
- **导入/导出** - 配置文件的导入和导出
- **诊断工具** - 一键运行 `oh-my-opencode doctor`
- **多语言支持** - 内置中英文界面切换

## 🛠️ 技术栈

- **前端**: React 18.3.1 + TypeScript 5.7.0 + Tailwind CSS 3.4.15
- **桌面框架**: Electron 33.0.0
- **构建工具**: Vite 6.0.0
- **状态管理**: Zustand 5.0.0
- **图标**: Lucide React 0.460.0
- **国际化**: i18next 26.0.3 + react-i18next 17.0.2
- **HTTP 客户端**: Axios 1.7.0
- **动画**: Framer Motion 11.11.0
- **JSON 解析**: jsonc-parser 3.3.1
- **版本管理**: semver 7.6.0

## 📦 安装

### 前置要求

- Node.js >= 18
- npm >= 9

### 开发安装

```bash
# 克隆项目
git clone https://github.com/TwotwoPiggy/OhMy-OpenAgent-Configurator.git
cd oh-my-openagent-configurator

# 安装依赖
npm install

# 如果 Electron 下载失败，使用镜像
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install electron --save-dev

# 启动开发服务器
npm run dev

# 启动 Electron 开发模式
npm run electron:dev
```

### 构建发布版

```bash
npm run electron:build
```

## 🚀 使用

1. **检查环境** - 打开应用后，概览页面会自动检查 OpenCode、Bun、Node.js 是否安装
2. **安装 Oh My OpenAgent** - 进入「安装向导」，选择你的 Provider 订阅，一键安装
3. **配置 Provider** - 进入「Provider 配置」，按指引完成各 Provider 的 OAuth 认证
4. **调整 Agent** - 进入「Agent 配置」，根据需要调整各 Agent 的模型和参数
5. **保存配置** - 点击顶部工具栏的保存按钮，配置会写入 `~/.config/opencode/oh-my-openagent.jsonc`

## 📁 项目结构

```
oh-my-openagent-configurator/
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程入口
│   └── preload.ts               # 预加载脚本（IPC 桥接）
├── src/
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts             # 配置类型、扩展接口类型
│   ├── store/                   # 状态管理
│   │   └── useAppStore.ts       # Zustand 全局状态
│   ├── data/                    # 静态数据
│   │   └── constants.ts         # Agent/Category/Provider 元数据
│   ├── i18n/                    # 国际化
│   │   ├── locales/             # 语言包
│   │   │   ├── en.ts            # 英文
│   │   │   └── zh.ts            # 中文
│   │   └── index.ts             # 国际化配置
│   ├── components/
│   │   ├── layout/              # 布局组件
│   │   │   ├── Sidebar.tsx      # 侧边栏导航
│   │   │   └── Header.tsx       # 顶部工具栏
│   │   └── pages/               # 页面组件
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
│   ├── App.tsx                  # 应用入口
│   ├── main.tsx                 # React 渲染入口
│   └── index.css                # 全局样式
├── index.html                   # HTML 模板
├── vite.config.ts               # Vite 配置
├── tailwind.config.js           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目配置
```

## 🔌 Skills & MCP 扩展接口

应用已预留 Skills 和 MCP 管理的扩展接口：

### 当前支持
- 手动添加本地/远程自定义 Skill
- 手动添加本地/远程自定义 MCP 服务
- 启用/禁用内置 Skills 和 MCP
- 导入/导出配置

### 未来规划
- 从 GitHub 仓库一键安装 Skills/MCP
- 从 npm 包安装 Skills/MCP
- Skills/MCP 市场浏览和搜索
- 版本管理和自动更新
- 配置模板库

## 📄 许可证

MIT License

## 🙏 致谢

- [Oh My OpenAgent](https://github.com/code-yeongyu/oh-my-openagent) - 核心项目
- [OpenCode](https://opencode.ai) - 基础运行环境

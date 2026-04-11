import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // 环境检查
  checkOpencode: () => Promise<{ installed: boolean; version: string | null; isSupported: boolean }>;
  checkRuntime: () => Promise<Record<string, { installed: boolean; version?: string }>>;
  getPlatformInfo: () => Promise<{
    platform: string;
    arch: string;
    osVersion: string;
    homeDir: string;
    configDir: string;
  }>;
  
  // 配置管理
  readConfig: (configPath?: string) => Promise<{
    found: boolean;
    path?: string;
    content?: string;
    filename?: string;
    configDir?: string;
    error?: string;
  }>;
  writeConfig: (configPath: string, content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  readOpencodeConfig: () => Promise<{ found: boolean; path: string; content?: string; error?: string }>;
  writeOpencodeConfig: (content: string) => Promise<{ success: boolean; error?: string }>;
  getConfigDir: () => Promise<string>;
  
  // 安装与诊断
  runInstall: (options: {
    claude: string;
    openai: string;
    gemini: string;
    copilot: string;
    opencodeZen?: string;
    opencodeGo?: string;
    zaiCodingPlan?: string;
  }) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string; command?: string }>;
  runDoctor: () => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
  listModels: () => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
  
  // 文件操作
  selectDirectory: () => Promise<string | null>;
  selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
  exportConfig: (content: string, defaultName?: string) => Promise<{ success: boolean; path?: string; error?: string } | null>;
  importConfig: () => Promise<{ success: boolean; content?: string; path?: string; error?: string } | null>;
  
  // 外部链接
  openExternal: (url: string) => Promise<void>;
  // 打开本地文件夹
  openFolder: (path: string) => Promise<void>;
  // 切换开发者工具
  toggleDevTools: () => Promise<void>;
  // 检查 Oh My OpenAgent
  checkOhMyOpenAgent: () => Promise<{ installed: boolean; version: string | null }>;
  // 插件管理
  readLocalPlugins: () => Promise<{
    global: Array<{ path: string; source: string; name: string }>;
    project: Array<{ path: string; source: string; name: string }>;
  }>;
  searchNpmPlugins: (query: string) => Promise<{ results: any[]; error?: string }>;
  installNpmPlugin: (packageName: string) => Promise<{ success: boolean; error?: string }>;
  uninstallNpmPlugin: (packageName: string) => Promise<{ success: boolean; error?: string }>;
}

const electronAPI: ElectronAPI = {
  checkOpencode: () => ipcRenderer.invoke('check-opencode'),
  checkRuntime: () => ipcRenderer.invoke('check-runtime'),
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  
  readConfig: (configPath?) => ipcRenderer.invoke('read-config', configPath),
  writeConfig: (configPath, content) => ipcRenderer.invoke('write-config', configPath, content),
  readOpencodeConfig: () => ipcRenderer.invoke('read-opencode-config'),
  writeOpencodeConfig: (content) => ipcRenderer.invoke('write-opencode-config', content),
  getConfigDir: () => ipcRenderer.invoke('get-config-dir'),
  
  runInstall: (options) => ipcRenderer.invoke('run-install', options),
  runDoctor: () => ipcRenderer.invoke('run-doctor'),
  listModels: () => ipcRenderer.invoke('list-models'),
  
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: (filters?) => ipcRenderer.invoke('select-file', filters),
  exportConfig: (content, defaultName?) => ipcRenderer.invoke('export-config', content, defaultName),
  importConfig: () => ipcRenderer.invoke('import-config'),
  
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),
  checkOhMyOpenAgent: () => ipcRenderer.invoke('check-oh-my-openagent'),
  readLocalPlugins: () => ipcRenderer.invoke('read-local-plugins'),
  searchNpmPlugins: (query) => ipcRenderer.invoke('search-npm-plugins', query),
  installNpmPlugin: (packageName) => ipcRenderer.invoke('install-npm-plugin', packageName),
  uninstallNpmPlugin: (packageName) => ipcRenderer.invoke('uninstall-npm-plugin', packageName),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

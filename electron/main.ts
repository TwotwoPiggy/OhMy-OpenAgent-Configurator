import { app, BrowserWindow, ipcMain, shell, dialog, Menu, MenuItem } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile, exec } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

function getConfigDir(): string {
  if (process.platform === 'win32') {
    return path.join(os.homedir(), '.config', 'opencode');
  }
  return path.join(os.homedir(), '.config', 'opencode');
}

function getProjectConfigDir(projectPath?: string): string {
  if (projectPath) {
    return path.join(projectPath, '.opencode');
  }
  return '';
}

// 过滤 ANSI 转义序列
function stripAnsi(str: string): string {
  return str.replace(/[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

interface ExecError {
  message: string;
  code?: string | number;
  killed?: boolean;
  signal?: string | null;
  cmd?: string;
  stdout: string;
  stderr: string;
}

const execAsyncWithTimeout = (cmd: string, timeoutMs: number = 30000): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    exec(cmd, { encoding: 'utf8', shell: process.platform === 'win32' ? 'cmd.exe' : undefined }, (error, stdout, stderr) => {
      clearTimeout(timer);
      if (error) {
        const errorStdout = stripAnsi(String(stdout || ''));
        const errorStderr = stripAnsi(String(stderr || ''));
        const execError: ExecError = {
          message: error.message || String(error),
          code: (error as any).code,
          killed: (error as any).killed,
          signal: (error as any).signal,
          cmd: (error as any).cmd,
          stdout: errorStdout,
          stderr: errorStderr,
        };
        reject(execError);
      } else {
        const outputStdout = stripAnsi(String(stdout || '')).trim();
        const outputStderr = stripAnsi(String(stderr || '')).trim();
        resolve({ stdout: outputStdout, stderr: outputStderr });
      }
    });
  });
};

// IPC Handlers

// 检查 opencode 是否安装
ipcMain.handle('check-opencode', async () => {
  try {
    const { stdout } = await execAsyncWithTimeout('opencode --version', 10000);
    const version = stdout.replace('opencode ', '').trim();
    const major = parseInt(version.split('.')[0]);
    const minor = parseInt(version.split('.')[1]);
    const patch = parseInt(version.split('.')[2] || '0');
    const isSupported = major > 1 || (major === 1 && (minor > 0 || (minor === 0 && patch >= 150)));
    return { installed: true, version, isSupported };
  } catch {
    return { installed: false, version: null, isSupported: false };
  }
});

// 检查 bun/npm 是否安装
ipcMain.handle('check-runtime', async () => {
  const runtimes: Record<string, { installed: boolean; version?: string }> = {};
  
  for (const runtime of ['bun', 'npm', 'npx', 'node']) {
    try {
      const { stdout } = await execAsyncWithTimeout(`${runtime} --version`, 5000);
      runtimes[runtime] = { installed: true, version: stdout.trim() };
    } catch {
      runtimes[runtime] = { installed: false };
    }
  }
  
  return runtimes;
});

// 读取配置文件
ipcMain.handle('read-config', async (_event, configPath?: string) => {
  const configDir = configPath || getConfigDir();
  const possibleFiles = [
    'oh-my-openagent.jsonc',
    'oh-my-openagent.json',
    'oh-my-opencode.jsonc',
    'oh-my-opencode.json',
  ];
  
  for (const file of possibleFiles) {
    const fullPath = path.join(configDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return { found: true, path: fullPath, content, filename: file };
      } catch (err) {
        return { found: false, error: `读取 ${file} 失败: ${err}` };
      }
    }
  }
  
  return { found: false, configDir };
});

// 写入配置文件
ipcMain.handle('write-config', async (_event, configPath: string, content: string) => {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, content, 'utf-8');
    return { success: true, path: configPath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// 读取 opencode.json (主配置)
ipcMain.handle('read-opencode-config', async () => {
  const configPath = path.join(getConfigDir(), 'opencode.json');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return { found: true, path: configPath, content };
    } catch (err) {
      return { found: false, error: String(err) };
    }
  }
  return { found: false, path: configPath };
});

// 写入 opencode.json
ipcMain.handle('write-opencode-config', async (_event, content: string) => {
  const configPath = path.join(getConfigDir(), 'opencode.json');
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// 获取平台特定的二进制包名
function getPlatformBinaryPackage(): string | null {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'win32' && arch === 'x64') {
    return 'oh-my-opencode-windows-x64';
  } else if (platform === 'darwin' && arch === 'x64') {
    return 'oh-my-opencode-darwin-x64';
  } else if (platform === 'darwin' && arch === 'arm64') {
    return 'oh-my-opencode-darwin-arm64';
  } else if (platform === 'linux' && arch === 'x64') {
    return 'oh-my-opencode-linux-x64';
  } else if (platform === 'linux' && arch === 'arm64') {
    return 'oh-my-opencode-linux-arm64';
  }
  
  return null;
}

// 运行安装命令
ipcMain.handle('run-install', async (_event, options: {
  claude: string;
  openai: string;
  gemini: string;
  copilot: string;
  opencodeZen?: string;
  opencodeGo?: string;
  zaiCodingPlan?: string;
}) => {
  let runtime = 'npx';
  try {
    await execAsyncWithTimeout('bun --version', 5000);
    runtime = 'bunx';
  } catch {
    console.log('Bun not available, falling back to npx');
  }
  
  const pkg = 'oh-my-opencode';
  
  let cmd = `${runtime} ${pkg} install --no-tui`;
  cmd += ` --claude=${options.claude}`;
  cmd += ` --openai=${options.openai}`;
  cmd += ` --gemini=${options.gemini}`;
  cmd += ` --copilot=${options.copilot}`;
  
  if (options.opencodeZen) cmd += ` --opencode-zen=${options.opencodeZen}`;
  if (options.opencodeGo) cmd += ` --opencode-go=${options.opencodeGo}`;
  if (options.zaiCodingPlan) cmd += ` --zai-coding-plan=${options.zaiCodingPlan}`;
  
  const buildInstallCmd = (): string => {
    let c = `${runtime} ${pkg} install --no-tui`;
    c += ` --claude=${options.claude}`;
    c += ` --openai=${options.openai}`;
    c += ` --gemini=${options.gemini}`;
    c += ` --copilot=${options.copilot}`;
    if (options.opencodeZen) c += ` --opencode-zen=${options.opencodeZen}`;
    if (options.opencodeGo) c += ` --opencode-go=${options.opencodeGo}`;
    if (options.zaiCodingPlan) c += ` --zai-coding-plan=${options.zaiCodingPlan}`;
    return c;
  };
  
  try {
    const { stdout, stderr } = await execAsyncWithTimeout(cmd, 120000);
    return { success: true, stdout, stderr, command: cmd };
  } catch (err: any) {
    console.error('安装命令执行失败:', JSON.stringify(err, null, 2));
    
    const rawMessage = err?.message || '';
    const rawStderr = err?.stderr || '';
    const rawStdout = err?.stdout || '';
    const combinedOutput = rawMessage + rawStderr + rawStdout;
    
    // 检测平台二进制文件缺失错误
    if (combinedOutput.includes('Platform binary not installed') || combinedOutput.includes('Expected packages')) {
      const platformPkg = getPlatformBinaryPackage();
      if (platformPkg) {
        console.log(`检测到平台二进制文件缺失，尝试安装 ${platformPkg}...`);
        try {
          const installPkgCmd = `npm install -g ${platformPkg}`;
          await execAsyncWithTimeout(installPkgCmd, 60000);
          
          // 重试安装命令
          const retryCmd = buildInstallCmd();
          const { stdout, stderr } = await execAsyncWithTimeout(retryCmd, 120000);
          return { 
            success: true, 
            stdout: `已自动安装平台二进制文件 ${platformPkg}\n\n${stdout}`, 
            stderr,
            command: retryCmd 
          };
        } catch (installErr: any) {
          return { 
            success: false, 
            error: `平台二进制文件安装失败。请手动运行: npm install -g ${platformPkg}`,
            stdout: String(installErr?.stdout || ''),
            stderr: String(installErr?.stderr || ''),
            command: `npm install -g ${platformPkg}`
          };
        }
      }
    }
    
    let errorMessage = '安装命令执行失败';
    const rawCode = err?.code;
    
    if (rawMessage.includes('timed out')) {
      errorMessage = '安装命令超时（120秒），请检查网络连接后重试';
    } else if (rawCode === 'ENOENT' || rawMessage.includes('not recognized') || rawMessage.includes('找不到') || rawStderr.includes('not recognized')) {
      errorMessage = `未找到 ${runtime} 命令。请确保 ${runtime === 'bunx' ? 'Bun (https://bun.sh)' : 'Node.js + npm (https://nodejs.org)'} 已安装并添加到系统 PATH`;
    } else if (err?.killed) {
      errorMessage = '安装进程被终止';
    } else if (rawCode === 'EPERM' || rawMessage.includes('permission denied') || rawMessage.includes('EACCES')) {
      errorMessage = '权限不足，请尝试以管理员身份运行此应用程序';
    } else if (rawStderr.includes('ENOTFOUND') || rawStderr.includes('ETIMEDOUT') || rawStderr.includes('network') || rawMessage.includes('ENOTFOUND')) {
      errorMessage = '网络连接失败，请检查网络后重试';
    } else if (rawMessage) {
      errorMessage = rawMessage;
    }
    
    return { 
      success: false, 
      error: errorMessage, 
      stdout: String(rawStdout),
      stderr: String(rawStderr),
      command: cmd
    };
  }
});

// 运行诊断
ipcMain.handle('run-doctor', async () => {
  try {
    const { stdout, stderr } = await execAsyncWithTimeout('bunx oh-my-opencode doctor --verbose', 60000);
    return { success: true, stdout, stderr };
  } catch (err: any) {
    const errorMessage = err?.message || String(err) || '诊断命令执行失败';
    return { success: false, error: errorMessage, stdout: String(err?.stdout || ''), stderr: String(err?.stderr || '') };
  }
});

// 列出可用模型
ipcMain.handle('list-models', async () => {
  try {
    const { stdout, stderr } = await execAsyncWithTimeout('opencode models', 30000);
    return { success: true, stdout, stderr };
  } catch (err: any) {
    const errorMessage = err?.message || String(err) || '获取模型列表失败';
    return { success: false, error: errorMessage, stdout: String(err?.stdout || ''), stderr: String(err?.stderr || '') };
  }
});

// 读取本地插件目录
// 支持两个来源：全局 ~/.config/opencode/plugins/ 和项目级 .opencode/plugins/
ipcMain.handle('read-local-plugins', async () => {
  const configDir = getConfigDir();
  const globalPluginsDir = path.join(configDir, 'plugins');
  // 项目级插件目录：相对于当前工作目录
  const projectPluginsDir = path.join(process.cwd(), '.opencode', 'plugins');

  const readDir = (dir: string, source: 'global' | 'project'): Array<{ path: string; source: string; name: string }> => {
    const results: Array<{ path: string; source: string; name: string }> = [];
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          // 支持 .js, .ts, .mjs, .cjs 插件文件，跳过目录
          if (
            file.endsWith('.js') ||
            file.endsWith('.ts') ||
            file.endsWith('.mjs') ||
            file.endsWith('.cjs')
          ) {
            results.push({
              path: path.join(dir, file),
              source,
              name: file,
            });
          }
        }
      } catch (err) {
        console.error(`读取插件目录 ${dir} 失败:`, err);
      }
    }
    return results;
  };

  const globalPlugins = readDir(globalPluginsDir, 'global');
  const projectPlugins = readDir(projectPluginsDir, 'project');

  return {
    global: globalPlugins,
    project: projectPlugins,
  };
});

// 搜索 npm 插件 (opencode- 前缀)
ipcMain.handle('search-npm-plugins', async (_event, query: string) => {
  try {
    const { stdout } = await execAsyncWithTimeout(`npm search opencode --json --prefer-online`, 30000);
    const results = JSON.parse(stdout || '[]');
    const filtered = results
      .filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 20)
      .map((p: any) => ({
        name: p.name,
        version: p.version,
        description: p.description || '',
        author: p.maintainers?.[0]?.name || '',
        homepage: p.homepage || '',
        keywords: p.keywords || [],
      }));
    return { results: filtered };
  } catch (err: any) {
    // 如果 npm search 失败，尝试使用 npm view
    try {
      const { stdout } = await execAsyncWithTimeout(`npm view opencode-${query} --json 2>nul || echo "[]"`, 15000);
      if (stdout && stdout !== '[]') {
        const pkg = JSON.parse(stdout);
        return {
          results: [{
            name: pkg.name,
            version: pkg.version,
            description: pkg.description || '',
            author: typeof pkg.maintainers?.[0] === 'object' ? pkg.maintainers[0].name : '',
            homepage: pkg.homepage || '',
            keywords: pkg.keywords || [],
          }],
        };
      }
      return { results: [] };
    } catch {
      return { results: [], error: `搜索失败: ${err.message}` };
    }
  }
});

// 安装 npm 插件
ipcMain.handle('install-npm-plugin', async (_event, packageName: string) => {
  try {
    // 更新 opencode.json 中的 plugin 字段
    const configPath = path.join(getConfigDir(), 'opencode.json');
    let config: Record<string, any> = {};
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(content);
    }
    if (!config.plugin) config.plugin = [];
    if (!config.plugin.includes(packageName)) {
      config.plugin.push(packageName);
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 卸载 npm 插件
ipcMain.handle('uninstall-npm-plugin', async (_event, packageName: string) => {
  try {
    // 从 opencode.json 的 plugin 字段中移除
    const configPath = path.join(getConfigDir(), 'opencode.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);
      if (config.plugin) {
        config.plugin = config.plugin.filter((p: string) => p !== packageName);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// 检查 Oh My OpenAgent 是否安装
ipcMain.handle('check-oh-my-openagent', async () => {
  try {
    const { stdout } = await execAsyncWithTimeout('bunx oh-my-opencode --version', 10000);
    return { installed: true, version: stdout.trim() };
  } catch {
    try {
      const { stdout } = await execAsyncWithTimeout('npx oh-my-opencode --version', 10000);
      return { installed: true, version: stdout.trim() };
    } catch {
      return { installed: false, version: null };
    }
  }
});

// 选择目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '选择项目目录',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// 选择文件
ipcMain.handle('select-file', async (_event, filters?: { name: string; extensions: string[] }[]) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    title: '选择配置文件',
    filters: filters || [
      { name: 'JSON/JSONC', extensions: ['json', 'jsonc'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// 导出配置
ipcMain.handle('export-config', async (_event, content: string, defaultName?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: '导出配置',
    defaultPath: defaultName || 'oh-my-openagent-config.jsonc',
    filters: [
      { name: 'JSONC', extensions: ['jsonc'] },
      { name: 'JSON', extensions: ['json'] },
    ],
  });
  if (result.canceled) return null;
  try {
    fs.writeFileSync(result.filePath!, content, 'utf-8');
    return { success: true, path: result.filePath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// 导入配置
ipcMain.handle('import-config', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    title: '导入配置文件',
    filters: [
      { name: 'JSON/JSONC', extensions: ['json', 'jsonc'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  if (result.canceled) return null;
  try {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { success: true, content, path: result.filePaths[0] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// 获取配置目录路径
ipcMain.handle('get-config-dir', () => {
  return getConfigDir();
});

// 获取平台信息
ipcMain.handle('get-platform-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    osVersion: os.version(),
    homeDir: os.homedir(),
    configDir: getConfigDir(),
  };
});

// 在外部浏览器中打开链接
ipcMain.handle('open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});

// 切换开发者工具
ipcMain.handle('toggle-devtools', async () => {
  mainWindow?.webContents.toggleDevTools();
});

// 打开本地文件夹
ipcMain.handle('open-folder', async (_event, path: string) => {
  await shell.openPath(path);
});

// 创建窗口
function createWindow() {
  // 隐藏默认菜单栏
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Oh My OpenAgent Configurator',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 开发环境加载 Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 右键上下文菜单：包含开发者工具选项
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const contextMenu = new Menu();
    contextMenu.append(new MenuItem({
      label: '开发者工具',
      submenu: [
        {
          label: '打开/关闭开发者工具',
          accelerator: (process.platform === 'darwin' ? 'Cmd' : 'Ctrl') + '+Shift+I',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        {
          label: '刷新页面',
          accelerator: (process.platform === 'darwin' ? 'Cmd' : 'Ctrl') + '+R',
          click: () => mainWindow?.webContents.reload(),
        },
      ],
    }));
    contextMenu.popup({ window: mainWindow!, x: params.x, y: params.y });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

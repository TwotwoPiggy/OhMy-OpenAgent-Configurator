import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
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

const execAsyncWithTimeout = (cmd: string, timeoutMs: number = 30000): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    exec(cmd, { encoding: 'utf8' }, (error, stdout, stderr) => {
      clearTimeout(timer);
      if (error) {
        // 处理错误情况下的编码
        const errorStdout = error.stdout ? stripAnsi(String(error.stdout)) : '';
        const errorStderr = error.stderr ? stripAnsi(String(error.stderr)) : '';
        reject({ ...error, stdout: errorStdout, stderr: errorStderr });
      } else {
        // 确保输出是字符串并去除首尾空白和 ANSI 转义序列
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
  const runtime = options.claude ? 'bunx' : 'npx';
  const pkg = 'oh-my-opencode';
  
  let cmd = `${runtime} ${pkg} install --no-tui`;
  cmd += ` --claude=${options.claude}`;
  cmd += ` --openai=${options.openai}`;
  cmd += ` --gemini=${options.gemini}`;
  cmd += ` --copilot=${options.copilot}`;
  
  if (options.opencodeZen) cmd += ` --opencode-zen=${options.opencodeZen}`;
  if (options.opencodeGo) cmd += ` --opencode-go=${options.opencodeGo}`;
  if (options.zaiCodingPlan) cmd += ` --zai-coding-plan=${options.zaiCodingPlan}`;
  
  try {
    const { stdout, stderr } = await execAsyncWithTimeout(cmd, 120000);
    return { success: true, stdout, stderr };
  } catch (err: any) {
    return { success: false, error: err.message, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
});

// 运行诊断
ipcMain.handle('run-doctor', async () => {
  try {
    const { stdout, stderr } = await execAsyncWithTimeout('bunx oh-my-opencode doctor --verbose', 60000);
    return { success: true, stdout, stderr };
  } catch (err: any) {
    return { success: false, error: err.message, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
});

// 列出可用模型
ipcMain.handle('list-models', async () => {
  try {
    const { stdout, stderr } = await execAsyncWithTimeout('opencode models', 30000);
    return { success: true, stdout, stderr };
  } catch (err: any) {
    return { success: false, error: err.message, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
});

// 检查 Oh My OpenAgent 是否安装
ipcMain.handle('check-oh-my-openagent', async () => {
  try {
    // 尝试运行 doctor 命令来检测是否安装
    const { stdout, stderr } = await execAsyncWithTimeout('bunx oh-my-opencode --version', 10000);
    return { installed: true, version: stdout.trim() };
  } catch {
    try {
      // 尝试使用 npx
      const { stdout, stderr } = await execAsyncWithTimeout('npx oh-my-opencode --version', 10000);
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

// 打开本地文件夹
ipcMain.handle('open-folder', async (_event, path: string) => {
  await shell.openPath(path);
});

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Oh My OpenAgent 配置器',
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
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
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

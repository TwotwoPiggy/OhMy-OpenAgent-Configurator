import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Save, Download, Upload, Stethoscope, ExternalLink, RefreshCw, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const {
    configPath,
    configLoaded,
    opencodeInstalled,
    opencodeVersion,
    isDoctorRunning,
    activeTab,
    currentLanguage,
    toggleLanguage,
  } = useAppStore();

  const handleSave = async () => {
    const store = useAppStore.getState();
    
    // 首先读取配置文件，获取实际的配置文件路径
    const configResult = await window.electronAPI.readConfig();
    
    let savePath;
    if (configResult.found && configResult.path) {
      // 使用已有的配置文件路径
      savePath = configResult.path;
    } else {
      // 如果没有找到配置文件，使用默认路径
      const configDir = await window.electronAPI.getConfigDir();
      savePath = `${configDir}/oh-my-openagent.jsonc`;
    }
    
    const content = JSON.stringify(store.config, null, 2);
    let result = await window.electronAPI.writeConfig(savePath, content);
    
    if (result.success) {
      store.setConfigPath(result.path || null);
      alert(t('alerts.configSaved'));
    } else {
      // 如果保存失败，尝试使用不同的策略
      if (result.error?.includes('EPERM')) {
        // 尝试1: 使用不同的文件名
        const configDir = await window.electronAPI.getConfigDir();
        const altSavePath = `${configDir}/oh-my-openagent.json`;
        let altResult = await window.electronAPI.writeConfig(altSavePath, content);
        
        if (altResult.success) {
          store.setConfigPath(altResult.path || null);
          alert(t('alerts.configSaved'));
        } else {
          // 尝试2: 使用导出功能让用户选择保存位置
          const exportResult = await window.electronAPI.exportConfig(content, 'oh-my-openagent.json');
          if (exportResult && exportResult.success && exportResult.path) {
            store.setConfigPath(exportResult.path);
            alert(t('alerts.configSaved'));
          } else {
            alert(t('alerts.saveFailedPermission', { error: altResult.error }));
          }
        }
      } else {
        alert(t('alerts.saveFailed', { error: result.error }));
      }
    }
  };

  const handleExport = async () => {
    const store = useAppStore.getState();
    const content = JSON.stringify(store.config, null, 2);
    await window.electronAPI.exportConfig(content);
  };

  const handleImport = async () => {
    const result = await window.electronAPI.importConfig();
    if (result && result.success && result.content) {
      try {
        const cleanContent = result.content
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        const parsed = JSON.parse(cleanContent);
        useAppStore.getState().setConfig(parsed);
        useAppStore.getState().setConfigLoaded(true);
        alert(t('alerts.configImported'));
      } catch {
        alert(t('alerts.configParseError'));
      }
    }
  };

  const handleDoctor = async () => {
    const store = useAppStore.getState();
    store.setDoctorRunning(true);
    store.clearDoctorLog();
    store.setActiveTab('overview');
    
    store.appendDoctorLog(t('doctor.running') + '\n');
    const result = await window.electronAPI.runDoctor();
    if (result.success) {
      store.appendDoctorLog(result.stdout || '');
      if (result.stderr) store.appendDoctorLog('\n' + t('doctor.stderr') + result.stderr);
    } else {
      store.appendDoctorLog(t('doctor.failed', { error: result.error || '未知错误' }) + '\n');
      if (result.stdout) store.appendDoctorLog('\n' + result.stdout);
    }
    store.setDoctorRunning(false);
  };

  const handleRefresh = async () => {
    const [opencodeResult, configResult] = await Promise.all([
      window.electronAPI.checkOpencode(),
      window.electronAPI.readConfig(),
    ]);
    
    useAppStore.getState().setOpencodeInstalled(opencodeResult.installed);
    useAppStore.getState().setOpencodeVersion(opencodeResult.version);
    useAppStore.getState().setOpencodeSupported(opencodeResult.isSupported);
    
    if (configResult.found && configResult.content) {
      useAppStore.getState().setConfigPath(configResult.path || null);
      try {
        const cleanContent = configResult.content
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        const parsed = JSON.parse(cleanContent);
        useAppStore.getState().setConfig(parsed);
      } catch { /* ignore */ }
    }
  };

  const pageTitles: Record<string, string> = {
    overview: t('sidebar.overview'),
    install: t('sidebar.install'),
    providers: t('sidebar.providers'),
    agents: t('sidebar.agents'),
    categories: t('sidebar.categories'),
    concurrency: t('sidebar.concurrency'),
    hooks: t('sidebar.hooks'),
    skills: t('sidebar.skills'),
    mcps: t('sidebar.mcps'),
    advanced: t('sidebar.advanced'),
    editor: t('sidebar.editor'),
  };

  return (
    <header className="h-14 bg-surface-950 border-b border-surface-700 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-surface-100">
          {pageTitles[activeTab] || '概览'}
        </h1>
        {configLoaded && configPath && (
          <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
            {t('header.loadedConfig')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* OpenCode 状态 */}
        <div className="flex items-center gap-2 mr-4">
          <div className={`w-2 h-2 rounded-full ${opencodeInstalled ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-surface-400">
            {t('header.opencodeInstalled')} {opencodeInstalled ? `v${opencodeVersion}` : t('header.opencodeNotInstalled')}
          </span>
        </div>

        <button onClick={handleRefresh} className="btn-ghost" title={t('header.refresh')}>
          <RefreshCw size={16} />
        </button>
        <button onClick={handleSave} className="btn-ghost" title={t('header.save')}>
          <Save size={16} />
        </button>
        <button onClick={handleExport} className="btn-ghost" title={t('header.export')}>
          <Download size={16} />
        </button>
        <button onClick={handleImport} className="btn-ghost" title={t('header.import')}>
          <Upload size={16} />
        </button>
        <button
          onClick={handleDoctor}
          className="btn-ghost"
          title={t('header.doctor')}
          disabled={isDoctorRunning}
        >
          <Stethoscope size={16} className={isDoctorRunning ? 'animate-spin-slow' : ''} />
        </button>
        <button
          onClick={() => window.electronAPI.openExternal('https://ohmyopenagent.com/zh/docs')}
          className="btn-ghost"
          title={t('header.docs')}
        >
          <ExternalLink size={16} />
        </button>
        <button
          onClick={toggleLanguage}
          className="btn-ghost"
          title={t('header.language')}
        >
          <Globe size={16} />
          <span className="ml-1 text-xs">{currentLanguage === 'zh' ? '中文' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

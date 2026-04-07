import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Settings,
  Bot,
  Sparkles,
  Plug,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    opencodeInstalled,
    opencodeVersion,
    opencodeSupported,
    ohMyOpenAgentInstalled,
    ohMyOpenAgentVersion,
    runtimeInfo,
    platformInfo,
    configLoaded,
    configPath,
    config,
    doctorLog,
    isDoctorRunning,
    setOhMyOpenAgentInstalled,
    setOhMyOpenAgentVersion,
  } = useAppStore();

  // 检查 Oh My OpenAgent 安装状态
  useEffect(() => {
    const checkOhMyOpenAgent = async () => {
      try {
        const result = await window.electronAPI.checkOhMyOpenAgent();
        setOhMyOpenAgentInstalled(result.installed);
        setOhMyOpenAgentVersion(result.version);
      } catch (error) {
        console.error('Check Oh My OpenAgent failed:', error);
      }
    };

    checkOhMyOpenAgent();
  }, [setOhMyOpenAgentInstalled, setOhMyOpenAgentVersion]);

  const agentCount = Object.keys(config.agents || {}).length;
  const categoryCount = Object.keys(config.categories || {}).length;
  const disabledAgents = config.disabled_agents?.length || 0;
  const disabledHooks = config.disabled_hooks?.length || 0;

  interface StatusCard {
    title: string;
    status: 'ok' | 'warning' | 'error';
    detail: string;
    action?: string;
  }

  const statusCards: StatusCard[] = [
    {
      title: 'OpenCode',
      status: opencodeInstalled ? (opencodeSupported ? 'ok' : 'warning') : 'error',
      detail: opencodeInstalled ? `v${opencodeVersion}` : t('overview.notInstalled'),
      action: opencodeInstalled ? undefined : 'install',
    },
    {
      title: 'Oh My OpenAgent',
      status: ohMyOpenAgentInstalled ? 'ok' : 'error',
      detail: ohMyOpenAgentInstalled ? `v${ohMyOpenAgentVersion || '已安装'}` : t('overview.notInstalled'),
      action: ohMyOpenAgentInstalled ? undefined : 'install',
    },
    {
      title: 'Bun',
      status: runtimeInfo.bun?.installed ? 'ok' : 'warning',
      detail: runtimeInfo.bun?.version || t('overview.notInstalled'),
    },
    {
      title: 'Node.js',
      status: runtimeInfo.node?.installed ? 'ok' : 'error',
      detail: runtimeInfo.node?.version || t('overview.notInstalled'),
    },
  ];

  const quickActions = [
    { label: ohMyOpenAgentInstalled ? t('overview.updateOhMyOpenAgent') : t('overview.installOhMyOpenAgent'), icon: Settings, tab: 'install', color: 'text-primary-400' },
    { label: t('overview.configureProviders'), icon: Sparkles, tab: 'providers', color: 'text-yellow-400' },
    { label: t('overview.configureAgents'), icon: Bot, tab: 'agents', color: 'text-green-400' },
    { label: t('overview.manageSkills'), icon: Sparkles, tab: 'skills', color: 'text-pink-400' },
    { label: t('overview.manageMcp'), icon: Plug, tab: 'mcps', color: 'text-cyan-400' },
  ];

  const StatusIcon = ({ status }: { status: 'ok' | 'warning' | 'error' }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 size={20} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 欢迎区域 */}
      <div className="card bg-gradient-to-r from-primary-900/30 to-surface-800 border-primary-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-100 mb-1">
              {t('overview.welcome')}
            </h2>
            <p className="text-surface-400 text-sm">
              {t('overview.welcomeSubtitle')}
            </p>
          </div>
          <div className="text-4xl">🚀</div>
        </div>
      </div>

      {/* 状态卡片 */}
      <div>
        <h3 className="section-title">{t('overview.environmentStatus')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-surface-300">{card.title}</span>
                <StatusIcon status={card.status} />
              </div>
              <div className="text-lg font-semibold text-surface-100">{card.detail}</div>
              {card.status === 'error' && (
                <button
                  onClick={() => useAppStore.getState().setActiveTab(card.action || 'install')}
                  className="mt-2 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  {t('overview.goToSettings')} <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 配置概览 */}
      {configLoaded && (
        <div>
          <h3 className="section-title">{t('overview.configOverview')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-400">{agentCount}</div>
              <div className="text-xs text-surface-400 mt-1">{t('overview.customAgents')}</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-400">{categoryCount}</div>
              <div className="text-xs text-surface-400 mt-1">{t('overview.customCategories')}</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-400">{disabledAgents}</div>
              <div className="text-xs text-surface-400 mt-1">{t('overview.disabledAgents')}</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-pink-400">{disabledHooks}</div>
              <div className="text-xs text-surface-400 mt-1">{t('overview.disabledHooks')}</div>
            </div>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div>
        <h3 className="section-title">{t('overview.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => useAppStore.getState().setActiveTab(action.tab)}
                className="card card-hover flex items-center gap-3 cursor-pointer"
              >
                <Icon size={20} className={action.color} />
                <span className="text-sm text-surface-200">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 平台信息 */}
      {platformInfo && (
        <div>
          <h3 className="section-title">{t('overview.platformInfo')}</h3>
          <div className="card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-surface-500">{t('overview.platform')}</span>
                <div className="text-surface-200 mt-0.5">{platformInfo.platform}</div>
              </div>
              <div>
                <span className="text-surface-500">{t('overview.architecture')}</span>
                <div className="text-surface-200 mt-0.5">{platformInfo.arch}</div>
              </div>
              <div>
                <span className="text-surface-500">{t('overview.configDir')}</span>
                <div className="text-surface-200 mt-0.5 font-mono text-xs flex items-center gap-2">
                  <span>{platformInfo.configDir}</span>
                  <button
                    onClick={() => window.electronAPI.openFolder(platformInfo.configDir)}
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                    title="打开文件夹"
                  >
                    📁
                  </button>
                </div>
              </div>
              <div>
                <span className="text-surface-500">{t('overview.configFile')}</span>
                <div className="flex items-start gap-2 mt-0.5">
                  <div className="text-surface-200 font-mono text-xs break-all flex-1">
                    {configPath || t('overview.notCreated')}
                  </div>
                  {configPath && (
                    <button
                      onClick={() => window.electronAPI.openFolder(configPath)}
                      className="text-surface-400 hover:text-surface-200 p-1"
                      title={t('overview.openFolder')}
                    >
                      <FolderOpen size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 诊断日志 */}
      {(doctorLog || isDoctorRunning) && (
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Terminal size={18} />
            {t('overview.diagnosticLog')}
            {isDoctorRunning && (
              <span className="badge-info animate-pulse">{t('overview.running')}</span>
            )}
          </h3>
          <div className="terminal-output">{doctorLog || t('overview.waitingForDiagnosis')}</div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;

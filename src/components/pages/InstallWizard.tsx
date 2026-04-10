import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Terminal,
} from 'lucide-react';

// 移动到组件内部以使用国际化

// 移动到组件内部以使用国际化

const InstallWizard: React.FC = () => {
  const { t } = useTranslation();
  const {
    opencodeInstalled,
    opencodeSupported,
    opencodeVersion,
    ohMyOpenAgentInstalled,
    ohMyOpenAgentVersion,
    runtimeInfo,
    isInstalling,
    installLog,
    setInstalling,
    appendInstallLog,
    clearInstallLog,
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
        console.error('检查 Oh My OpenAgent 失败:', error);
      }
    };

    checkOhMyOpenAgent();
  }, [setOhMyOpenAgentInstalled, setOhMyOpenAgentVersion]);

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({
    claude: 'no',
    openai: 'no',
    gemini: 'no',
    copilot: 'no',
    opencodeZen: 'no',
    opencodeGo: 'no',
    zaiCodingPlan: 'no',
  });

  const PROVIDER_OPTIONS = [
    {
      id: 'claude',
      name: t('installWizard.providerOptions.claude.name'),
      description: t('installWizard.providerOptions.claude.description'),
      icon: '🤖',
      color: 'border-amber-500/30 bg-amber-500/5',
      activeColor: 'border-amber-500 bg-amber-500/10',
      options: [
        { value: 'no', label: t('installWizard.providerOptions.claude.options.no') },
        { value: 'yes', label: t('installWizard.providerOptions.claude.options.yes') },
        { value: 'max20', label: t('installWizard.providerOptions.claude.options.max20') },
      ],
    },
    {
      id: 'openai',
      name: t('installWizard.providerOptions.openai.name'),
      description: t('installWizard.providerOptions.openai.description'),
      icon: '💡',
      color: 'border-green-500/30 bg-green-500/5',
      activeColor: 'border-green-500 bg-green-500/10',
      options: [
        { value: 'no', label: t('installWizard.providerOptions.openai.options.no') },
        { value: 'yes', label: t('installWizard.providerOptions.openai.options.yes') },
      ],
    },
    {
      id: 'gemini',
      name: t('installWizard.providerOptions.gemini.name'),
      description: t('installWizard.providerOptions.gemini.description'),
      icon: '💎',
      color: 'border-blue-500/30 bg-blue-500/5',
      activeColor: 'border-blue-500 bg-blue-500/10',
      options: [
        { value: 'no', label: t('installWizard.providerOptions.gemini.options.no') },
        { value: 'yes', label: t('installWizard.providerOptions.gemini.options.yes') },
      ],
    },
    {
      id: 'copilot',
      name: t('installWizard.providerOptions.copilot.name'),
      description: t('installWizard.providerOptions.copilot.description'),
      icon: '🐙',
      color: 'border-purple-500/30 bg-purple-500/5',
      activeColor: 'border-purple-500 bg-purple-500/10',
      options: [
        { value: 'no', label: t('installWizard.providerOptions.copilot.options.no') },
        { value: 'yes', label: t('installWizard.providerOptions.copilot.options.yes') },
      ],
    },
  ];

  const ADDITIONAL_OPTIONS = [
    {
      id: 'opencodeZen',
      name: t('installWizard.additionalOptions.opencodeZen.name'),
      description: t('installWizard.additionalOptions.opencodeZen.description'),
    },
    {
      id: 'opencodeGo',
      name: t('installWizard.additionalOptions.opencodeGo.name'),
      description: t('installWizard.additionalOptions.opencodeGo.description'),
    },
    {
      id: 'zaiCodingPlan',
      name: t('installWizard.additionalOptions.zaiCodingPlan.name'),
      description: t('installWizard.additionalOptions.zaiCodingPlan.description'),
    },
  ];

  const handleSelect = (providerId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [providerId]: value }));
  };

  const hasAnySubscription = Object.entries(selections).some(
    ([key, val]) => !['opencodeZen', 'opencodeGo', 'zaiCodingPlan'].includes(key) && val !== 'no'
  );

  const handleInstall = async () => {
    setInstalling(true);
    clearInstallLog();
    setStep(2);

    const operation = ohMyOpenAgentInstalled ? 'update' : 'install';
    appendInstallLog(ohMyOpenAgentInstalled ? t('installWizard.installLog.startUpdate') : t('installWizard.installLog.startInstall'));

    const result = await window.electronAPI.runInstall({
      claude: selections.claude,
      openai: selections.openai,
      gemini: selections.gemini,
      copilot: selections.copilot,
      opencodeZen: selections.opencodeZen,
      opencodeGo: selections.opencodeGo,
      zaiCodingPlan: selections.zaiCodingPlan,
    });

    if (result.success) {
      appendInstallLog(ohMyOpenAgentInstalled ? t('installWizard.installLog.updateSuccess') : t('installWizard.installLog.installSuccess'));
      appendInstallLog(result.stdout || '');
      if (result.stderr) appendInstallLog(t('installWizard.installLog.warningNote') + result.stderr);
      if (!ohMyOpenAgentInstalled) {
        appendInstallLog(t('installWizard.installLog.authNote'));
      }
    } else {
      appendInstallLog(ohMyOpenAgentInstalled ? t('installWizard.installLog.updateFailed') : t('installWizard.installLog.installFailed'));
      if (result.command) {
        appendInstallLog(t('installWizard.installLog.commandNote') + result.command + '\n\n');
      }
      if (result.error) {
        appendInstallLog(result.error + '\n');
      } else {
        appendInstallLog(t('installWizard.installLog.unknownError'));
      }
      if (result.stdout) {
        appendInstallLog(t('installWizard.installLog.stdoutNote') + result.stdout);
      }
      if (result.stderr) {
        appendInstallLog(t('installWizard.installLog.stderrNote') + result.stderr);
      }
    }

    setInstalling(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[t('installWizard.steps.checkEnv'), t('installWizard.steps.selectSubscriptions'), ohMyOpenAgentInstalled ? t('installWizard.steps.executeUpdate') : t('installWizard.steps.executeInstall')].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-700 text-surface-400'
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'text-surface-200' : 'text-surface-500'}`}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className={`w-12 h-0.5 ${i < step ? 'bg-green-500' : 'bg-surface-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: 环境检查 */}
      {step === 0 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-surface-100">{t('installWizard.step0.title')}</h2>
          <p className="text-surface-400 text-sm">
            {t('installWizard.step0.subtitle')}
          </p>

          <div className="space-y-3">
            {/* OpenCode */}
            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {opencodeInstalled ? (
                  opencodeSupported ? (
                    <CheckCircle2 size={24} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={24} className="text-yellow-400" />
                  )
                ) : (
                  <XCircle size={24} className="text-red-400" />
                )}
                <div>
                  <div className="font-medium text-surface-200">{t('installWizard.step0.opencode')}</div>
                  <div className="text-sm text-surface-400">
                    {opencodeInstalled
                      ? `v${opencodeVersion} ${opencodeSupported ? t('installWizard.step0.opencodeSupported') : t('installWizard.step0.opencodeVersionLow')}`
                      : t('installWizard.step0.opencodeRequired')}
                  </div>
                </div>
              </div>
              {!opencodeInstalled && (
                <a
                  href="https://opencode.ai"
                  onClick={(e) => {
                    e.preventDefault();
                    window.electronAPI.openExternal('https://opencode.ai');
                  }}
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  {t('installWizard.step0.downloaded')} <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Bun */}
            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {runtimeInfo.bun?.installed ? (
                  <CheckCircle2 size={24} className="text-green-400" />
                ) : (
                  <AlertTriangle size={24} className="text-yellow-400" />
                )}
                <div>
                  <div className="font-medium text-surface-200">{t('installWizard.step0.bun')}</div>
                  <div className="text-sm text-surface-400">
                    {runtimeInfo.bun?.version || t('installWizard.step0.bunOptional')}
                  </div>
                </div>
              </div>
              {!runtimeInfo.bun?.installed && (
                <a
                  href="https://bun.sh"
                  onClick={(e) => {
                    e.preventDefault();
                    window.electronAPI.openExternal('https://bun.sh');
                  }}
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  {t('installWizard.step0.installed')} <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Node.js */}
            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {runtimeInfo.node?.installed ? (
                  <CheckCircle2 size={24} className="text-green-400" />
                ) : (
                  <XCircle size={24} className="text-red-400" />
                )}
                <div>
                  <div className="font-medium text-surface-200">{t('installWizard.step0.nodejs')}</div>
                  <div className="text-sm text-surface-400">
                    {runtimeInfo.node?.version || t('overview.notInstalled')}
                  </div>
                </div>
              </div>
            </div>

            {/* Oh My OpenAgent */}
            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {ohMyOpenAgentInstalled ? (
                  <CheckCircle2 size={24} className="text-green-400" />
                ) : (
                  <XCircle size={24} className="text-red-400" />
                )}
                <div>
                  <div className="font-medium text-surface-200">{t('installWizard.step0.ohMyOpenAgent')}</div>
                  <div className="text-sm text-surface-400">
                    {ohMyOpenAgentInstalled
                      ? `v${ohMyOpenAgentVersion || '已安装'}`
                      : t('overview.notInstalled')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(1)}
              className="btn-primary flex items-center gap-2"
            >
              {t('installWizard.step0.nextStep')} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: 选择订阅 */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-surface-100">{t('installWizard.step1.title')}</h2>
          <p className="text-surface-400 text-sm">
            {t('installWizard.step1.subtitle')}
          </p>

          {/* 主要 Provider */}
          <div className="space-y-4">
            {PROVIDER_OPTIONS.map((provider) => (
              <div
                key={provider.id}
                className={`card border-2 transition-all duration-200 ${
                  selections[provider.id] !== 'no'
                    ? provider.activeColor
                    : provider.color
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{provider.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-surface-100">{provider.name}</h3>
                    <p className="text-sm text-surface-400 mt-0.5">{provider.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(provider.id, opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selections[provider.id] === opt.value
                              ? 'bg-primary-600 text-white'
                              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 附加 Provider */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-surface-400 mb-3">{t('installWizard.step1.additionalProviders')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ADDITIONAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleSelect(opt.id, selections[opt.id] === 'yes' ? 'no' : 'yes')
                  }
                  className={`card text-left transition-all duration-200 ${
                    selections[opt.id] === 'yes'
                      ? 'border-primary-500/50 bg-primary-500/5'
                      : ''
                  }`}
                >
                  <div className="font-medium text-surface-200 text-sm">{opt.name}</div>
                  <div className="text-xs text-surface-500 mt-1">{opt.description}</div>
                  <div className="mt-2">
                    <span
                      className={`badge ${
                        selections[opt.id] === 'yes' ? 'badge-success' : 'badge-info'
                      }`}
                    >
                      {selections[opt.id] === 'yes' ? t('installWizard.step1.enabled') : t('installWizard.step1.disabled')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 提示 */}
          {!hasAnySubscription && (
            <div className="card border-yellow-600/30 bg-yellow-600/5">
              <p className="text-sm text-yellow-400">
                {t('installWizard.step1.noSubscriptionWarning', {
                  code: <code className="bg-surface-800 px-1 rounded">opencode auth login</code>
                })}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(0)}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} /> {t('installWizard.step1.prevStep')}
            </button>
            <button
              onClick={handleInstall}
              className="btn-primary flex items-center gap-2"
            >
              {isInstalling ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {ohMyOpenAgentInstalled ? t('installWizard.step1.updating') : t('installWizard.step1.installing')}
                </>
              ) : (
                <>
                  {ohMyOpenAgentInstalled ? t('installWizard.step1.startUpdate') : t('installWizard.step1.startInstall')} <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 安装日志 */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-surface-100 flex items-center gap-2">
            <Terminal size={20} />
            {t('installWizard.step2.title')}
            {isInstalling && (
              <span className="badge-info animate-pulse">{t('installWizard.step2.installing')}</span>
            )}
          </h2>

          <div className="terminal-output min-h-[300px]">{installLog || t('installWizard.step2.waitingForInstallation')}</div>

          {!isInstalling && (
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setStep(1);
                  clearInstallLog();
                }}
                className="btn-secondary"
              >
                {t('installWizard.step2.reinstall')}
              </button>
              <button
                onClick={() => useAppStore.getState().setActiveTab('providers')}
                className="btn-primary flex items-center gap-2"
              >
                {t('installWizard.step2.goToProviderConfig')} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Need to import AlertTriangle
import { AlertTriangle } from 'lucide-react';

export default InstallWizard;

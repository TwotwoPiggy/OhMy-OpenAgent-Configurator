import React, { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { PROVIDERS } from '@/data/constants';
import { mergeProviderConfig } from '@/utils/configUtils';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';

const ProviderPage: React.FC = () => {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const { parsedOpencodeConfig } = useAppStore();

  // 合并默认 provider 配置和 opencode.json 中的配置
  const mergedProviders = useMemo(() => {
    return mergeProviderConfig(PROVIDERS, parsedOpencodeConfig);
  }, [parsedOpencodeConfig]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-100">{t('provider.title')}</h2>
        <p className="text-surface-400 text-sm mt-1">
          {t('provider.subtitle')}
        </p>
      </div>

      {/* 认证说明 */}
      <div className="card border-primary-600/30 bg-primary-600/5">
        <h3 className="font-semibold text-surface-200 mb-2">{t('provider.howToAuth')}</h3>
        <div className="space-y-2 text-sm text-surface-300">
          {(t('provider.authSteps', {
            returnObjects: true,
            code: <code className="bg-surface-800 px-2 py-0.5 rounded font-mono">opencode auth login</code>
          }) as string[]).map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        </div>
        <button
          onClick={() => handleCopy('opencode auth login', 'auth-cmd')}
          className="mt-3 btn-ghost text-sm flex items-center gap-2"
        >
          {copiedId === 'auth-cmd' ? (
            <><CheckCircle2 size={14} className="text-green-400" /> {t('provider.copied')}</>
          ) : (
            <><Copy size={14} /> {t('provider.copyCommand')}</>
          )}
        </button>
      </div>

      {/* Provider 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mergedProviders.map((provider) => (
          <div key={provider.id} className="card card-hover">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{provider.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-surface-100">{provider.name}</h3>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: provider.color }}
                  />
                </div>
                <p className="text-sm text-surface-400 mt-0.5">{provider.description}</p>

                <div className="mt-3">
                  <div className="text-xs text-surface-500 mb-1">{t('provider.authMethod')}</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-surface-900 px-2 py-1 rounded text-surface-300 flex-1 truncate">
                      {provider.authMethod}
                    </code>
                    <button
                      onClick={() => handleCopy(provider.authMethod, `auth-${provider.id}`)}
                      className="shrink-0 text-surface-500 hover:text-surface-300"
                    >
                      {copiedId === `auth-${provider.id}` ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-surface-500 mb-1">{t('provider.availableModels')}</div>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((model: string) => {
                      const isOpencodeModel = provider.opencodeModels?.includes(model);
                      return (
                        <span 
                          key={model} 
                          className={`badge-info text-xs ${isOpencodeModel ? 'bg-green-900/50 text-green-300 border border-green-700/50' : ''}`}
                        >
                          {model}{isOpencodeModel && t('provider.custom')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Antigravity 插件说明 */}
      <div className="card border-blue-600/30 bg-blue-600/5">
        <h3 className="font-semibold text-surface-200 mb-2">{t('provider.antigravity.title')}</h3>
        <p className="text-sm text-surface-300 mb-3">
          {t('provider.antigravity.description')}
        </p>
        <div className="bg-surface-950 rounded-lg p-3 font-mono text-sm text-surface-300">
          <pre>{`{
  "plugin": [
    "oh-my-openagent",
    "opencode-antigravity-auth@latest"
  ]
}`}</pre>
        </div>
        <button
          onClick={() =>
            handleCopy(
              `{\n  "plugin": [\n    "oh-my-openagent",\n    "opencode-antigravity-auth@latest"\n  ]\n}`,
              'antigravity'
            )
          }
          className="mt-2 btn-ghost text-sm flex items-center gap-2"
        >
          {copiedId === 'antigravity' ? (
            <><CheckCircle2 size={14} className="text-green-400" /> {t('provider.copied')}</>
          ) : (
            <><Copy size={14} /> {t('provider.antigravity.copyConfig')}</>
          )}
        </button>
      </div>

      {/* CC-Switch 推荐 */}
      <div className="card border-purple-600/30 bg-purple-600/5">
        <h3 className="font-semibold text-surface-200 mb-2">{t('provider.ccSwitch.title')}</h3>
        <p className="text-sm text-surface-300 mb-3">
          <Trans i18nKey="provider.ccSwitch.description" components={{
            ccSwitch: <span onClick={() => window.electronAPI.openExternal('https://github.com/farion1231/cc-switch')} className="text-primary-400 hover:underline cursor-pointer flex items-center gap-1 inline-flex">
              cc-switch <ExternalLink size={12} />
            </span>
          }} />
        </p>
      </div>
    </div>
  );
};

export default ProviderPage;

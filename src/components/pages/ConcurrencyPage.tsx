import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { PROVIDERS } from '@/data/constants';

const ConcurrencyPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, updateBackgroundTask } = useAppStore();
  const bg = config.background_task;

  const handleDefaultConcurrencyChange = (value: number) => {
    updateBackgroundTask({ defaultConcurrency: value });
  };

  const handleStaleTimeoutChange = (value: number) => {
    updateBackgroundTask({ staleTimeoutMs: value });
  };

  const handleProviderConcurrencyChange = (provider: string, value: number) => {
    updateBackgroundTask({
      providerConcurrency: { ...bg?.providerConcurrency, [provider]: value },
    });
  };

  const handleModelConcurrencyChange = (model: string, value: number) => {
    updateBackgroundTask({
      modelConcurrency: { ...bg?.modelConcurrency, [model]: value },
    });
  };

  const handleRemoveProviderConcurrency = (provider: string) => {
    const updated = { ...bg?.providerConcurrency };
    delete updated[provider];
    updateBackgroundTask({ providerConcurrency: updated });
  };

  const handleRemoveModelConcurrency = (model: string) => {
    const updated = { ...bg?.modelConcurrency };
    delete updated[model];
    updateBackgroundTask({ modelConcurrency: updated });
  };

  const [newProvider, setNewProvider] = React.useState('');
  const [newProviderValue, setNewProviderValue] = React.useState(5);
  const [newModel, setNewModel] = React.useState('');
  const [newModelValue, setNewModelValue] = React.useState(5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-100">{t('concurrency.title')}</h2>
        <p className="text-surface-400 text-sm mt-1">
          {t('concurrency.subtitle')}
        </p>
      </div>

      {/* 全局设置 */}
      <div className="card">
        <h3 className="font-semibold text-surface-200 mb-4">{t('concurrency.globalSettings')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">{t('concurrency.defaultMaxConcurrency')}</label>
            <input
              type="number"
              min="1"
              max="50"
              value={bg?.defaultConcurrency ?? 5}
              onChange={(e) => handleDefaultConcurrencyChange(parseInt(e.target.value) || 5)}
              className="input-field"
            />
            <p className="text-xs text-surface-500 mt-1">{t('concurrency.defaultConcurrencyDescription')}</p>
          </div>
          <div>
            <label className="label">{t('concurrency.staleTaskTimeout')}</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={bg?.staleTimeoutMs ?? 30000}
              onChange={(e) => handleStaleTimeoutChange(parseInt(e.target.value) || 30000)}
              className="input-field"
            />
            <p className="text-xs text-surface-500 mt-1">{t('concurrency.staleTimeoutDescription')}</p>
          </div>
        </div>
      </div>

      {/* Provider 并发 */}
      <div className="card">
        <h3 className="font-semibold text-surface-200 mb-4">{t('concurrency.providerConcurrencyLimit')}</h3>
        <p className="text-xs text-surface-500 mb-4">
          {t('concurrency.priority')}
        </p>

        <div className="space-y-3">
          {Object.entries(bg?.providerConcurrency || {}).map(([provider, value]) => (
            <div key={provider} className="flex items-center gap-3">
              <span className="text-sm text-surface-300 w-40 font-mono">{provider}</span>
              <input
                type="number"
                min="1"
                max="50"
                value={value}
                onChange={(e) =>
                  handleProviderConcurrencyChange(provider, parseInt(e.target.value) || 1)
                }
                className="input-field w-24"
              />
              <button
                onClick={() => handleRemoveProviderConcurrency(provider)}
                className="text-surface-500 hover:text-red-400 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-surface-700">
          <select
            value={newProvider}
            onChange={(e) => setNewProvider(e.target.value)}
            className="select-field w-48"
          >
            <option value="">{t('concurrency.selectProvider')}</option>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="50"
            value={newProviderValue}
            onChange={(e) => setNewProviderValue(parseInt(e.target.value) || 5)}
            className="input-field w-24"
          />
          <button
            onClick={() => {
              if (newProvider) {
                handleProviderConcurrencyChange(newProvider, newProviderValue);
                setNewProvider('');
              }
            }}
            className="btn-primary text-sm"
          >
            {t('concurrency.add')}
          </button>
        </div>
      </div>

      {/* Model 并发 */}
      <div className="card">
        <h3 className="font-semibold text-surface-200 mb-4">{t('concurrency.modelConcurrencyLimit')}</h3>

        <div className="space-y-3">
          {Object.entries(bg?.modelConcurrency || {}).map(([model, value]) => (
            <div key={model} className="flex items-center gap-3">
              <span className="text-sm text-surface-300 flex-1 font-mono">{model}</span>
              <input
                type="number"
                min="1"
                max="100"
                value={value}
                onChange={(e) =>
                  handleModelConcurrencyChange(model, parseInt(e.target.value) || 1)
                }
                className="input-field w-24"
              />
              <button
                onClick={() => handleRemoveModelConcurrency(model)}
                className="text-surface-500 hover:text-red-400 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-surface-700">
          <input
            type="text"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            placeholder={t('concurrency.modelPlaceholder')}
            className="input-field flex-1"
          />
          <input
            type="number"
            min="1"
            max="100"
            value={newModelValue}
            onChange={(e) => setNewModelValue(parseInt(e.target.value) || 5)}
            className="input-field w-24"
          />
          <button
            onClick={() => {
              if (newModel) {
                handleModelConcurrencyChange(newModel, newModelValue);
                setNewModel('');
              }
            }}
            className="btn-primary text-sm"
          >
            {t('concurrency.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConcurrencyPage;

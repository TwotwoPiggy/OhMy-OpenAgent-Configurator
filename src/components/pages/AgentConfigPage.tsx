import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { AGENTS, MODEL_VARIANTS, REASONING_EFFORTS, PROVIDERS } from '@/data/constants';
import type { AgentConfig, ModelVariant, ReasoningEffort } from '@/types';
import { getAgentEffectiveConfig, getAgentUserConfig, mergeProviderConfig } from '@/utils/configUtils';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const AgentConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, updateAgent, removeAgent, toggleDisabledAgent, parsedOpencodeConfig } = useAppStore();
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [showDisabled, setShowDisabled] = useState(false);

  // 合并默认 provider 配置和 opencode.json 中的配置
  const mergedProviders = useMemo(() => {
    return mergeProviderConfig(PROVIDERS, parsedOpencodeConfig);
  }, [parsedOpencodeConfig]);

  // 生成所有模型列表，并标记哪些自定义模型
  const allModels = useMemo(() => {
    return mergedProviders.flatMap((p) => {
      return p.models.map((m: string) => {
        const isLocalModel = p.opencodeModels?.includes(m);
        return {
          value: `${p.id}/${m}`,
          label: `${p.id}/${m}`,
          isLocal: isLocalModel || false
        };
      });
    });
  }, [mergedProviders]);

  const handleModelChange = (agentId: string, model: string) => {
    if (model === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.agents?.[agentId];
      if (currentConfig) {
        const { model: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateAgent(agentId, rest);
        } else {
          removeAgent(agentId);
        }
      }
    } else {
      updateAgent(agentId, { model });
    }
  };

  const handleVariantChange = (agentId: string, variant: string) => {
    if (variant === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.agents?.[agentId];
      if (currentConfig) {
        const { variant: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateAgent(agentId, rest);
        } else {
          removeAgent(agentId);
        }
      }
    } else {
      updateAgent(agentId, { variant: variant as ModelVariant });
    }
  };

  const handleTemperatureChange = (agentId: string, temp: number) => {
    // 温度始终需要设置，因为滑块有默认值
    updateAgent(agentId, { temperature: temp });
  };

  const handleMaxTokensChange = (agentId: string, tokens: number) => {
    if (tokens === 0) {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.agents?.[agentId];
      if (currentConfig) {
        const { maxTokens: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateAgent(agentId, rest);
        } else {
          removeAgent(agentId);
        }
      }
    } else {
      updateAgent(agentId, { maxTokens: tokens });
    }
  };

  const handleReasoningEffortChange = (agentId: string, effort: string) => {
    if (effort === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.agents?.[agentId];
      if (currentConfig) {
        const { reasoningEffort: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateAgent(agentId, rest);
        } else {
          removeAgent(agentId);
        }
      }
    } else {
      updateAgent(agentId, { reasoningEffort: effort as ReasoningEffort });
    }
  };

  const handlePromptAppendChange = (agentId: string, prompt: string) => {
    if (prompt === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.agents?.[agentId];
      if (currentConfig) {
        const { prompt_append: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateAgent(agentId, rest);
        } else {
          removeAgent(agentId);
        }
      }
    } else {
      updateAgent(agentId, { prompt_append: prompt });
    }
  };

  const handleResetAgent = (agentId: string) => {
    removeAgent(agentId);
  };

  const isDisabled = (agentId: string) =>
    config.disabled_agents?.includes(agentId) || false;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('agentConfig.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">
            {t('agentConfig.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-surface-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showDisabled}
              onChange={(e) => setShowDisabled(e.target.checked)}
              className="rounded"
            />
            {t('agentConfig.showDisabled')}
          </label>
        </div>
      </div>

      {/* Agent 列表 */}
      <div className="space-y-3">
        {AGENTS.map((agent) => {
          const agentUserConfig = getAgentUserConfig(agent.id, config);
          const agentConfig = getAgentEffectiveConfig(agent.id, config);
          const isExpanded = expandedAgent === agent.id;
          const disabled = isDisabled(agent.id);
          // 调试：打印 Agent 配置
          if (agent.id === 'multimodal-looker') {
            console.log('Multimodal Looker user config:', agentUserConfig);
            console.log('Multimodal Looker effective config:', agentConfig);
            console.log('All models:', allModels);
          }

          if (disabled && !showDisabled) return null;

          return (
            <div
              key={agent.id}
              className={`card transition-all duration-200 ${
                disabled ? 'opacity-50' : ''
              } ${isExpanded ? 'ring-1 ring-primary-500/30' : ''}`}
            >
              {/* Agent Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-100">{agent.name}</h3>
                      {agentConfig?.model && (
                        <span className={`badge-info text-xs ${agentConfig.model === agent.recommendedModel ? 'bg-surface-700 text-surface-300' : ''}`}>
                          {agentConfig.model}{agentConfig.model === agent.recommendedModel && ` (${t('agentConfig.default')})`}
                        </span>
                      )}
                      {agentConfig?.variant && (
                        <span className="badge-warning text-xs">{agentConfig.variant}</span>
                      )}
                      {disabled && <span className="badge-error text-xs">{t('agentConfig.disabled')}</span>}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDisabledAgent(agent.id);
                    }}
                    className="text-surface-500 hover:text-surface-300"
                    title={disabled ? t('agentConfig.enable') : t('agentConfig.disable')}
                  >
                    {disabled ? <ToggleLeft size={20} /> : <ToggleRight size={20} className="text-green-400" />}
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-surface-400" />
                  ) : (
                    <ChevronDown size={18} className="text-surface-400" />
                  )}
                </div>
              </div>

              {/* Expanded Config */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-surface-700 space-y-4 animate-slide-up">
                  {/* 推荐信息 */}
                  <div className="bg-surface-900/50 rounded-lg p-3 text-sm">
                    <div className="text-surface-500 text-xs mb-1">{t('agentConfig.recommendedModel')}</div>
                    <div className="text-surface-200 font-mono">{agent.recommendedModel}</div>
                    {agent.fallbackChain.length > 0 && (
                      <div className="mt-1">
                        <div className="text-surface-500 text-xs mb-0.5">{t('agentConfig.fallbackChain')}</div>
                        <div className="text-surface-400 font-mono text-xs">
                          {agent.fallbackChain.join(' → ')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 模型选择 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">{t('agentConfig.model')}</label>
                      <select
                        value={agentUserConfig?.model || ''}
                        onChange={(e) => handleModelChange(agent.id, e.target.value)}
                        className="select-field"
                      >
                        <option value="">{t('agentConfig.useDefault')} ({agent.recommendedModel})</option>
                        {/* 添加用户配置的自定义模型（如果不在预定义列表中） */}
                        {/* Add user-configured custom model if not in predefined list */}
                        {agentUserConfig?.model && !allModels.some(m => m.value === agentUserConfig.model) && (
                          <option key={agentUserConfig.model} value={agentUserConfig.model}>
                            {agentUserConfig.model} {t('agentConfig.custom')}
                          </option>
                        )}
                        {allModels.map((model) => (
                          <option key={model.value} value={model.value}>
                            {model.label}{model.isLocal && t('agentConfig.custom')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">{t('agentConfig.modelVariant')}</label>
                      <select
                        value={agentUserConfig?.variant || ''}
                        onChange={(e) =>
                          handleVariantChange(agent.id, e.target.value)
                        }
                        className="select-field"
                      >
                        <option value="">{t('agentConfig.useDefault')}</option>
                        {MODEL_VARIANTS.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 参数调节 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        {t('agentConfig.temperature')}: {agentUserConfig?.temperature ?? t('agentConfig.default')}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={agentUserConfig?.temperature ?? 0.7}
                        onChange={(e) =>
                          handleTemperatureChange(agent.id, parseFloat(e.target.value))
                        }
                        className="w-full accent-primary-500"
                      />
                      <div className="flex justify-between text-xs text-surface-500">
                        <span>{t('agentConfig.precise')}</span>
                        <span>{t('agentConfig.creative')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="label">{t('agentConfig.maxTokens')}</label>
                      <input
                        type="number"
                        value={agentUserConfig?.maxTokens || ''}
                        onChange={(e) =>
                          handleMaxTokensChange(agent.id, parseInt(e.target.value) || 0)
                        }
                        placeholder={t('agentConfig.default')}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label">{t('agentConfig.reasoningEffort')}</label>
                      <select
                        value={agentUserConfig?.reasoningEffort || ''}
                        onChange={(e) =>
                          handleReasoningEffortChange(
                            agent.id,
                            e.target.value
                          )
                        }
                        className="select-field"
                      >
                        <option value="">{t('agentConfig.useDefault')}</option>
                        {REASONING_EFFORTS.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prompt 追加 */}
                  <div>
                    <label className="label">{t('agentConfig.promptAppend')}</label>
                    <textarea
                      value={agentUserConfig?.prompt_append || ''}
                      onChange={(e) => handlePromptAppendChange(agent.id, e.target.value)}
                      placeholder={t('agentConfig.promptAppendPlaceholder')}
                      rows={3}
                      className="input-field resize-y"
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-2">
                    {agentUserConfig && Object.keys(agentUserConfig).length > 0 && (
                      <button
                        onClick={() => handleResetAgent(agent.id)}
                        className="btn-ghost text-sm flex items-center gap-1 text-red-400 hover:text-red-300"
                      >
                        <RotateCcw size={14} /> {t('agentConfig.resetToDefault')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentConfigPage;

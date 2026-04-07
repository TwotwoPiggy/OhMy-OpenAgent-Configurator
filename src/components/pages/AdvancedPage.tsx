import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';

const AdvancedPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, updateExperimental, updateTmux, updateConfig } = useAppStore();
  const experimental = config.experimental || {};
  const tmux = config.tmux || {};

  const toggleExperimental = (key: string) => {
    updateExperimental({ [key]: !experimental[key as keyof typeof experimental] });
  };

  const toggleTmux = (key: string) => {
    updateTmux({ [key]: !tmux[key as keyof typeof tmux] });
  };

  const experimentalOptions = [
    { key: 'aggressive_truncation', label: t('advanced.aggressiveTruncation'), desc: t('advanced.aggressiveTruncationDesc') },
    { key: 'auto_resume', label: t('advanced.autoResume'), desc: t('advanced.autoResumeDesc') },
    { key: 'preemptive_compaction', label: t('advanced.preemptiveCompaction'), desc: t('advanced.preemptiveCompactionDesc') },
    { key: 'truncate_all_tool_outputs', label: t('advanced.truncateAllToolOutputs'), desc: t('advanced.truncateAllToolOutputsDesc') },
    { key: 'task_system', label: t('advanced.taskSystem'), desc: t('advanced.taskSystemDesc') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-100">{t('advanced.title')}</h2>
        <p className="text-surface-400 text-sm mt-1">
          {t('advanced.subtitle')}
        </p>
      </div>

      {/* 实验性功能 */}
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          🧪 {t('advanced.experimentalFeatures')}
          <span className="badge-warning text-xs">{t('advanced.experimental')}</span>
        </h3>
        <p className="text-sm text-surface-400 mb-4">
          {t('advanced.experimentalDescription')}
        </p>
        <div className="space-y-3">
          {experimentalOptions.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-surface-200 text-sm">{opt.label}</div>
                <div className="text-xs text-surface-500">{opt.desc}</div>
              </div>
              <button
                onClick={() => toggleExperimental(opt.key)}
                className={
                  experimental[opt.key as keyof typeof experimental]
                    ? 'toggle-on'
                    : 'toggle-off'
                }
              >
                <span
                  className={
                    experimental[opt.key as keyof typeof experimental]
                      ? 'toggle-dot-on'
                      : 'toggle-dot-off'
                  }
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tmux 集成 */}
      <div className="card">
        <h3 className="section-title">🖥️ {t('advanced.tmuxIntegration')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-surface-200 text-sm">{t('advanced.enableTmux')}</div>
              <div className="text-xs text-surface-500">{t('advanced.enableTmuxDesc')}</div>
            </div>
            <button
              onClick={() => toggleTmux('enabled')}
              className={tmux.enabled ? 'toggle-on' : 'toggle-off'}
            >
              <span className={tmux.enabled ? 'toggle-dot-on' : 'toggle-dot-off'} />
            </button>
          </div>

          {tmux.enabled && (
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
              <div>
                <label className="label">{t('advanced.layout')}</label>
                <input
                  type="text"
                  value={tmux.layout || ''}
                  onChange={(e) => updateTmux({ layout: e.target.value })}
                  placeholder={t('advanced.defaultLayout')}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">{t('advanced.mainPaneSize')}</label>
                <input
                  type="text"
                  value={tmux.main_pane_size || ''}
                  onChange={(e) => updateTmux({ main_pane_size: e.target.value })}
                  placeholder={t('advanced.percentExample')}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Git Master */}
      <div className="card">
        <h3 className="section-title">🔧 {t('advanced.gitMaster')}</h3>
        <div className="space-y-4">
          <div>
            <label className="label">{t('advanced.commitFooter')}</label>
            <input
              type="text"
              value={config['git-master']?.commit_footer || ''}
              onChange={(e) =>
                updateConfig({
                  'git-master': {
                    ...config['git-master'],
                    commit_footer: e.target.value,
                  },
                })
              }
              placeholder={t('advanced.commitFooterPlaceholder')}
              className="input-field"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-surface-200 text-sm">{t('advanced.coAuthoredBy')}</div>
              <div className="text-xs text-surface-500">{t('advanced.coAuthoredByDesc')}</div>
            </div>
            <button
              onClick={() =>
                updateConfig({
                  'git-master': {
                    ...config['git-master'],
                    include_co_authored_by: !config['git-master']?.include_co_authored_by,
                  },
                })
              }
              className={
                config['git-master']?.include_co_authored_by ? 'toggle-on' : 'toggle-off'
              }
            >
              <span
                className={
                  config['git-master']?.include_co_authored_by
                    ? 'toggle-dot-on'
                    : 'toggle-dot-off'
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* Comment Checker */}
      <div className="card">
        <h3 className="section-title">💬 {t('advanced.commentChecker')}</h3>
        <div>
          <label className="label">{t('advanced.customPrompt')}</label>
          <textarea
            value={config['comment-checker']?.custom_prompt || ''}
            onChange={(e) =>
              updateConfig({
                'comment-checker': {
                  custom_prompt: e.target.value,
                },
              })
            }
            placeholder={t('advanced.customPromptPlaceholder')}
            rows={3}
            className="input-field resize-y"
          />
          <p className="text-xs text-surface-500 mt-1">
            {t('advanced.commentsPlaceholder')}
          </p>
        </div>
      </div>

      {/* 禁用列表 */}
      <div className="card">
        <h3 className="section-title">🚫 {t('advanced.disabledListManagement')}</h3>
        <p className="text-sm text-surface-400 mb-4">
          {t('advanced.disabledListDescription')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {
            [
              { label: t('advanced.disabledAgents'), items: config.disabled_agents || [] },
              { label: t('advanced.disabledCategories'), items: config.disabled_categories || [] },
              { label: t('advanced.disabledSkills'), items: config.disabled_skills || [] },
              { label: t('advanced.disabledHooks'), items: config.disabled_hooks || [] },
              { label: t('advanced.disabledMcps'), items: config.disabled_mcps || [] },
              { label: t('advanced.disabledCommands'), items: config.disabled_commands || [] },
              { label: t('advanced.disabledTools'), items: config.disabled_tools || [] },
            ].map((group) => (
              <div key={group.label} className="bg-surface-900 rounded-lg p-3">
                <div className="text-xs text-surface-500 mb-1">{group.label}</div>
                {group.items.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item) => (
                      <span key={item} className="badge-error text-xs">{item}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-surface-600">{t('advanced.none')}</div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AdvancedPage;

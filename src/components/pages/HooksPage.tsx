import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { BUILT_IN_HOOKS } from '@/data/constants';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';

const HooksPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, toggleDisabledHook } = useAppStore();
  const [search, setSearch] = useState('');

  const disabledHooks = new Set(config.disabled_hooks || []);

  const filteredHooks = BUILT_IN_HOOKS.filter((hook) =>
    hook.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = BUILT_IN_HOOKS.length - disabledHooks.size;
  const disabledCount = disabledHooks.size;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-100">{t('hooks.title')}</h2>
        <p className="text-surface-400 text-sm mt-1">
          {t('hooks.subtitle')}
        </p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-surface-100">{BUILT_IN_HOOKS.length}</div>
          <div className="text-xs text-surface-400 mt-1">{t('hooks.total')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
          <div className="text-xs text-surface-400 mt-1">{t('hooks.enabled')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">{disabledCount}</div>
          <div className="text-xs text-surface-400 mt-1">{t('hooks.disabled')}</div>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('hooks.searchPlaceholder')}
          className="input-field pl-9"
        />
      </div>

      {/* Hook 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredHooks.map((hook) => {
          const isDisabled = disabledHooks.has(hook);
          return (
            <div
              key={hook}
              className={`card flex items-center justify-between py-3 px-4 ${
                isDisabled ? 'opacity-50' : ''
              }`}
            >
              <code className="text-sm text-surface-300 font-mono truncate">{hook}</code>
              <button
                onClick={() => toggleDisabledHook(hook)}
                className="shrink-0 ml-2"
                title={isDisabled ? t('hooks.enable') : t('hooks.disable')}
              >
                {isDisabled ? (
                  <ToggleLeft size={22} className="text-surface-500" />
                ) : (
                  <ToggleRight size={22} className="text-green-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filteredHooks.length === 0 && (
        <div className="text-center py-8 text-surface-500">
          {t('hooks.noResults')}
        </div>
      )}
    </div>
  );
};

export default HooksPage;

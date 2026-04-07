import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORIES, MODEL_VARIANTS, PROVIDERS } from '@/data/constants';
import type { CategoryConfig, ModelVariant } from '@/types';
import { getCategoryEffectiveConfig, getCategoryUserConfig } from '@/utils/configUtils';
import { ChevronDown, ChevronUp, RotateCcw, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

const CategoryConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, updateCategory, removeCategory, toggleDisabledCategory } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const allModels = PROVIDERS.flatMap((p) => p.models.map((m) => `${p.id}/${m}`));

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const id = newCategoryName.trim().replace(/\s+/g, '-').toLowerCase();
      updateCategory(id, { description: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const handleModelChange = (categoryId: string, model: string) => {
    if (model === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.categories?.[categoryId];
      if (currentConfig) {
        const { model: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateCategory(categoryId, rest);
        } else {
          removeCategory(categoryId);
        }
      }
    } else {
      updateCategory(categoryId, { model });
    }
  };

  const handleVariantChange = (categoryId: string, variant: string) => {
    if (variant === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.categories?.[categoryId];
      if (currentConfig) {
        const { variant: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateCategory(categoryId, rest);
        } else {
          removeCategory(categoryId);
        }
      }
    } else {
      updateCategory(categoryId, { variant: variant as ModelVariant });
    }
  };

  const handleDescriptionChange = (categoryId: string, description: string) => {
    if (description === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.categories?.[categoryId];
      if (currentConfig) {
        const { description: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateCategory(categoryId, rest);
        } else {
          removeCategory(categoryId);
        }
      }
    } else {
      updateCategory(categoryId, { description });
    }
  };

  const handlePromptAppendChange = (categoryId: string, prompt: string) => {
    if (prompt === '') {
      // 使用默认值，从配置中移除该属性
      const currentConfig = config.categories?.[categoryId];
      if (currentConfig) {
        const { prompt_append: _, ...rest } = currentConfig;
        if (Object.keys(rest).length > 0) {
          updateCategory(categoryId, rest);
        } else {
          removeCategory(categoryId);
        }
      }
    } else {
      updateCategory(categoryId, { prompt_append: prompt });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('categoryConfig.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">
            {t('categoryConfig.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowNewCategory(!showNewCategory)}
          className="btn-primary text-sm flex items-center gap-1"
        >
          <Plus size={14} /> {t('categoryConfig.newCategory')}
        </button>
      </div>

      {/* 新建分类表单 */}
      {showNewCategory && (
        <div className="card border-primary-500/30 animate-slide-up">
          <h3 className="font-medium text-surface-200 mb-3">{t('categoryConfig.newCustomCategory')}</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categoryConfig.categoryNamePlaceholder')}
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button onClick={handleAddCategory} className="btn-primary">
              {t('categoryConfig.add')}
            </button>
            <button
              onClick={() => setShowNewCategory(false)}
              className="btn-secondary"
            >
              {t('categoryConfig.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const catUserConfig = getCategoryUserConfig(cat.id, config);
          const catConfig = getCategoryEffectiveConfig(cat.id, config);
          const isExpanded = expanded === cat.id;
          const disabled = config.disabled_categories?.includes(cat.id);

          return (
            <div key={cat.id} className={`card ${disabled ? 'opacity-50' : ''} ${isExpanded ? 'ring-1 ring-primary-500/30' : ''}`}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : cat.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-100">{cat.name}</h3>
                      {catConfig?.model && <span className="badge-info text-xs">{catConfig.model}</span>}
                      {disabled && <span className="badge-error text-xs">{t('categoryConfig.disabled')}</span>}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{t(`categoryConfig.categories.${cat.id}`)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleDisabledCategory(cat.id); }}
                    className="text-surface-500 hover:text-surface-300"
                  >
                    {disabled ? <ToggleLeft size={20} /> : <ToggleRight size={20} className="text-green-400" />}
                  </button>
                  {isExpanded ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-surface-700 space-y-4 animate-slide-up">
                  <div className="bg-surface-900/50 rounded-lg p-3 text-sm">
                    <div className="text-surface-500 text-xs mb-1">{t('categoryConfig.defaultModel')}</div>
                    <div className="text-surface-200 font-mono">{cat.defaultModel}</div>
                    {cat.defaultVariant && (
                      <span className="badge-warning text-xs ml-2">{cat.defaultVariant}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">{t('categoryConfig.model')}</label>
                      <select
                        value={catUserConfig?.model || ''}
                        onChange={(e) => handleModelChange(cat.id, e.target.value)}
                        className="select-field"
                      >
                        <option value="">{t('categoryConfig.useDefault')} ({cat.defaultModel})</option>
                        {/* 添加用户配置的自定义模型（如果不在预定义列表中） */}
                        {/* Add user-configured custom model if not in predefined list */}
                        {catUserConfig?.model && !allModels.includes(catUserConfig.model) && (
                          <option key={catUserConfig.model} value={catUserConfig.model}>
                            {catUserConfig.model} {t('categoryConfig.custom')}
                          </option>
                        )}
                        {allModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('categoryConfig.variant')}</label>
                      <select
                        value={catUserConfig?.variant || ''}
                        onChange={(e) => handleVariantChange(cat.id, e.target.value)}
                        className="select-field"
                      >
                        <option value="">{t('categoryConfig.useDefault')} {cat.defaultVariant ? `(${cat.defaultVariant})` : ''}</option>
                        {MODEL_VARIANTS.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">{t('categoryConfig.description')}</label>
                    <input
                      type="text"
                      value={catUserConfig?.description || ''}
                      onChange={(e) => handleDescriptionChange(cat.id, e.target.value)}
                      placeholder={t('categoryConfig.descriptionPlaceholder')}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">{t('categoryConfig.promptAppend')}</label>
                    <textarea
                      value={catUserConfig?.prompt_append || ''}
                      onChange={(e) => handlePromptAppendChange(cat.id, e.target.value)}
                      placeholder={t('categoryConfig.promptAppendPlaceholder')}
                      rows={2}
                      className="input-field resize-y"
                    />
                  </div>

                  {catUserConfig && Object.keys(catUserConfig).length > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="btn-ghost text-sm flex items-center gap-1 text-red-400"
                      >
                        <RotateCcw size={14} /> {t('categoryConfig.reset')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryConfigPage;

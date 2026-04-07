import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { BUILT_IN_SKILLS } from '@/data/constants';
import type { SkillExtension } from '@/types';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Package,
} from 'lucide-react';

const SkillsPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, toggleDisabledSkill, installedSkills, addSkill, removeSkill, toggleSkill } = useAppStore();
  const [search, setSearch] = useState('');
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    instructions: '',
    source: 'local' as 'local' | 'remote',
    sourceUrl: '',
  });

  const disabledSkills = new Set(config.disabled_skills || []);
  const filteredBuiltIn = BUILT_IN_SKILLS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const handleInstallSkill = () => {
    if (!newSkill.name.trim()) return;
    const skill: SkillExtension = {
      id: newSkill.name.trim().replace(/\s+/g, '-').toLowerCase(),
      name: newSkill.name.trim(),
      description: newSkill.description,
      version: '1.0.0',
      author: 'User',
      source: newSkill.source,
      sourceUrl: newSkill.sourceUrl || undefined,
      instructions: newSkill.instructions,
      installed: true,
      enabled: true,
      tags: ['custom'],
    };
    addSkill(skill);
    setNewSkill({ name: '', description: '', instructions: '', source: 'local', sourceUrl: '' });
    setShowInstallForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('skills.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">
            {t('skills.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallForm(!showInstallForm)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Plus size={14} /> {t('skills.installSkill')}
          </button>
        </div>
      </div>

      {/* 安装表单 */}
      {showInstallForm && (
        <div className="card border-primary-500/30 animate-slide-up">
          <h3 className="font-medium text-surface-200 mb-4">{t('skills.installNewSkill')}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('skills.name')}</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="my-custom-skill"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">{t('skills.source')}</label>
                <select
                  value={newSkill.source}
                  onChange={(e) => setNewSkill({ ...newSkill, source: e.target.value as 'local' | 'remote' })}
                  className="select-field"
                >
                  <option value="local">{t('skills.local')}</option>
                  <option value="remote">{t('skills.remote')}</option>
                </select>
              </div>
            </div>
            {newSkill.source === 'remote' && (
              <div>
                <label className="label">{t('skills.sourceUrl')}</label>
                <input
                  type="text"
                  value={newSkill.sourceUrl}
                  onChange={(e) => setNewSkill({ ...newSkill, sourceUrl: e.target.value })}
                  placeholder="https://github.com/user/skill"
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="label">{t('skills.description')}</label>
              <input
                type="text"
                value={newSkill.description}
                onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                placeholder={t('skills.descriptionPlaceholder')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">{t('skills.instructions')}</label>
              <textarea
                value={newSkill.instructions}
                onChange={(e) => setNewSkill({ ...newSkill, instructions: e.target.value })}
                placeholder={t('skills.instructionsPlaceholder')}
                rows={4}
                className="input-field resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowInstallForm(false)} className="btn-secondary">{t('skills.cancel')}</button>
              <button onClick={handleInstallSkill} className="btn-primary">{t('skills.install')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 内置 Skills */}
      <div>
        <h3 className="section-title">{t('skills.builtInSkills')}</h3>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('skills.searchPlaceholder')}
            className="input-field pl-9"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBuiltIn.map((skill) => {
            const isDisabled = disabledSkills.has(skill);
            return (
              <div key={skill} className={`card flex items-center justify-between ${isDisabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary-400" />
                  <code className="text-sm text-surface-300">{skill}</code>
                </div>
                <button onClick={() => toggleDisabledSkill(skill)} title={isDisabled ? t('skills.enable') : t('skills.disable')}>
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
      </div>

      {/* 自定义 Skills */}
      {installedSkills.length > 0 && (
        <div>
          <h3 className="section-title">{t('skills.customSkills')}</h3>
          <div className="space-y-3">
            {installedSkills.map((skill) => (
              <div key={skill.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-surface-200">{skill.name}</h4>
                      <span className={`badge ${skill.source === 'remote' ? 'badge-info' : 'badge-success'}`}>
                        {skill.source === 'remote' ? t('skills.remote') : t('skills.local')}
                      </span>
                      <span className="text-xs text-surface-500">v{skill.version}</span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{skill.description}</p>
                    {skill.sourceUrl && (
                      <a
                        href={skill.sourceUrl}
                        onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal(skill.sourceUrl!); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink size={12} /> {skill.sourceUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSkill(skill.id)} title={skill.enabled ? t('skills.disable') : t('skills.enable')}>
                      {skill.enabled ? (
                        <ToggleRight size={22} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={22} className="text-surface-500" />
                      )}
                    </button>
                    <button onClick={() => removeSkill(skill.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 扩展接口说明 */}
      <div className="card border-dashed border-surface-600">
        <h3 className="font-medium text-surface-300 mb-2">📦 {t('skills.extensionInterface')}</h3>
        <p className="text-sm text-surface-400">
          {t('skills.currentVersionSupport')}
        </p>
        <ul className="text-sm text-surface-400 mt-2 space-y-1 list-disc list-inside">
          <li>{t('skills.futureSupport1')}</li>
          <li>{t('skills.futureSupport2')}</li>
          <li>{t('skills.futureSupport3')}</li>
          <li>{t('skills.futureSupport4')}</li>
          <li>{t('skills.futureSupport5')}</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsPage;

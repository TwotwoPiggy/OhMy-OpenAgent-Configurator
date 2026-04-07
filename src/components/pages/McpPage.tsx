import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { BUILT_IN_MCPS } from '@/data/constants';
import type { McpExtension } from '@/types';
import {
  Search,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Plug,
} from 'lucide-react';

const McpPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, toggleDisabledMcp, installedMcps, addMcp, removeMcp, toggleMcp } = useAppStore();
  const [search, setSearch] = useState('');
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [newMcp, setNewMcp] = useState({
    name: '',
    description: '',
    source: 'local' as 'local' | 'remote',
    sourceUrl: '',
  });

  const disabledMcps = new Set(config.disabled_mcps || []);
  const filteredBuiltIn = BUILT_IN_MCPS.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const handleInstallMcp = () => {
    if (!newMcp.name.trim()) return;
    const mcp: McpExtension = {
      id: newMcp.name.trim().replace(/\s+/g, '-').toLowerCase(),
      name: newMcp.name.trim(),
      description: newMcp.description,
      version: '1.0.0',
      author: 'User',
      source: newMcp.source,
      sourceUrl: newMcp.sourceUrl || undefined,
      config: {},
      installed: true,
      enabled: true,
      tags: ['custom'],
    };
    addMcp(mcp);
    setNewMcp({ name: '', description: '', source: 'local', sourceUrl: '' });
    setShowInstallForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('mcp.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">
            {t('mcp.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowInstallForm(!showInstallForm)}
          className="btn-primary text-sm flex items-center gap-1"
        >
          <Plus size={14} /> {t('mcp.addMcp')}
        </button>
      </div>

      {/* 安装表单 */}
      {showInstallForm && (
        <div className="card border-primary-500/30 animate-slide-up">
          <h3 className="font-medium text-surface-200 mb-4">{t('mcp.addNewMcp')}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('mcp.name')}</label>
                <input
                  type="text"
                  value={newMcp.name}
                  onChange={(e) => setNewMcp({ ...newMcp, name: e.target.value })}
                  placeholder="my-mcp-service"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">{t('mcp.source')}</label>
                <select
                  value={newMcp.source}
                  onChange={(e) => setNewMcp({ ...newMcp, source: e.target.value as 'local' | 'remote' })}
                  className="select-field"
                >
                  <option value="local">{t('mcp.local')}</option>
                  <option value="remote">{t('mcp.remote')}</option>
                </select>
              </div>
            </div>
            {newMcp.source === 'remote' && (
              <div>
                <label className="label">{t('mcp.sourceUrl')}</label>
                <input
                  type="text"
                  value={newMcp.sourceUrl}
                  onChange={(e) => setNewMcp({ ...newMcp, sourceUrl: e.target.value })}
                  placeholder="https://github.com/user/mcp"
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="label">{t('mcp.description')}</label>
              <input
                type="text"
                value={newMcp.description}
                onChange={(e) => setNewMcp({ ...newMcp, description: e.target.value })}
                placeholder={t('mcp.descriptionPlaceholder')}
                className="input-field"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowInstallForm(false)} className="btn-secondary">{t('mcp.cancel')}</button>
              <button onClick={handleInstallMcp} className="btn-primary">{t('mcp.add')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 内置 MCPs */}
      <div>
        <h3 className="section-title">{t('mcp.builtInMcps')}</h3>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('mcp.searchPlaceholder')}
            className="input-field pl-9"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredBuiltIn.map((mcp) => {
            const isDisabled = disabledMcps.has(mcp);
            const descriptions: Record<string, string> = {
              websearch: t('mcp.websearchDescription'),
              context7: t('mcp.context7Description'),
              grep_app: t('mcp.grepAppDescription'),
            };
            return (
              <div key={mcp} className={`card ${isDisabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Plug size={16} className="text-cyan-400" />
                    <code className="text-sm text-surface-300">{mcp}</code>
                  </div>
                  <button onClick={() => toggleDisabledMcp(mcp)} title={isDisabled ? t('mcp.enable') : t('mcp.disable')}>
                    {isDisabled ? (
                      <ToggleLeft size={22} className="text-surface-500" />
                    ) : (
                      <ToggleRight size={22} className="text-green-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-surface-500">{descriptions[mcp] || ''}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 自定义 MCPs */}
      {installedMcps.length > 0 && (
        <div>
          <h3 className="section-title">{t('mcp.customMcps')}</h3>
          <div className="space-y-3">
            {installedMcps.map((mcp) => (
              <div key={mcp.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-surface-200">{mcp.name}</h4>
                      <span className={`badge ${mcp.source === 'remote' ? 'badge-info' : 'badge-success'}`}>
                        {mcp.source === 'remote' ? t('mcp.remote') : t('mcp.local')}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{mcp.description}</p>
                    {mcp.sourceUrl && (
                      <a
                        href={mcp.sourceUrl}
                        onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal(mcp.sourceUrl!); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink size={12} /> {mcp.sourceUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleMcp(mcp.id)}>
                      {mcp.enabled ? (
                        <ToggleRight size={22} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={22} className="text-surface-500" />
                      )}
                    </button>
                    <button onClick={() => removeMcp(mcp.id)} className="text-red-400 hover:text-red-300">
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
        <h3 className="font-medium text-surface-300 mb-2">🔌 {t('mcp.extensionInterface')}</h3>
        <p className="text-sm text-surface-400">
          {t('mcp.currentVersionSupport')}
        </p>
        <ul className="text-sm text-surface-400 mt-2 space-y-1 list-disc list-inside">
          <li>{t('mcp.futureSupport1')}</li>
          <li>{t('mcp.futureSupport2')}</li>
          <li>{t('mcp.futureSupport3')}</li>
          <li>{t('mcp.futureSupport4')}</li>
          <li>{t('mcp.futureSupport5')}</li>
          <li>{t('mcp.futureSupport6')}</li>
        </ul>
      </div>
    </div>
  );
};

export default McpPage;

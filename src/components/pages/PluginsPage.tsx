import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import type { PluginExtension, NpmPluginInfo } from '@/types';
import {
  Search,
  Package,
  FolderOpen,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  Globe,
  ToggleLeft,
  ToggleRight,
  Plus,
  Monitor,
  HardDrive,
} from 'lucide-react';

type LocalPluginItem = { path: string; source: 'global' | 'project'; name: string };

const PluginsPage: React.FC = () => {
  const { t } = useTranslation();
  const { installedPlugins, addPlugin, removePlugin, togglePlugin, setInstalledPlugins, parsedOpencodeConfig } = useAppStore();

  // 本地插件（按来源分组）
  const [globalPlugins, setGlobalPlugins] = useState<LocalPluginItem[]>([]);
  const [projectPlugins, setProjectPlugins] = useState<LocalPluginItem[]>([]);
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);

  // NPM 搜索
  const [npmQuery, setNpmQuery] = useState('');
  const [npmResults, setNpmResults] = useState<NpmPluginInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // 安装状态
  const [installingPackages, setInstallingPackages] = useState<Set<string>>(new Set());
  const [uninstallingPackages, setUninstallingPackages] = useState<Set<string>>(new Set());

  // 已安装的 npm 包名集合
  const installedNpmPackages = new Set(
    installedPlugins.filter(p => p.source === 'npm').map(p => p.npmPackage)
  );
  const configuredNpmPlugins: string[] = (parsedOpencodeConfig as any).plugin || [];

  // 加载本地插件（全局 + 项目级）
  const loadLocalPlugins = async () => {
    setIsRefreshingLocal(true);
    try {
      const result = await window.electronAPI.readLocalPlugins();
      setGlobalPlugins((result.global || []) as LocalPluginItem[]);
      setProjectPlugins((result.project || []) as LocalPluginItem[]);

      // 同步到 store（避免重复添加）
      const existingPaths = new Set(installedPlugins.map(p => p.localPath).filter(Boolean));
      const allItems = [...(result.global || []), ...(result.project || [])];
      for (const item of allItems) {
        if (!existingPaths.has(item.path)) {
          const plugin: PluginExtension = {
            id: `local-${item.source}-${item.name}`,
            name: item.name,
            description: '',
            version: '',
            author: '',
            source: 'local',
            localPath: item.path,
            installed: true,
            enabled: true,
            tags: ['local', item.source],
          };
          addPlugin(plugin);
        }
      }
    } catch (err) {
      console.error('加载本地插件失败:', err);
    }
    setIsRefreshingLocal(false);
  };

  // 搜索 NPM 插件
  const handleSearchNpm = async () => {
    if (!npmQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const result = await window.electronAPI.searchNpmPlugins(npmQuery.trim());
      if (result.error) {
        setSearchError(result.error);
        setNpmResults([]);
      } else {
        setNpmResults(result.results || []);
      }
    } catch (err: any) {
      setSearchError(err.message);
      setNpmResults([]);
    }
    setIsSearching(false);
  };

  // 安装 npm 插件
  const handleInstallNpm = async (pkg: NpmPluginInfo) => {
    setInstallingPackages(prev => new Set(prev).add(pkg.name));
    try {
      const result = await window.electronAPI.installNpmPlugin(pkg.name);
      if (result.success) {
        const plugin: PluginExtension = {
          id: pkg.name,
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          author: pkg.author,
          source: 'npm',
          npmPackage: pkg.name,
          installed: true,
          enabled: true,
          tags: pkg.keywords || [],
        };
        addPlugin(plugin);
      }
    } catch (err) {
      console.error('安装失败:', err);
    }
    setInstallingPackages(prev => {
      const next = new Set(prev);
      next.delete(pkg.name);
      return next;
    });
  };

  // 卸载 npm 插件
  const handleUninstallNpm = async (plugin: PluginExtension) => {
    if (!plugin.npmPackage) return;
    setUninstallingPackages(prev => new Set(prev).add(plugin.id));
    try {
      const result = await window.electronAPI.uninstallNpmPlugin(plugin.npmPackage);
      if (result.success) {
        removePlugin(plugin.id);
      }
    } catch (err) {
      console.error('卸载失败:', err);
    }
    setUninstallingPackages(prev => {
      const next = new Set(prev);
      next.delete(plugin.id);
      return next;
    });
  };

  useEffect(() => {
    loadLocalPlugins();
  }, []);

  // 已安装的本地插件
  const localInstalledPlugins = installedPlugins.filter(p => p.source === 'local');
  // 已安装的 npm 插件
  const npmInstalledPlugins = installedPlugins.filter(p => p.source === 'npm');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('plugins.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">{t('plugins.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLocalPlugins}
            disabled={isRefreshingLocal}
            className="btn-secondary text-sm flex items-center gap-1"
            title={t('plugins.refreshLocal')}
          >
            <RefreshCw size={14} className={isRefreshingLocal ? 'animate-spin' : ''} />
            {t('plugins.refreshLocal')}
          </button>
          <a
            href={t('plugins.browseCommunityUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1"
            onClick={(e) => {
              e.preventDefault();
              window.electronAPI.openExternal(t('plugins.browseCommunityUrl'));
            }}
          >
            <Globe size={14} />
            {t('plugins.browseCommunity')}
          </a>
        </div>
      </div>

      {/* NPM 搜索 */}
      <div className="card">
        <h3 className="section-title">{t('plugins.npmPlugins')}</h3>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              value={npmQuery}
              onChange={(e) => setNpmQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchNpm()}
              placeholder={t('plugins.searchNpm')}
              className="input-field pl-9 w-full"
            />
          </div>
          <button
            onClick={handleSearchNpm}
            disabled={isSearching || !npmQuery.trim()}
            className="btn-primary flex items-center gap-1"
          >
            {isSearching ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            {isSearching ? t('plugins.searching') : t('plugins.searchNpmButton')}
          </button>
        </div>

        {searchError && (
          <p className="text-red-400 text-sm mb-2">{searchError}</p>
        )}

        {/* 搜索结果 */}
        {npmResults.length > 0 && (
          <div className="space-y-2">
            {npmResults.map((pkg) => {
              const isInstalled = installedNpmPackages.has(pkg.name);
              const isConfigured = configuredNpmPlugins.includes(pkg.name);
              const isInstalling = installingPackages.has(pkg.name);

              return (
                <div key={pkg.name} className="card flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-primary-400 shrink-0" />
                      <code className="text-sm text-surface-200 font-medium truncate">{pkg.name}</code>
                      <span className="text-xs text-surface-500 shrink-0">v{pkg.version}</span>
                      {isConfigured && (
                        <span className="badge badge-info shrink-0">{t('plugins.enabled')}</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5 truncate">
                      {pkg.description || t('plugins.noDescription')}
                    </p>
                    {pkg.author && (
                      <p className="text-xs text-surface-500 mt-0.5">
                        {t('plugins.author')}: {pkg.author}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {pkg.homepage && (
                      <button
                        onClick={() => pkg.homepage && window.electronAPI.openExternal(pkg.homepage)}
                        className="p-1.5 text-surface-400 hover:text-surface-200 rounded"
                        title={t('plugins.openExternal')}
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                    {isInstalled ? (
                      <button
                        onClick={() => handleUninstallNpm(npmInstalledPlugins.find(p => p.npmPackage === pkg.name)!)}
                        disabled={uninstallingPackages.has(npmInstalledPlugins.find(p => p.npmPackage === pkg.name)?.id || '')}
                        className="btn-danger text-xs flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        {uninstallingPackages.has(npmInstalledPlugins.find(p => p.npmPackage === pkg.name)?.id || '') ? t('plugins.uninstalling') : t('plugins.uninstall')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstallNpm(pkg)}
                        disabled={isInstalling}
                        className="btn-primary text-xs flex items-center gap-1"
                      >
                        {isInstalling ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Download size={12} />
                        )}
                        {isInstalling ? t('plugins.installing') : t('plugins.install')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {npmResults.length === 0 && !isSearching && npmQuery && !searchError && (
          <p className="text-surface-500 text-sm text-center py-4">{t('plugins.noSearchResults')}</p>
        )}
      </div>

      {/* 已安装的 npm 插件 */}
      {npmInstalledPlugins.length > 0 && (
        <div>
          <h3 className="section-title">{t('plugins.installedPlugins')} ({t('plugins.npmPlugins')})</h3>
          <div className="space-y-2">
            {npmInstalledPlugins.map((plugin) => (
              <div key={plugin.id} className="card flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-primary-400 shrink-0" />
                    <code className="text-sm text-surface-200 font-medium">{plugin.name}</code>
                    {plugin.version && <span className="text-xs text-surface-500">v{plugin.version}</span>}
                  </div>
                  {plugin.description && (
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{plugin.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePlugin(plugin.id)}
                    title={plugin.enabled ? t('plugins.disable') : t('plugins.enable')}
                  >
                    {plugin.enabled ? (
                      <ToggleRight size={22} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={22} className="text-surface-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleUninstallNpm(plugin)}
                    disabled={uninstallingPackages.has(plugin.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 本地插件 */}
      <div>
        <h3 className="section-title">
          {t('plugins.localPlugins')} ({globalPlugins.length + projectPlugins.length})
        </h3>
        {globalPlugins.length === 0 && projectPlugins.length === 0 ? (
          <div className="card text-center py-6">
            <FolderOpen size={32} className="mx-auto text-surface-600 mb-2" />
            <p className="text-surface-400 text-sm">{t('plugins.noPluginsInstalled')}</p>
            <p className="text-surface-500 text-xs mt-1">~/.config/opencode/plugins/ 或 ./.opencode/plugins/</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 全局插件 */}
            {globalPlugins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={14} className="text-cyan-400" />
                  <span className="text-sm text-surface-400">~/.config/opencode/plugins/</span>
                </div>
                <div className="space-y-2">
                  {globalPlugins.map((plugin) => (
                    <div key={plugin.path} className="card flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FolderOpen size={14} className="text-cyan-400 shrink-0" />
                          <code className="text-sm text-surface-200 font-medium truncate">{plugin.name}</code>
                          <span className="badge badge-info shrink-0">global</span>
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 truncate">{plugin.path}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => window.electronAPI.openFolder(plugin.path.replace(/[/\\][^/\\]+$/, ''))}
                          title={t('plugins.openExternal')}
                          className="p-1.5 text-surface-400 hover:text-surface-200 rounded"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => togglePlugin(`local-global-${plugin.name}`)}
                          title={t('plugins.enable')}
                        >
                          <ToggleRight size={22} className="text-green-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 项目级插件 */}
            {projectPlugins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Monitor size={14} className="text-purple-400" />
                  <span className="text-sm text-surface-400">.opencode/plugins/</span>
                </div>
                <div className="space-y-2">
                  {projectPlugins.map((plugin) => (
                    <div key={plugin.path} className="card flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FolderOpen size={14} className="text-purple-400 shrink-0" />
                          <code className="text-sm text-surface-200 font-medium truncate">{plugin.name}</code>
                          <span className="badge badge-success shrink-0">project</span>
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 truncate">{plugin.path}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => window.electronAPI.openFolder(plugin.path.replace(/[/\\][^/\\]+$/, ''))}
                          title={t('plugins.openExternal')}
                          className="p-1.5 text-surface-400 hover:text-surface-200 rounded"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => togglePlugin(`local-project-${plugin.name}`)}
                          title={t('plugins.enable')}
                        >
                          <ToggleRight size={22} className="text-green-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 社区插件参考 */}
      <div className="card border-dashed border-surface-600">
        <h3 className="font-medium text-surface-300 mb-2">🌐 {t('plugins.communityPlugins')}</h3>
        <p className="text-sm text-surface-400">
          {t('plugins.communityPluginsHint')}
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { name: 'opencode-wakatime', desc: 'Track OpenCode usage with Wakatime' },
            { name: 'opencode-firecrawl', desc: 'Web scraping via Firecrawl CLI' },
            { name: 'opencode-sentry-monitor', desc: 'Trace agents with Sentry AI Monitoring' },
          ].map((p) => (
            <div key={p.name} className="bg-surface-800 rounded-lg p-2">
              <code className="text-xs text-primary-400">{p.name}</code>
              <p className="text-xs text-surface-500 mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 扩展接口说明 */}
      <div className="card border-dashed border-surface-600">
        <h3 className="font-medium text-surface-300 mb-2">📦 {t('plugins.extensionInterface')}</h3>
        <p className="text-sm text-surface-400">{t('plugins.currentVersionSupport')}</p>
        <ul className="text-sm text-surface-400 mt-2 space-y-1 list-disc list-inside">
          <li>{t('plugins.futureSupport1')}</li>
          <li>{t('plugins.futureSupport2')}</li>
          <li>{t('plugins.futureSupport3')}</li>
          <li>{t('plugins.futureSupport4')}</li>
          <li>{t('plugins.futureSupport5')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PluginsPage;

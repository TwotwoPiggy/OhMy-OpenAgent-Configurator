import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import {
  Home,
  Download,
  Cloud,
  Bot,
  Layers,
  Activity,
  Link2,
  Sparkles,
  Plug,
  Settings,
  Code2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  const NAV_ITEMS = [
    { id: 'overview', label: t('sidebar.overview'), icon: Home },
    { id: 'install', label: t('sidebar.install'), icon: Download },
    { id: 'providers', label: t('sidebar.providers'), icon: Cloud },
    { id: 'agents', label: t('sidebar.agents'), icon: Bot },
    { id: 'categories', label: t('sidebar.categories'), icon: Layers },
    { id: 'concurrency', label: t('sidebar.concurrency'), icon: Activity },
    { id: 'hooks', label: t('sidebar.hooks'), icon: Link2 },
    { id: 'skills', label: t('sidebar.skills'), icon: Sparkles },
    { id: 'mcps', label: t('sidebar.mcps'), icon: Plug },
    { id: 'advanced', label: t('sidebar.advanced'), icon: Settings },
    { id: 'editor', label: t('sidebar.editor'), icon: Code2 },
  ];

  return (
    <aside
      className={`flex flex-col bg-surface-950 border-r border-surface-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-700 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          OM
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-surface-100 truncate">
              {t('sidebar.appTitle')}
            </div>
            <div className="text-xs text-surface-500 truncate">{t('sidebar.appVersion')}</div>
          </div>
        )}
      </div>

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/15 text-primary-400 border-r-2 border-primary-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* 折叠按钮 */}
      <div className="border-t border-surface-700 p-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!sidebarCollapsed && <span className="text-sm">{t('sidebar.collapse')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

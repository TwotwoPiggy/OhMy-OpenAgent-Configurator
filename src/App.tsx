/**
 * 应用主组件
 * Main application component
 */
import React, { useEffect } from 'react';
import '@/i18n'; // 导入 i18n 配置
import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OverviewPage from '@/components/pages/OverviewPage';
import InstallWizard from '@/components/pages/InstallWizard';
import ProviderPage from '@/components/pages/ProviderPage';
import AgentConfigPage from '@/components/pages/AgentConfigPage';
import CategoryConfigPage from '@/components/pages/CategoryConfigPage';
import ConcurrencyPage from '@/components/pages/ConcurrencyPage';
import HooksPage from '@/components/pages/HooksPage';
import PluginsPage from '@/components/pages/PluginsPage';
import SkillsPage from '@/components/pages/SkillsPage';
import McpPage from '@/components/pages/McpPage';
import AdvancedPage from '@/components/pages/AdvancedPage';
import EditorPage from '@/components/pages/EditorPage';
import { parseConfig, mergeConfig, validateConfig, generateDefaultConfig, parseOpencodeConfig } from '@/utils/configUtils';

/**
 * App 组件 - 应用的主容器
 * App component - Main container of the application
 */
const App: React.FC = () => {
  // 从状态管理中获取当前激活的标签页和深色模式状态
  // Get active tab and dark mode state from state management
  const { activeTab, isDarkMode } = useAppStore();

  /**
   * 初始化应用环境
   * Initialize application environment
   */
  useEffect(() => {
    // 初始化环境检查和配置加载
    // Initialize environment check and config loading
    const init = async () => {
      try {
        // 并行检查 opencode、运行时和平台信息
        // Parallel check for opencode, runtime, and platform info
        const [opencodeResult, runtimeResult, platformResult] = await Promise.all([
          window.electronAPI.checkOpencode(),
          window.electronAPI.checkRuntime(),
          window.electronAPI.getPlatformInfo(),
        ]);

        // 更新环境状态
        // Update environment state
        useAppStore.getState().setOpencodeInstalled(opencodeResult.installed);
        useAppStore.getState().setOpencodeVersion(opencodeResult.version);
        useAppStore.getState().setOpencodeSupported(opencodeResult.isSupported);
        useAppStore.getState().setRuntimeInfo(runtimeResult);
        useAppStore.getState().setPlatformInfo(platformResult);

        // 尝试读取已有配置
        // Try to read existing config
        const configResult = await window.electronAPI.readConfig();
        if (configResult.found && configResult.content) {
          useAppStore.getState().setConfigPath(configResult.path || null);
          useAppStore.getState().setConfigLoaded(true);
          
          // 使用 jsonc-parser 解析配置
          // Parse config using jsonc-parser
          try {
            const parsedConfig = parseConfig(configResult.content);
            const validation = validateConfig(parsedConfig);
            
            if (validation.valid) {
              // 生成默认配置
              // Generate default config
              const defaultConfig = generateDefaultConfig();
              // 合并配置
              // Merge configs
              const mergedConfig = mergeConfig(parsedConfig, defaultConfig);
              // 调试：打印配置内容
              // Debug: print config content
              console.log('Parsed config:', parsedConfig);
              console.log('Merged config:', mergedConfig);
              console.log('Agents in config:', Object.keys(mergedConfig.agents || {}));
              // 调试：打印 Multimodal Looker 配置
              // Debug: print Multimodal Looker config
              if (mergedConfig.agents?.['multimodal-looker']) {
                console.log('Multimodal Looker config:', mergedConfig.agents['multimodal-looker']);
              }
              useAppStore.getState().setConfig(mergedConfig);
            } else {
              console.warn('配置验证失败:', validation.errors);
              // 使用默认配置
              // Use default config
              const defaultConfig = generateDefaultConfig();
              useAppStore.getState().setConfig(defaultConfig);
            }
          } catch (error) {
            console.warn('配置文件解析失败，将使用默认配置:', error);
            const defaultConfig = generateDefaultConfig();
            useAppStore.getState().setConfig(defaultConfig);
          }
        } else {
          // 没有配置文件，使用默认配置
          // No config file, use default config
          const defaultConfig = generateDefaultConfig();
          useAppStore.getState().setConfig(defaultConfig);
        }

        // 读取 opencode.json
        // Read opencode.json
        const ocResult = await window.electronAPI.readOpencodeConfig();
        useAppStore.getState().setOpencodeConfig(ocResult);
        
        // 解析 opencode.json 中的 provider 配置
        // Parse provider config from opencode.json
        if (ocResult.found && ocResult.content) {
          const parsedOpencodeConfig = parseOpencodeConfig(ocResult.content);
          useAppStore.getState().setParsedOpencodeConfig(parsedOpencodeConfig);
          console.log('Parsed opencode config:', parsedOpencodeConfig);
        }
      } catch (err) {
        console.error('初始化失败:', err);
      }
    };

    init();
  }, []);

  /**
   * 根据激活的标签页渲染对应的页面
   * Render corresponding page based on active tab
   */
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'install':
        return <InstallWizard />;
      case 'providers':
        return <ProviderPage />;
      case 'agents':
        return <AgentConfigPage />;
      case 'categories':
        return <CategoryConfigPage />;
      case 'concurrency':
        return <ConcurrencyPage />;
      case 'hooks':
        return <HooksPage />;
      case 'plugins':
        return <PluginsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'mcps':
        return <McpPage />;
      case 'advanced':
        return <AdvancedPage />;
      case 'editor':
        return <EditorPage />;
      default:
        return <OverviewPage />;
    }
  };

  /**
   * 渲染应用布局
   * Render application layout
   */
  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-surface-900">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;

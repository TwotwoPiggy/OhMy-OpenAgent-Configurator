import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Save, Copy, CheckCircle2, RotateCcw, FileJson } from 'lucide-react';

const EditorPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, configPath, setConfig, setConfigPath, setConfigLoaded } = useAppStore();
  const [editorContent, setEditorContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEditorContent(JSON.stringify(config, null, 2));
    setError(null);
  }, [config]);

  const handleContentChange = (value: string) => {
    setEditorContent(value);
    setSaved(false);
    try {
      JSON.parse(value);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(editorContent);
      setConfig(parsed);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleSave = async () => {
    try {
      const configDir = await window.electronAPI.getConfigDir();
      const savePath = `${configDir}/oh-my-openagent.jsonc`;
      const result = await window.electronAPI.writeConfig(savePath, editorContent);
      if (result.success) {
        setConfigPath(result.path || null);
        setConfigLoaded(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || '保存失败');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEditorContent(JSON.stringify(config, null, 2));
    setError(null);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(editorContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorContent(formatted);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-100">{t('editor.title')}</h2>
          <p className="text-surface-400 text-sm mt-1">
            {t('editor.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleFormat} className="btn-ghost text-sm">
            {t('editor.format')}
          </button>
          <button onClick={handleReset} className="btn-ghost text-sm flex items-center gap-1">
            <RotateCcw size={14} /> {t('editor.reset')}
          </button>
          <button onClick={handleCopy} className="btn-ghost text-sm flex items-center gap-1">
            {copied ? (
              <><CheckCircle2 size={14} className="text-green-400" /> {t('editor.copied')}</>
            ) : (
              <><Copy size={14} /> {t('editor.copy')}</>
            )}
          </button>
          <button onClick={handleApply} className="btn-secondary text-sm flex items-center gap-1">
            {t('editor.applyToMemory')}
          </button>
          <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-1">
            <Save size={14} /> {t('editor.saveToFile')}
          </button>
        </div>
      </div>

      {/* 文件路径 */}
      {configPath && (
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <FileJson size={14} />
          <span className="font-mono">{configPath}</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="card border-red-600/30 bg-red-600/5">
          <p className="text-sm text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* 成功提示 */}
      {saved && !error && (
        <div className="card border-green-600/30 bg-green-600/5">
          <p className="text-sm text-green-400">✅ {t('editor.configSaved')}</p>
        </div>
      )}

      {/* 编辑器 */}
      <div className="relative">
        <textarea
          value={editorContent}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="w-full h-[calc(100vh-280px)] min-h-[400px] bg-surface-950 text-surface-200 font-mono text-sm p-4 rounded-xl border border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
          style={{ tabSize: 2 }}
        />
        {/* 行号提示 */}
        <div className="absolute bottom-2 right-2 text-xs text-surface-600">
          {editorContent.split('\n').length} 行
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

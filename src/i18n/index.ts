import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { zh } from './locales/zh';
import { en } from './locales/en';

// 配置 i18n 实例
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zh
      },
      en: {
        translation: en
      }
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false // React 已经处理了 XSS
    }
  });

export default i18n;
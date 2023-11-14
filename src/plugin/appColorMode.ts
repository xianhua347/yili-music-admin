import { Dark } from 'quasar';

import { useAppSettingsStore } from '@/store';

/**
 * 跟随系统颜色函数
 */
export const AppColorMode = {
  install: (): void => {
    let { darkMode } = useAppSettingsStore().appSettingsState;
    // 设置初始值为auto 自动跟随系统
    Dark.set(darkMode);

    // 获取系统颜色
    const mediaQuery: MediaQueryList = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    // 定义
    const handleMediaQueryChange = (e: MediaQueryListEvent): void => {
      Dark.set(e.matches);
      darkMode = e.matches;
    };

    // 添加事件
    mediaQuery.addEventListener('change', handleMediaQueryChange);
  }
};

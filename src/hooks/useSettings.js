import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for managing app settings in localStorage
 * @returns {object} - Settings state and update function
 */
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('settings', {
    theme: 'light',
    lastViewedDate: new Date().toISOString().split('T')[0],
  });

  const updateSettings = (updates) => {
    setSettings({
      ...settings,
      ...updates,
    });
  };

  return {
    settings,
    updateSettings,
  };
}

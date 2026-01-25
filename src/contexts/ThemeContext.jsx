import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { ThemeContext } from '../hooks/useTheme';

export const ThemeProvider = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const theme = settings.theme || 'light';

  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

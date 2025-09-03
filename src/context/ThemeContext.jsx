import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  EMERALD: 'emerald',
  OCEAN: 'ocean',
  SUNSET: 'sunset',
  FOREST: 'forest'
};

const THEME_CONFIGS = {
  [THEMES.LIGHT]: {
    name: 'Light',
    background: 'bg-white',
    text: 'text-gray-900',
    card: 'bg-white/90 border-gray-200',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-50 to-white'
  },
  [THEMES.DARK]: {
    name: 'Dark',
    background: 'bg-black',
    text: 'text-white',
    card: 'bg-gray-800/90 border-gray-700',
    accent: 'text-emerald-400',
    gradient: 'from-emerald-900/20 to-black'
  },
  [THEMES.EMERALD]: {
    name: 'Emerald',
    background: 'bg-gradient-to-br from-emerald-50 to-green-100',
    text: 'text-emerald-900',
    card: 'bg-white/80 border-emerald-200',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-100 to-green-50'
  },
  [THEMES.OCEAN]: {
    name: 'Ocean',
    background: 'bg-gradient-to-br from-blue-50 to-cyan-100',
    text: 'text-blue-900',
    card: 'bg-white/80 border-blue-200',
    accent: 'text-blue-600',
    gradient: 'from-blue-100 to-cyan-50'
  },
  [THEMES.SUNSET]: {
    name: 'Sunset',
    background: 'bg-gradient-to-br from-orange-50 to-pink-100',
    text: 'text-orange-900',
    card: 'bg-white/80 border-orange-200',
    accent: 'text-orange-600',
    gradient: 'from-orange-100 to-pink-50'
  },
  [THEMES.FOREST]: {
    name: 'Forest',
    background: 'bg-gradient-to-br from-green-50 to-emerald-100',
    text: 'text-green-900',
    card: 'bg-white/80 border-green-200',
    accent: 'text-green-600',
    gradient: 'from-green-100 to-emerald-50'
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || THEMES.LIGHT;
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Update document classes
    document.documentElement.className = '';
    document.documentElement.classList.add(currentTheme);
    
    // Add dark class for dark theme
    if (currentTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    }
  }, [currentTheme]);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const getThemeConfig = () => {
    return THEME_CONFIGS[currentTheme] || THEME_CONFIGS[THEMES.LIGHT];
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme, 
      getThemeConfig,
      availableThemes: Object.values(THEMES),
      themeConfigs: THEME_CONFIGS
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

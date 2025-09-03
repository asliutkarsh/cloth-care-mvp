import React from 'react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

export function Card({ className, children, padded = true, shadow = 'sm', variant = 'default', ...props }) {
  const { currentTheme, getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();
  
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white/95 dark:bg-gray-800/95 border-emerald-200/50 dark:border-emerald-700/50 shadow-lg';
      case 'glass':
        return 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-600/30 backdrop-blur-md';
      case 'accent':
        return `bg-gradient-to-br ${themeConfig.gradient} border-emerald-300/50 dark:border-emerald-600/50`;
      default:
        return 'bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 backdrop-blur';
    }
  };

  return (
    <div
      className={clsx(
        'rounded-xl border backdrop-blur transition-all duration-300 hover:shadow-md',
        getCardStyles(),
        shadow === 'none' && 'shadow-none',
        shadow === 'sm' && 'shadow-sm',
        shadow === 'md' && 'shadow',
        shadow === 'lg' && 'shadow-lg',
        padded && 'p-4 md:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={clsx('text-sm text-gray-600 dark:text-gray-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={clsx('mt-4 flex items-center justify-end gap-2', className)} {...props}>
      {children}
    </div>
  );
}

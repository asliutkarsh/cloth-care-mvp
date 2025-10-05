import React from 'react';
import clsx from 'clsx';

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const variants = {
  primary:
    'bg-primary-activeBg text-white hover:bg-primary-deep focus-visible:ring-primary-deep/40 ring-offset-transparent',
  secondary:
    'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 focus-visible:ring-gray-500 dark:ring-offset-gray-900',
  ghost:
    'bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-gray-400 dark:ring-offset-gray-900',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  dangerghost:
    'bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 focus-visible:ring-red-500', 
};

export default function Button({
  as: As = 'button',
  className,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  children,
  ...props
}) {
  return (
    <As
      className={clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </As>
  );
}

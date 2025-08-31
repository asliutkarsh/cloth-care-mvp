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
    'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  ghost:
    'bg-transparent text-gray-800 hover:bg-gray-100 focus-visible:ring-gray-400 dark:text-gray-100 dark:hover:bg-gray-700',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
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

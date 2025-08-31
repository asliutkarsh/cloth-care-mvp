import React from 'react';
import clsx from 'clsx';

export function Card({ className, children, padded = true, shadow = 'sm', ...props }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-white/20 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur',
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

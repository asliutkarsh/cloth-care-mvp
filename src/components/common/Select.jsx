import React from 'react';
import clsx from 'clsx';

const sizes = {
    sm: 'h-9 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-11 text-base px-4',
};

export default function Select({
    label,
    id,
    error,
    helperText,
    size = 'md',
    className,
    selectClassName,
    fullWidth = true,
    children,
    ...props
}) {
    const selectId = id || (label ? `${label.replace(/\s+/g, '-').toLowerCase()}-select` : undefined);
    return (
        <div className={clsx(fullWidth && 'w-full', className)}>
            {label && (
                <label htmlFor={selectId} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div
                className={clsx(
                    'relative flex items-center rounded-lg border bg-white/70 dark:bg-gray-800/70 backdrop-blur',
                    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
                    error ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
            >
                <select
                    id={selectId}
                    className={clsx(
                        'bg-transparent outline-none w-full appearance-none',
                        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        sizes[size],
                        selectClassName
                    )}
                    aria-invalid={!!error}
                    {...props}
                >
                    {children}
                </select>
                <span className="pointer-events-none absolute right-3 text-gray-500">▾</span>
            </div>
            {(helperText || error) && (
                <p className={clsx('mt-1 text-xs', error ? 'text-red-600' : 'text-gray-500 dark:text-gray-400')}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

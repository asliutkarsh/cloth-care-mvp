import React from 'react';
import clsx from 'clsx';

const sizes = {
    sm: 'h-9 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-11 text-base px-4',
};

export default function Input({
    label,
    id,
    error,
    helperText,
    left,
    right,
    size = 'md',
    className,
    disabled = false,
    inputClassName,
    fullWidth = true,
    ...props
}) {
    const inputId = id || (label ? `${label.replace(/\s+/g, '-').toLowerCase()}-input` : undefined);
    return (
        <div className={clsx(fullWidth && 'w-full', className)}>
            {label && (
                <label htmlFor={inputId} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div
                className={clsx(
                    'relative flex items-center rounded-lg border bg-white/70 dark:bg-gray-800/70 backdrop-blur',
                    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
                    error
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600',
                )}
            >
                {left && (
                    <span className={clsx('pl-3 text-gray-400 flex items-center', sizes[size])}>
                        <span className="-ml-1">{left}</span>
                    </span>
                )}
                <input
                    id={inputId}
                    disabled={disabled}
                    className={clsx(
                        'bg-transparent outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        sizes[size],
                        left && 'pl-2',
                        right && 'pr-2',
                        inputClassName,
                    )}
                    aria-invalid={!!error}
                    {...props}
                />
                {right && (
                    <span className={clsx('pr-3 text-gray-400 flex items-center', sizes[size])}>{right}</span>
                )}
            </div>
            {(helperText || error) && (
                <p className={clsx('mt-1 text-xs', error ? 'text-red-600' : 'text-gray-500 dark:text-gray-400')}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

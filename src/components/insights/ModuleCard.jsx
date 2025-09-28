import React from 'react';
import clsx from 'clsx';

export default function ModuleCard({ title, description, children, className }) {
  return (
    <section className={clsx('rounded-3xl border border-gray-200/70 dark:border-gray-800/60 bg-white/85 dark:bg-gray-900/70 shadow-sm p-5 sm:p-6 space-y-4', className)}>
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

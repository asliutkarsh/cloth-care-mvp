import React from 'react';
import clsx from 'clsx';

export default function SectionHeader({ title, description, actions, className }) {
  return (
    <div className={clsx('flex items-start md:items-center justify-between gap-3 mb-4', className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}

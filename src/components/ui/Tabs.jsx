import React, { useId, useMemo, useState } from 'react';
import clsx from 'clsx';

export function Tabs({ value, defaultValue, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const ctx = useMemo(() => ({
    value: current,
    setValue: (v) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
  }), [current, isControlled, onValueChange]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const TabsContext = React.createContext({ value: undefined, setValue: () => {} });

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={clsx('flex border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const id = useId();
  const { value: active, setValue } = React.useContext(TabsContext);
  const selected = active === value;

  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      onClick={() => setValue(value)}
      className={clsx(
        'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
        selected
          ? 'text-primary-deep dark:text-primary-bright border-primary-deep dark:border-primary-bright'
          : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const id = useId();
  const { value: active } = React.useContext(TabsContext);
  const selected = active === value;
  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={!selected}
      className={className}
    >
      {selected ? children : null}
    </div>
  );
}

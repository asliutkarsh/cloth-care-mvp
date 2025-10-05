const STATUS_META = {
  clean: {
    label: 'Clean',
    className: 'tag-clean',
  },
  dirty: {
    label: 'Dirty',
    className: 'tag-dirty',
  },
  needs_pressing: {
    label: 'Needs Pressing',
    className: 'tag-pressing',
  }
};

const DEFAULT_META = {
  label: 'Status Unknown',
  className: 'tag bg-gray-200 text-gray-700 dark:bg-gray-800/80 dark:text-gray-200',
};

export const getClothStatusMeta = (status) => {
  if (!status) return DEFAULT_META;
  return STATUS_META[status] || DEFAULT_META;
};

export const getClothStatusLabel = (status) => getClothStatusMeta(status).label;

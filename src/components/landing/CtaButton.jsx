import { Link } from 'react-router-dom';

const CtaButton = ({ to, children, variant = 'primary' }) => {
  const base =
    'inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition hover:scale-[1.02] active:scale-[0.98]';
  const variants = {
    primary: 'bg-brand text-white shadow-lg shadow-brand/20',
    secondary:
      'bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-white/10 backdrop-blur text-gray-900 dark:text-gray-100',
  };
  return (
    <Link to={to} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
};

export default CtaButton;
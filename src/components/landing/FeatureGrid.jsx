import { motion } from 'framer-motion';

const FeatureCard = ({ emoji, title, text }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="text-center p-6"
  >
    <span className="text-4xl">{emoji}</span>
    <h4 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{title}</h4>
    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{text}</p>
  </motion.div>
);

const FeatureGrid = ({ items }) => {
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={gridVariants}
      className="grid sm:grid-cols-2 md:grid-cols-4 gap-6"
    >
      {items.map((item, i) => (
        <FeatureCard key={i} {...item} />
      ))}
    </motion.div>
  );
};

export default FeatureGrid;
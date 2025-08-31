import { motion } from 'framer-motion'

export default function ClothCard({ cloth }) {
  return (
    <motion.div
      layoutId={cloth.name}
      whileHover={{ scale: 1.02 }}
      className="glass-card"
    >
      <h3 className="font-semibold text-lg">{cloth.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-300">{cloth.type}</p>
      <div className="mt-3">
        <span
          className={`text-xs px-2 py-1 rounded ${
            cloth.status === 'clean'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {cloth.status}
        </span>
      </div>
    </motion.div>
  )
}

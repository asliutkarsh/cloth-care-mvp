import { useState } from 'react'
import { motion } from 'framer-motion'



export default function AddClothForm({ addCloth }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !type) return
    addCloth({ name, type, status: 'clean' })
    setName('')
    setType('')
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-2 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <input
        type="text"
        placeholder="Cloth name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded p-2 flex-1 bg-white dark:bg-gray-800"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border rounded p-2 bg-white dark:bg-gray-800"
      >
        <option value="">Type</option>
        <option>Shirt</option>
        <option>T-Shirt</option>
        <option>Jeans</option>
        <option>Polo</option>
        <option>Cargo</option>
      </select>
      <button className="bg-brand text-white px-4 rounded">Add</button>
    </motion.form>
  )
}

// src/components/ui/EmojiPicker.jsx
import React, { useMemo, useState } from 'react'

// Lightweight emoji picker without external deps. Accepts a preset list and allows custom input.
const DEFAULT_EMOJIS = [
  '👕','🧥','👔','👖','🩳','🧣','🧤','🧦','👗','👚','👟','🥾','🥿','👞','🎩','🧢','👒',
  '🌞','❄️','🍂','🌧️','🏃','💼','🎉','🏖️','🏋️','🧘','🧺','🧼','⭐','🔥','🌙'
]

export default function EmojiPicker({ value, onChange, emojis = DEFAULT_EMOJIS }) {
  const [query, setQuery] = useState('')
  const list = useMemo(() => {
    if (!query) return emojis
    return emojis.filter(e => e.includes(query))
  }, [emojis, query])

  return (
    <div className="w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        className="w-full h-9 px-2 mb-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
      />
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-auto">
        {list.map((e) => (
          <button
            key={e}
            type="button"
            className={`h-8 w-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${value === e ? 'ring-2 ring-emerald-500' : ''}`}
            onClick={() => onChange?.(e)}
          >
            <span className="text-xl leading-none">{e}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

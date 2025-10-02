import React from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { CHANGELOG } from '../../app.config.js'

export default function ChangelogModal({ open, onClose }) {
  const latestLog = CHANGELOG[0]

  if (!latestLog) return null

  return (
    <Modal open={open} onClose={onClose} title={`What's New in v${latestLog.version}`}>
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>Here are the latest features and improvements:</p>
        <ul className="space-y-2">
          {latestLog.changes.map((change, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  change.type === 'Feature'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                }`}
              >
                {change.type}
              </span>
              <p>{change.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Got it!</Button>
      </div>
    </Modal>
  )
}

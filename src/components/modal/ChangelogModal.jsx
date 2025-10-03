import React from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { WHATS_NEW } from '../../app.config.js'

export default function ChangelogModal({ open, onClose }) {
  const latestLog = WHATS_NEW[0]

  if (!latestLog) return null

  return (
    <Modal open={open} onClose={onClose} title={`What's New in v${latestLog.version}`}>
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="text-sm font-semibold">{latestLog.date}</p>
        <ol className="space-y-2">
          {latestLog.changes.map((change, index) => (
            <li key={index} className="flex items-start gap-3">
              <p>{change}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Got it!</Button>
      </div>
    </Modal>
  )
}

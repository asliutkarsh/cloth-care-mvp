import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '../components/ui'
import { CHANGELOG } from '../app.config.js'

const ChangeItem = ({ type, description }) => (
  <div className="flex items-start gap-3">
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        type === 'Feature'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
      }`}
    >
      {type}
    </span>
    <p className="text-sm text-gray-700 dark:text-gray-400">{description}</p>
  </div>
)

export default function ChangelogPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <FileText size={16} />
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">Changelog</h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          <div className="space-y-6">
            {CHANGELOG.map((log) => (
              <div key={log.version} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Version {log.version}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({log.date})</span>
                </div>
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                  {log.changes.map((change, index) => (
                    <ChangeItem key={index} type={change.type} description={change.description} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Want to suggest a feature or report an issue?{' '}
              <a href="mailto:support@clothcare.app" className="text-primary-deep underline hover:text-primary-deep/80">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

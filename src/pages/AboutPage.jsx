import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Info, FileText, Users, Shield, BookOpen } from 'lucide-react'
import { Button } from '../components/ui'
import { APP_VERSION, CHANGELOG } from '../app.config.js'

const InfoSection = ({ title, icon, children }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
    <div className="pl-11 text-sm text-gray-700 dark:text-gray-400 space-y-2">
      {children}
    </div>
  </section>
)

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
    <p>{description}</p>
  </div>
)

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold sm:text-2xl">About ClothCare</h1>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          <InfoSection title={`Version ${APP_VERSION}`} icon={<Info size={16} />}>
            <p>Thank you for using ClothCare! We are constantly working to improve your experience.</p>
          </InfoSection>

          <InfoSection title="Changelog" icon={<FileText size={16} />}>
            <div className="space-y-4">
              {CHANGELOG.map((log) => (
                <div key={log.version}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {log.version}{' '}
                    <span className="text-xs font-normal text-gray-500">({log.date})</span>
                  </h3>
                  <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                    {log.changes.map((change, index) => (
                      <ChangeItem key={index} type={change.type} description={change.description} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InfoSection>

          <InfoSection title="Contact & Feedback" icon={<Users size={16} />}>
            <p>
              Have a suggestion or need support? Reach out to us at{' '}
              <a href="mailto:support@clothcare.app" className="text-primary-deep underline">
                support@clothcare.app
              </a>
              .
            </p>
          </InfoSection>

          <InfoSection title="Legal & Licenses" icon={<Shield size={16} />}>
            <p>
              By using this application, you agree to our{' '}
              <a href="/terms" className="underline">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline">
                Privacy Policy
              </a>
              .
            </p>
            <p>This app is built with open-source software. A full list of licenses can be provided upon request.</p>
          </InfoSection>

          <InfoSection title="Developers" icon={<BookOpen size={16} />}>
            <p>This application is proudly developed by [Your Team Name/Your Name].</p>
          </InfoSection>
        </div>
      </div>
    </div>
  )
}

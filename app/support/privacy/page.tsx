'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const policyData = {
  effectiveDate: 'January 1, 2025',
  lastUpdated: 'January 1, 2025',
  version: '3.0',
  sections: [
    {
      id: 1,
      icon: '📊',
      title: 'Information We Collect',
      summary: 'What data we gather when you use CuddleMatte',
      content: [
        'Account Information: Name, email, phone number, date of birth, gender, photos',
        'Profile Information: Bio, interests, preferences, location',
        'Usage Data: How you interact with the app, features used, time spent',
        'Device Information: Device type, operating system, unique identifiers',
        'Location Data: GPS location (with your permission) to show nearby users',
        'Communication Data: Messages, chat content, call logs',
        'Payment Information: Billing details, transaction history (via secure processors)',
        'Photos & Media: Images you upload to your profile or share in messages',
        'Verification Data: ID documents if you choose to verify your account',
        'Cookies & Tracking: Data from cookies and similar technologies',
      ],
      importance: 'critical',
    },
    {
      id: 2,
      icon: '🎯',
      title: 'How We Use Your Information',
      summary: 'Why we collect and process your data',
      content: [
        'Provide Services: Create and maintain your account, enable messaging and matching',
        'Improve Experience: Personalize recommendations and enhance app functionality',
        'Safety & Security: Detect fraud, prevent abuse, enforce our policies',
        'Customer Support: Respond to inquiries and resolve issues',
        'Analytics: Understand usage patterns and improve our services',
        'Marketing: Send promotional content (you can opt-out anytime)',
        'Legal Compliance: Meet legal obligations and protect rights',
        'Research: Conduct studies to improve dating safety and success',
        'New Features: Develop and test new products and features',
        'Communications: Send service updates, security alerts, and notifications',
      ],
      importance: 'high',
    },
    {
      id: 3,
      icon: '🤝',
      title: 'How We Share Your Information',
      summary: 'Who can access your data and why',
      content: [
        'Other Users: Profile information is visible to potential matches based on your settings',
        'Service Providers: Third-party companies that help us operate (payment processors, cloud storage, analytics)',
        'Business Partners: Carefully selected partners for specific features (with your consent)',
        'Legal Requirements: When required by law, court order, or government request',
        'Safety Purposes: To prevent fraud, abuse, or harm to you or others',
        'Business Transfers: In case of merger, acquisition, or sale of assets',
        'With Your Consent: Any other sharing you explicitly approve',
        "Aggregated Data: Anonymous, aggregated statistics that don't identify you",
        'Parent Company: We may share data within our corporate family',
        'We Never Sell: We do not sell your personal data to third parties',
      ],
      importance: 'critical',
    },
    {
      id: 4,
      icon: '🔐',
      title: 'Data Security',
      summary: 'How we protect your information',
      content: [
        'Encryption: Data encrypted in transit and at rest using industry standards',
        'Secure Servers: Data stored on secure, monitored servers with restricted access',
        'Access Controls: Limited employee access on need-to-know basis',
        'Regular Audits: Security assessments and vulnerability testing',
        'Security Training: Staff trained on data protection best practices',
        'Incident Response: Protocols to detect and respond to security breaches',
        'Two-Factor Authentication: Optional 2FA for enhanced account security',
        'Password Protection: Secure password requirements and hashing',
        'However: No system is 100% secure; we work to minimize risks',
        'Your Role: Keep your password secure and report suspicious activity',
      ],
      importance: 'critical',
    },
    {
      id: 5,
      icon: '⚙️',
      title: 'Your Privacy Controls',
      summary: 'Settings you can manage',
      content: [
        'Profile Visibility: Control who can see your profile and information',
        'Location Sharing: Enable/disable location services anytime',
        'Notifications: Choose which alerts and emails you receive',
        'Blocking: Block users to prevent them from contacting you',
        'Data Download: Request a copy of your data anytime',
        'Data Deletion: Request deletion of your account and data',
        'Marketing Opt-Out: Unsubscribe from promotional communications',
        'Cookie Settings: Manage cookie preferences in settings',
        'Third-Party Links: Control connections to external services',
        'Privacy Settings: Comprehensive controls in your account settings',
      ],
      importance: 'high',
    },
  ],
}

const quickStats = [
  { icon: '🔐', label: 'Encrypted', sublabel: 'End-to-End' },
  { icon: '🚫', label: 'Never Sold', sublabel: 'Your Data' },
  { icon: '✓', label: 'Full Control', sublabel: 'Privacy' },
  { icon: '🛡️', label: 'GDPR', sublabel: 'Compliant' },
]

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
     aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:cursor-not-allowed ${
        checked ? 'bg-pink-400' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  const [showFloatingHeader, setShowFloatingHeader] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    marketing: false,
    personalization: true,
  })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [downloadToast, setDownloadToast] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setShowFloatingHeader(el.scrollTop > 100)
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const toggleSection = (index: number) =>
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )

  const toggleSetting = (key: keyof typeof privacySettings) =>
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleDownload = () => {
    setDownloadToast(true)
    setTimeout(() => setDownloadToast(false), 3500)
  }

  return (
    <div className="relative flex h-screen flex-col bg-white dark:bg-gray-950">
      {/* Floating header */}
      <div
        className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3 transition-opacity duration-200 dark:border-gray-800 dark:bg-gray-950 ${
          showFloatingHeader ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          onClick={() => history.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800"
        >
          ←
        </button>
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Privacy Policy</span>
        <div className="w-9" />
      </div>

      {/* Toast */}
      {downloadToast && (
        <div className="absolute inset-x-4 top-4 z-30 rounded-xl bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
          We will email you a download link within 48 hours.
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">Delete Your Data</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl pb-16">
          {/* Back button */}
          <div className="px-5 pt-12">
            <button
              onClick={() => history.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xl dark:border-gray-700 dark:bg-gray-800"
            >
              ←
            </button>
          </div>

          {/* Hero */}
          <section className="flex flex-col items-center px-6 pb-12 pt-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-4xl dark:bg-pink-950">
              🔒
            </div>
            <h1 className="mb-3 text-3xl font-extrabold leading-tight text-gray-900 dark:text-gray-100">
              Privacy First,<br />Always
            </h1>
            <p className="mb-6 max-w-md text-base leading-relaxed text-gray-500">
              Your trust is everything. We are committed to protecting your data and being transparent about every step.
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                v{policyData.version}
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Updated {policyData.effectiveDate}
              </span>
            </div>
          </section>

          {/* Trust indicators */}
          <section className="mb-8 grid grid-cols-4 gap-3 px-5">
            {quickStats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-lg dark:bg-pink-950">
                  {stat.icon}
                </div>
                <span className="text-center text-xs font-semibold text-gray-900 dark:text-gray-100">{stat.label}</span>
                <span className="text-center text-[10px] text-gray-400">{stat.sublabel}</span>
              </div>
            ))}
          </section>

          {/* View mode tabs */}
          <div className="mb-6 px-5">
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {(['summary', 'full'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    viewMode === mode
                      ? 'bg-pink-400 text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {mode === 'summary' ? 'Summary' : 'Full Details'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary view */}
          {viewMode === 'summary' && (
            <section className="mb-8 space-y-3 px-5">
              {policyData.sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mb-4 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-2xl dark:bg-pink-950">
                      {section.icon}
                    </div>
                    <div>
                      <p className="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">{section.title}</p>
                      <p className="text-sm text-gray-500">{section.summary}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="text-sm text-gray-400">
                      {section.content.slice(0, 2).map((item) => item.split(':')[0]).join(', ')}…
                    </p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setViewMode('full')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-400 py-4 text-sm font-semibold text-white"
              >
                View Complete Policy <span>→</span>
              </button>
            </section>
          )}

          {/* Full policy view */}
          {viewMode === 'full' && (
            <section className="mb-8 space-y-3 px-5">
              {policyData.sections.map((section, index) => {
                const isExpanded = expandedSections.includes(index)
                const isCritical = section.importance === 'critical'
                return (
                  <div
                    key={section.id}
                    className={`overflow-hidden rounded-2xl border bg-gray-50 dark:bg-gray-900 ${
                      isCritical
                        ? 'border-pink-200 dark:border-pink-900'
                        : 'border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <div className="flex flex-1 items-start gap-4 pr-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl dark:bg-pink-950">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{section.title}</span>
                            {isCritical && (
                              <span className="rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-500 dark:bg-pink-950 dark:text-pink-400">
                                Important
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{section.summary}</p>
                        </div>
                      </div>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base font-bold transition-colors ${
                          isExpanded
                            ? 'border-pink-400 bg-pink-400 text-white'
                            : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {isExpanded ? '−' : '+'}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 px-5 pb-5">
                        {section.content.map((item, idx) => {
                          const colonIdx = item.indexOf(':')
                          const title = colonIdx !== -1 ? item.slice(0, colonIdx) : item
                          const desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''
                          return (
                            <div key={idx} className="flex gap-3">
                              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                                {desc && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{desc}</p>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {/* Privacy Controls */}
          <section className="mb-8 px-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacy Controls</h2>
              <p className="text-sm text-gray-500">Manage your data preferences</p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'analytics' as const, title: 'Analytics & Performance', desc: 'Help improve the app' },
                { key: 'marketing' as const, title: 'Marketing Communications', desc: 'Promotional emails & offers' },
                { key: 'personalization' as const, title: 'Personalization', desc: 'Customize your experience' },
              ].map(({ key, title, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mr-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <Toggle checked={privacySettings[key]} onChange={() => toggleSetting(key)} />
                </div>
              ))}

              {/* Locked — Do Not Sell */}
              <div className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-900 dark:bg-pink-950/20">
                <div className="mr-4">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Do Not Sell My Data</p>
                    <span className="rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-500 dark:bg-pink-950 dark:text-pink-400">
                      Always On
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">We never sell your personal data</p>
                </div>
                <Toggle checked={true} disabled />
              </div>
            </div>
          </section>

          {/* Data Rights */}
          <section className="mb-8 px-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Data Rights</h2>
              <p className="text-sm text-gray-500">Request, update, or delete your information</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: '📥', title: 'Download Your Data', desc: 'Receive a complete copy within 48 hours', onClick: handleDownload, danger: false },
                { icon: '✏️', title: 'Update Information', desc: 'Correct or modify your data', onClick: undefined, danger: false },
                { icon: '🚫', title: 'Restrict Processing', desc: 'Limit how we use your data', onClick: undefined, danger: false },
              ].map(({ icon, title, desc, onClick }) => (
                <button
                  key={title}
                  onClick={onClick}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl dark:bg-pink-950">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <span className="text-lg text-gray-300">→</span>
                </button>
              ))}

              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex w-full items-center gap-4 rounded-xl border border-red-100 bg-red-50/50 p-4 text-left dark:border-red-900 dark:bg-red-950/20"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950">
                  🗑️
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-500">Delete Your Account</p>
                  <p className="text-xs text-gray-500">Permanently remove all data</p>
                </div>
                <span className="text-lg text-gray-300">→</span>
              </button>
            </div>
          </section>

          {/* Help */}
          <section className="mx-5 mb-8 rounded-2xl border border-pink-100 bg-pink-50/50 p-6 text-center dark:border-pink-900 dark:bg-pink-950/20">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">Need Help?</h3>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">
              Our privacy team is available to answer any questions you have about your data.
            </p>
            <Link
              href="../help/contact"
              className="inline-block rounded-full bg-pink-400 px-6 py-3 text-sm font-semibold text-white"
            >
              Contact Privacy Team
              
            </Link>
          </section>

          {/* Footer links */}
          <div className="flex flex-wrap items-center justify-center gap-1 px-5 pb-4">
            {['Terms of Service', 'Cookie Policy', 'DPO Contact'].map((label, i, arr) => (
              <span key={label} className="flex items-center gap-1">
                <a href="#" className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  {label}
                </a>
                {i < arr.length - 1 && <span className="h-1 w-1 rounded-full bg-gray-300" />}
              </span>
            ))}
          </div>

          <p className="pb-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()}  CuddleMatte. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
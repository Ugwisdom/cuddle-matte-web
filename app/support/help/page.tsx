'use client'

import Link from 'next/link'

const items = [
  { label: 'Contact Support', href: '/support/contact' },
  { label: 'Live Chat', href: 'https://wa.me/+2348065417518' },
  { label: 'Safety Tips', href: '/support/safety' },
  { label: 'Community Guidelines', href: '/support/community' },
  { label: 'Privacy Policy', href: '/support/privacy' },
]

export default function HelpPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Help & Support</h1>
          <p style={styles.subtitle}>Find answers or contact our support team</p>
        </div>

        {/* List */}
        <div style={styles.list}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={styles.link}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = '#f9a8d4'   // pink-300
                el.style.backgroundColor = '#fdf2f8' // pink-50
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = '#e5e7eb'   // gray-200
                el.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          If you still need help, reach out via Live Chat or Email
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
  },
  container: {
    margin: '0 auto',
    maxWidth: '672px',   // max-w-2xl
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '64px',
  },
  header: {
    paddingBottom: '8px',
    paddingTop: '40px',
  },
  title: {
    marginBottom: '6px',
    fontSize: '1.875rem',   // text-3xl
    fontWeight: 800,         // font-extrabold
    color: '#f472b6',        // pink-400
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.875rem',   // text-sm
    color: '#9ca3af',       // gray-400
    margin: 0,
  },
  list: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',            // space-y-3
  },
  link: {
    display: 'block',
    borderRadius: '12px',   // rounded-xl
    border: '1px solid #e5e7eb', // border-gray-200
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: '1rem',       // text-base
    fontWeight: 700,        // font-bold
    color: '#111827',       // text-gray-900
    textDecoration: 'none',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
    backgroundColor: 'transparent',
  },
  footer: {
    marginTop: '24px',
    fontSize: '0.875rem',   // text-sm
    color: '#9ca3af',       // gray-400
  },
}
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const categories = [
  { id: 'account',   icon: '👤', href: '/support/account',   label: 'Account issues' },
  { id: 'safety',    icon: '🛡️', href: '/support/safety',    label: 'Safety & security' },
  { id: 'payment',   icon: '💳', href: '/support/payment',   label: 'Billing & payment' },
  { id: 'matches',   icon: '💕', href: '/support/matches',   label: 'Matches & dating' },
  { id: 'technical', icon: '⚙️', href: '/support/technical', label: 'Technical support' },
  { id: 'feedback',  icon: '💬', href: '/support/feedback',  label: 'Feedback & ideas' },
]

const quickHelp = [
  { icon: '📚', href: '/support/help',                    title: 'Help center',  desc: 'Browse common questions' },
  { icon: '💬', href: 'https://wa.me/+2348065417518',                   title: 'Live chat',    desc: 'Available 9 AM – 6 PM EST' },
  { icon: '📧', href: 'mailto:support@cuddlemate.com',    title: 'Email us',     desc: 'Response within 24 hours' },
  { icon: '📞', href: 'tel:+2348065417518',               title: 'Call us',      desc: '+234 806 541 7518' },
]

const faqs = [
  { q: 'How do I reset my password?',     a: "Go to Settings › Security › Change Password. You'll need to verify your email first." },
  { q: 'How long does verification take?', a: "Photo verification typically takes 15–30 minutes. We'll notify you once approved." },
  { q: 'Can I pause my account?',         a: 'Yes! Go to Settings › Account › Pause Account. Your profile will be hidden but not deleted.' },
  { q: 'How do I report a user?',         a: 'Tap the three dots on their profile and select "Report". We review all reports within 24 hours.' },
]

export default function ContactPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [message, setMessage]                   = useState('')
  const [name, setName]                         = useState('')
  const [email, setEmail]                       = useState('')
  const [showSuccess, setShowSuccess]           = useState(false)
  const [expandedFAQ, setExpandedFAQ]           = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const isFormValid = selectedCategory && message && name && email

  useEffect(() => {
    if (showSuccess && modalRef.current) {
      modalRef.current.style.transform  = 'scale(0) translateY(20px)'
      modalRef.current.style.opacity    = '0'
      modalRef.current.style.transition = 'none'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease'
          modalRef.current.style.transform  = 'scale(1) translateY(0)'
          modalRef.current.style.opacity    = '1'
        }
      }))
    }
  }, [showSuccess])

  const handleSubmit = () => {
    if (!isFormValid) return
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedCategory('')
      setMessage('')
      setName('')
      setEmail('')
    }, 3200)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --pk:       #e8527a;
          --pk-deep:  #b5214e;
          --pk-soft:  #f093aa;
          --pk-ghost: rgba(239, 235, 236, 0.08);
          --pk-rim:   rgba(245, 240, 241, 0.28);
          --surface:  rgba(241, 239, 239, 0.04);
          --rim:      rgba(255,255,255,0.07);
          --rim2:     rgba(255,255,255,0.12);
          --txt:      rgba(255,255,255,0.82);
          --txt2:     rgba(255,255,255,0.42);
          --txt3:     rgba(255,255,255,0.22);
          --bg:       #0a0308;
        }

        /* ── Root ── */
        .cp { min-height: 100svh; background: var(--bg); font-family: 'Outfit', sans-serif; position: relative; overflow-x: hidden; color: var(--txt); }

        /* ── Animated mesh background ── */
        .cp-mesh {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 700px 600px at -10% -10%, #5a0a28 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 110% 10%,  #2a0518 0%, transparent 55%),
            radial-gradient(ellipse 400px 500px at 80%  90%,  #3d0820 0%, transparent 55%),
            radial-gradient(ellipse 300px 300px at 20%  80%,  #1a0210 0%, transparent 60%);
          animation: meshShift 20s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0%   { opacity: 1; }
          50%  { opacity: 0.75; }
          100% { opacity: 1; }
        }

        /* grid lines */
        .cp-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.04;
          background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* grain */
        .cp-grain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* glow orb that tracks hero */
        .cp-orb {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,82,122,0.12) 0%, transparent 70%);
          top: -200px; left: 50%; transform: translateX(-50%);
          pointer-events: none; z-index: 0;
          animation: orbPulse 6s ease-in-out infinite;
        }
        @keyframes orbPulse {
          0%,100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50%      { transform: translateX(-50%) scale(1.15); opacity: 0.7; }
        }

        /* ── Header ── */
        .cp-hdr {
          position: sticky; top: 0; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 60px;
          background: rgba(10,3,8,0.8);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--rim);
        }
        .cp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .cp-logo-gem {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, var(--pk), var(--pk-deep));
          clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .cp-logo-gem::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%);
        }
        .cp-logo-gem span { font-size: 9px; font-weight: 600; color: #fff; letter-spacing: 0.05em; position: relative; z-index: 1; }
        .cp-logo-name { font-family: 'Playfair Display', serif; font-size: 16px; color: rgba(255,255,255,0.9); }
        .cp-hdr-tag {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--pk); padding: 5px 14px; border-radius: 20px;
          border: 1px solid var(--pk-rim); background: var(--pk-ghost);
        }
        .cp-hdr-back {
          font-size: 13px; color: var(--txt2); text-decoration: none;
          display: flex; align-items: center; gap: 6px; transition: color 0.2s;
        }
        .cp-hdr-back:hover { color: var(--txt); }

        /* ── Main ── */
        .cp-main { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; padding: 0 1.5rem 6rem; }

        /* ── Hero ── */
        .cp-hero {
          padding: 5rem 0 3.5rem; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .cp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--pk); border: 1px solid var(--pk-rim); background: var(--pk-ghost);
          padding: 6px 16px; border-radius: 20px; margin-bottom: 1.75rem;
        }
        .cp-hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--pk); display: block; animation: badgePing 2s ease-in-out infinite; }
        @keyframes badgePing { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
        .cp-hero h1 {
          font-family: 'Playfair Display', serif; font-weight: 700;
          font-size: clamp(38px, 6vw, 58px); line-height: 1.1;
          color: #fff; margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .cp-hero h1 em { color: var(--pk); font-style: italic; }
        .cp-hero p { font-size: 15px; color: var(--txt2); line-height: 1.75; max-width: 400px; }

        /* ── Quick channels ── */
        .cp-channels {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
          margin-bottom: 2rem;
        }
        .cp-ch {
          display: flex; flex-direction: column;
          background: var(--surface); border: 1px solid var(--rim);
          border-radius: 16px; padding: 1.25rem 1rem;
          text-decoration: none; cursor: pointer;
          transition: border-color 0.22s, background 0.22s, transform 0.18s;
          position: relative; overflow: hidden;
        }
        .cp-ch::before {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(135deg, var(--pk-ghost) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.22s;
        }
        .cp-ch:hover { border-color: var(--pk-rim); transform: translateY(-2px); }
        .cp-ch:hover::before { opacity: 1; }
        .cp-ch-icon { font-size: 22px; margin-bottom: 0.85rem; }
        .cp-ch-title { font-size: 13px; font-weight: 600; color: var(--txt); margin-bottom: 3px; }
        .cp-ch-desc  { font-size: 11px; color: var(--txt3); line-height: 1.5; }

        /* divider */
        .cp-divider {
          display: flex; align-items: center; gap: 14px; margin-bottom: 2rem;
        }
        .cp-divider::before, .cp-divider::after { content: ''; flex: 1; height: 1px; background: var(--rim); }
        .cp-divider span { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--txt3); white-space: nowrap; }

        /* ── Main card ── */
        .cp-card {
          background: var(--surface); border: 1px solid var(--rim);
          border-radius: 24px; padding: 2.25rem;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          margin-bottom: 1.25rem;
          position: relative; overflow: hidden;
        }
        .cp-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(232,82,122,0.4) 50%, transparent 100%);
        }
        .cp-card-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
        .cp-card-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: var(--pk-ghost); border: 1px solid var(--pk-rim);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .cp-card-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #fff; }
        .cp-card-sub   { font-size: 12px; color: var(--txt3); margin-top: 2px; }

        /* ── Category grid ── */
        .cp-section-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--pk); margin-bottom: 10px; display: block;
        }
        .cp-cats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 2rem; }
        .cp-cat {
          display: flex; align-items: center; gap: 10px;
          border-radius: 12px; border: 1px solid var(--rim);
          background: rgba(255,255,255,0.02); padding: 11px 14px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          position: relative;
        }
        .cp-cat:hover { border-color: rgba(232,82,122,0.22); background: var(--pk-ghost); }
        .cp-cat.active { border-color: var(--pk-rim); background: var(--pk-ghost); }
        .cp-cat-ico { font-size: 14px; flex-shrink: 0; }
        .cp-cat-lbl { font-size: 12px; font-weight: 500; color: var(--txt2); flex: 1; }
        .cp-cat.active .cp-cat-lbl { color: var(--txt); }
        .cp-cat-dot {
          width: 18px; height: 18px; border-radius: 50;
          background: linear-gradient(135deg, var(--pk), var(--pk-deep));
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border-radius: 50%;
        }

        /* ── Fields ── */
        .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 1.25rem; }
        .cp-field { margin-bottom: 1.25rem; }
        .cp-lbl {
          display: block; font-size: 10px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--pk); margin-bottom: 7px;
        }
        .cp-inp-wrap {
          display: flex; align-items: center; height: 48px;
          background: rgba(255,255,255,0.04); border: 1px solid var(--rim);
          border-radius: 12px; padding: 0 14px; gap: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .cp-inp-wrap:focus-within { border-color: var(--pk-rim); background: var(--pk-ghost); }
        .cp-inp-wrap input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; color: #fff; font-family: 'Outfit', sans-serif; min-width: 0;
        }
        .cp-inp-wrap input::placeholder { color: var(--txt3); }
        .cp-inp-ico { flex-shrink: 0; color: var(--txt3); }
        .cp-ta-wrap {
          background: rgba(255,255,255,0.04); border: 1px solid var(--rim);
          border-radius: 12px; padding: 12px 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .cp-ta-wrap:focus-within { border-color: var(--pk-rim); background: var(--pk-ghost); }
        .cp-ta-wrap textarea {
          width: 100%; background: transparent; border: none; outline: none;
          font-size: 14px; color: #fff; font-family: 'Outfit', sans-serif;
          resize: none; line-height: 1.65;
        }
        .cp-ta-wrap textarea::placeholder { color: var(--txt3); }
        .cp-hint { margin-top: 6px; font-size: 11px; color: var(--txt3); }

        /* char counter */
        .cp-ta-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
        .cp-counter { font-size: 11px; color: var(--txt3); }

        /* ── Attachment ── */
        .cp-attach {
          display: flex; align-items: center; gap: 14px;
          border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;
          padding: 14px 16px; cursor: pointer; margin-bottom: 1.75rem;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }
        .cp-attach:hover { border-color: var(--pk-rim); background: var(--pk-ghost); }
        .cp-attach input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .cp-attach-ico { font-size: 20px; flex-shrink: 0; }
        .cp-attach-body { flex: 1; }
        .cp-attach-body .at { font-size: 13px; font-weight: 500; color: var(--txt2); margin-bottom: 2px; }
        .cp-attach-body .as { font-size: 11px; color: var(--txt3); }
        .cp-attach-cta {
          padding: 6px 14px; border-radius: 8px;
          border: 1px solid var(--rim2); background: rgba(255,255,255,0.04);
          font-size: 11px; font-weight: 500; color: var(--txt2);
          font-family: 'Outfit', sans-serif; cursor: pointer; flex-shrink: 0;
          transition: background 0.2s, color 0.2s; pointer-events: none;
        }

        /* ── Progress indicator ── */
        .cp-progress { margin-bottom: 1.75rem; }
        .cp-progress-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
        .cp-progress-fill { height: 100%; background: linear-gradient(90deg, var(--pk-deep), var(--pk)); border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
        .cp-progress-label { font-size: 11px; color: var(--txt3); display: flex; justify-content: space-between; }
        .cp-progress-label span:last-child { color: var(--pk); }

        /* ── Submit ── */
        .cp-submit {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, var(--pk), var(--pk-deep));
          border: none; border-radius: 14px; color: #fff;
          font-size: 15px; font-weight: 600; font-family: 'Outfit', sans-serif;
          cursor: pointer; letter-spacing: 0.02em;
          transition: opacity 0.2s, transform 0.15s;
          position: relative; overflow: hidden;
        }
        .cp-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
        }
        .cp-submit::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0); transition: background 0.2s;
        }
        .cp-submit:hover:not(:disabled)::after { background: rgba(255,255,255,0.08); }
        .cp-submit:active:not(:disabled) { transform: scale(0.98); }
        .cp-submit:disabled {
          background: rgba(255,255,255,0.06); color: var(--txt3); cursor: not-allowed;
        }
        .cp-submit:disabled::before { display: none; }

        /* ── FAQ ── */
        .cp-faqs { display: flex; flex-direction: column; gap: 8px; }
        .cp-faq-item { border: 1px solid var(--rim); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .cp-faq-item:has(.open) { border-color: var(--pk-rim); }
        .cp-faq-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 15px 18px; background: transparent; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; text-align: left;
          transition: background 0.15s;
        }
        .cp-faq-btn:hover { background: rgba(255,255,255,0.025); }
        .cp-faq-q { font-size: 13px; font-weight: 500; color: var(--txt); flex: 1; margin-right: 12px; }
        .cp-faq-chevron {
          width: 20px; height: 20px; border-radius: 50%;
          border: 1px solid var(--rim2); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 0.25s, border-color 0.25s, background 0.25s;
        }
        .cp-faq-chevron.open { transform: rotate(180deg); border-color: var(--pk-rim); background: var(--pk-ghost); }
        .cp-faq-chevron svg { display: block; }
        .cp-faq-a {
          padding: 0 18px 16px; font-size: 13px; color: var(--txt2); line-height: 1.7;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 12px;
        }

        /* ── Contact footer ── */
        .cp-footer { text-align: center; padding: 2rem 0 0; }
        .cp-footer-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--txt3); margin-bottom: 1rem; }
        .cp-footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin-bottom: 12px; }
        .cp-footer-links a {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: var(--txt2); text-decoration: none;
          transition: color 0.15s;
        }
        .cp-footer-links a:hover { color: var(--pk-soft); }
        .cp-footer-hrs { font-size: 12px; color: var(--txt3); }

        /* ── Success modal ── */
        .cp-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          padding: 1.5rem;
        }
        .cp-modal {
          width: 100%; max-width: 340px;
          background: #150b10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px; padding: 2.75rem 2rem 2.25rem;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,82,122,0.12);
          position: relative; overflow: hidden;
        }
        .cp-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,82,122,0.5), transparent);
        }
        .cp-modal-check {
          width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 1.5rem;
          background: radial-gradient(circle at 40% 40%, rgba(94,201,122,0.2), rgba(94,201,122,0.05));
          border: 1px solid rgba(94,201,122,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .cp-modal h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: #fff; margin-bottom: 10px; }
        .cp-modal p  { font-size: 13px; color: var(--txt2); line-height: 1.7; }
        .cp-modal-close { margin-top: 1.5rem; font-size: 11px; color: var(--txt3); }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .cp-channels { grid-template-columns: 1fr 1fr; }
          .cp-cats      { grid-template-columns: 1fr 1fr; }
          .cp-row       { grid-template-columns: 1fr; }
          .cp-card      { padding: 1.5rem; }
          .cp-hdr       { padding: 0 1rem; }
          .cp-hero h1   { font-size: 36px; }
        }
        @media (max-width: 400px) {
          .cp-channels { grid-template-columns: 1fr; }
          .cp-cats     { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cp">
        <div className="cp-mesh" />
        <div className="cp-grid" />
        <div className="cp-grain" />
        <div className="cp-orb" />

        {/* ── Header ── */}
        <header className="cp-hdr">
          <Link href="/" className="cp-logo">
            <div className="cp-logo-gem"><span>cm</span></div>
            <span className="cp-logo-name">CuddleMatte</span>
          </Link>
          <span className="cp-hdr-tag">Support</span>
          <Link href="/support/help" className="cp-hdr-back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Help center
          </Link>
        </header>

        <main className="cp-main">
          {/* ── Hero ── */}
          <section className="cp-hero">
            <div className="cp-hero-badge">Support &amp; contact</div>
            <h1>We are here<br />to <em>help you</em></h1>
            <p>Have a question or need assistance? Choose how you'd like to reach us and we'll get back to you promptly.</p>
          </section>

          {/* ── Channels ── */}
          <div className="cp-channels">
            {quickHelp.map((item, i) => (
              <Link key={i} href={item.href} className="cp-ch">
                <span className="cp-ch-icon">{item.icon}</span>
                <p className="cp-ch-title">{item.title}</p>
                <p className="cp-ch-desc">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="cp-divider"><span>Or send us a message</span></div>

          {/* ── Contact form card ── */}
          <div className="cp-card">
            <div className="cp-card-hdr">
              <div className="cp-card-icon">✉️</div>
              <div>
                <h2 className="cp-card-title">Send a message</h2>
                <p className="cp-card-sub">We reply within 24 hours</p>
              </div>
            </div>

            {/* Progress */}
            {(() => {
              const filled = [selectedCategory, name, email, message].filter(Boolean).length
              const pct = Math.round((filled / 4) * 100)
              return (
                <div className="cp-progress">
                  <div className="cp-progress-track">
                    <div className="cp-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="cp-progress-label">
                    <span>Form completion</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              )
            })()}

            {/* Category */}
            <span className="cp-section-label">What can we help with?</span>
            <div className="cp-cats">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`cp-cat${active ? ' active' : ''}`}
                  >
                    <span className="cp-cat-ico">{cat.icon}</span>
                    <span className="cp-cat-lbl">{cat.label}</span>
                    {active && (
                      <span className="cp-cat-dot">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <polyline points="1.5,4 3.5,6 6.5,2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Name + Email */}
            <div className="cp-row">
              <div>
                <label className="cp-lbl">Your name</label>
                <div className="cp-inp-wrap">
                  <svg className="cp-inp-ico" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="cp-lbl">Email address</label>
                <div className="cp-inp-wrap">
                  <svg className="cp-inp-ico" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 6L8 10.5L15 6" stroke="currentColor" strokeWidth="1.4"/>
                  </svg>
                  <input type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="cp-field">
              <label className="cp-lbl">Your message</label>
              <div className="cp-ta-wrap">
                <textarea
                  placeholder="Tell us what's on your mind — the more detail, the better..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="cp-ta-footer">
                <p className="cp-hint">Please be as specific as possible</p>
                <span className="cp-counter">{message.length} / 1000</span>
              </div>
            </div>

            {/* Attachment */}
            <div className="cp-attach">
              <input type="file" accept="image/*,.pdf" />
              <span className="cp-attach-ico">📎</span>
              <div className="cp-attach-body">
                <p className="at">Attach screenshots (optional)</p>
                <p className="as">PNG, JPG or PDF — up to 10 MB</p>
              </div>
              <span className="cp-attach-cta">Browse</span>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!isFormValid} className="cp-submit">
              {isFormValid ? 'Send message →' : 'Complete all fields to continue'}
            </button>
          </div>

          {/* ── FAQ ── */}
          <div className="cp-card">
            <div className="cp-card-hdr">
              <div className="cp-card-icon">❓</div>
              <div>
                <h2 className="cp-card-title">Common questions</h2>
                <p className="cp-card-sub">Quick answers before you reach out</p>
              </div>
            </div>
            <div className="cp-faqs">
              {faqs.map((faq, i) => (
                <div key={i} className="cp-faq-item">
                  <button className="cp-faq-btn" onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}>
                    <span className="cp-faq-q">{faq.q}</span>
                    <span className={`cp-faq-chevron${expandedFAQ === i ? ' open' : ''}`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2.5 4L5 6.5L7.5 4" stroke={expandedFAQ === i ? '#e8527a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  {expandedFAQ === i && <div className="cp-faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="cp-footer">
            <p className="cp-footer-eyebrow">Need immediate help?</p>
            <div className="cp-footer-links">
              <a href="mailto:support@cuddlematte.com"><span>📧</span> support@cuddlematte.com</a>
              <a href="tel:+2348065417518"><span>📞</span> +234 806 541 7518</a>
            </div>
            <p className="cp-footer-hrs">Monday – Friday · 9:00 AM – 6:00 PM EST</p>
          </div>
        </main>

        {/* ── Success modal ── */}
        {showSuccess && (
          <div className="cp-overlay">
            <div ref={modalRef} className="cp-modal">
              <div className="cp-modal-check">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <polyline points="22,6 10,18 4,13" stroke="#5ec97a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Message sent!</h3>
              <p>We have received your message and will get back to you within 24 hours. Check your inbox for a confirmation.</p>
              <p className="cp-modal-close">This window will close automatically.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
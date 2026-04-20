import React from "react";

const socials = [
  {
    name: "facebook",
    handle: "@username",
    url: "https://facebook.com/cuddlematte",
    color: "#ffffff",
    bg: "#1877f2",
    description: "Community page",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    handle: "@cuddlematte",
    url: "https://x.com/cuddlematte",
    color: "#e7e9ea",
    bg: "#000000",
    description: "Thoughts & updates",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "whatsapp",
    handle: "@cuddlematte",
    url: "https://wa.me/+2348065417518",
    color: "#ffffff",
    bg: "#25d366",
    description: "Chat & support",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.537 0-2.852-.428-4.3-2.286-.422-.505-.746-1.093-.746-1.93 0-2.467 2.009-4.476 4.476-4.476 1.2 0 2.33.429 3.242 1.21 1.817 1.538 3.103 3.931 3.103 6.592 0 1.2-.429 2.33-1.21 3.243-1.538 1.817-3.932 3.103-6.592 3.103-.948 0-1.865-.159-2.734-.447-1.447.408-2.873 1.24-3.878 2.288-1.24 1.333-1.922 3.111-1.922 4.967 0 2.003 1.104 3.876 2.859 4.835l-.732 2.184c-.26.78.064 1.636.82 1.913l.066.022c.717.235 1.479.036 1.905-.516l1.866-2.319c.945.2 1.94.3 2.947.3 2.467 0 4.687-1.016 6.267-2.659 1.826-1.816 3.104-4.33 3.104-7.096 0-2.467-1.016-4.687-2.659-6.267-1.816-1.826-4.33-3.104-7.096-3.104" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@cuddlematte",
    url: "https://instagram.com/cuddlematte",
    color: "#ffffff",
    bg: "linear-gradient(135deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d, #f56040, #f77737, #fcaf45, #ffdc80)",
    description: "Visual stories",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
 
 
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #1a1a1a;
          --paper: #fff5fa;
          --accent: #f9089c;
          --muted: #999;
          --border: #f0d5e6;
        }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
        }

        .page {
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }

        /* — Header — */
        .header {
          margin-bottom: 72px;
          position: relative;
        }

        .header::after {
          content: '';
          display: block;
          width: 48px;
          height: 3px;
          background: var(--accent);
          margin-top: 28px;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 10vw, 80px);
          line-height: 0.95;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .title em {
          font-style: italic;
          background: linear-gradient(135deg, #f9089c, #fb0567);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bio {
          margin-top: 28px;
          font-size: 13px;
          line-height: 1.8;
          color: var(--muted);
          max-width: 420px;
        }

        /* — Grid — */
        .grid-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .grid-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        @media (max-width: 480px) {
          .grid { grid-template-columns: 1fr; }
        }

        /* — Card — */
        .card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 22px;
          background: #fff;
          border: 1px solid #f0d5e6;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.22s ease;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f9089c, #fb0567);
          transform: translateX(-100%);
          transition: transform 0.22s ease;
          z-index: 0;
          opacity: 0.08;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249, 8, 156, 0.2);
          border-color: #f9089c;
          z-index: 1;
        }

        .card:hover::before {
          transform: translateX(0);
        }

        .icon-wrap {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          background: var(--icon-bg);
          color: var(--icon-color);
          box-shadow: 0 2px 8px var(--icon-shadow);
        }

        .card-body {
          position: relative;
          z-index: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-handle {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-desc {
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--border);
          margin-top: 6px;
        }

        .arrow {
          margin-left: auto;
          flex-shrink: 0;
          color: var(--border);
          font-size: 16px;
          transition: transform 0.18s ease, color 0.18s ease;
          position: relative;
          z-index: 1;
        }

        .card:hover .arrow {
          transform: translate(3px, -3px);
          color: var(--ink);
        }

        /* — Footer note — */
        .footnote {
          margin-top: 56px;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--border);
          text-align: center;
        }
      `}</style>

      <main className="page">
        <header className="header">
          <p className="eyebrow">About & Connect</p>
          <h1 className="title">
            cuddle<br /><em>matte.</em>
          </h1>
          <p className="bio">
            Cuddle Matte is a passion project dedicated to creating a safe, inclusive, and supportive space for everyone. We believe in the power of community and connection, and we&apos;re here to help you navigate your journey with care and compassion.
          </p>
        </header>

        <p className="grid-label">Platforms</p>

        <div className="grid">
          {socials.map((s) => {
            const shadowColor = typeof s.bg === "string" && s.bg.startsWith("#") ? s.bg + "55" : "rgba(0,0,0,0.15)";
            return (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{
                "--icon-bg": s.bg,
                "--icon-color": s.color,
                "--icon-shadow": shadowColor,
              } as React.CSSProperties}
            >
              <span className="icon-wrap">
                {s.icon}
              </span>
              <span className="card-body">
                <span className="card-name">{s.name}</span>
                <span className="card-handle">{s.handle}</span>
                <span className="card-desc">{s.description}</span>
              </span>
              <span className="arrow">↗</span>
            </a>
            );
          })}
        </div>

        <p className="grid-label" style={{ marginTop: "56px" }}>Support</p>

        <div className="grid">
          <a
            href="mailto:support@cuddlematte.com"
            className="card"
            style={{
              "--icon-bg": "linear-gradient(135deg, #f9089c 0%, #fb0567 100%)",
              "--icon-color": "#fff",
              "--icon-shadow": "rgba(249, 8, 156, 0.35)",
            } as React.CSSProperties}
          >
            <span className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </span>
            <span className="card-body">
              <span className="card-name">Email Support</span>
              <span className="card-handle">support@cuddlematte.com</span>
              <span className="card-desc">Get Help & Queries</span>
            </span>
            <span className="arrow">↗</span>
          </a>

          <a
            href="tel:+2348065417518"
            className="card"
            style={{
              "--icon-bg": "linear-gradient(135deg, #f9089c 0%, #fb0567 100%)",
              "--icon-color": "#fff",
              "--icon-shadow": "rgba(249, 8, 156, 0.35)",
            } as React.CSSProperties}
          >
            <span className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M17.92 7.02C17.45 6.18 16.51 5.55 15.5 5.55c-2.37 0-5.44 3.06-6.54 4.09-.23.23-.38.57-.38.95 0 .38.15.72.38.95 1.1 1.03 4.17 4.09 6.54 4.09 1.01 0 1.95-.63 2.42-1.44l2.03 2.03c.71.71 1.86.71 2.57 0l1.41-1.41c.71-.71.71-1.86 0-2.57L17.92 7.02zM16 9c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2z" />
              </svg>
            </span>
            <span className="card-body">
              <span className="card-name">Call Us</span>
              <span className="card-handle">+234 806-541-7518</span>
              <span className="card-desc">Chat & Support</span>
            </span>
            <span className="arrow">↗</span>
          </a>
        </div>

        <p className="footnote">All links open in a new tab</p>
      </main>
    </>
  );
}
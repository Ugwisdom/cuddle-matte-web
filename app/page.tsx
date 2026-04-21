import React from 'react'
import './globals.css'
import Link from 'next/link'

export default function Page() {
  return (
    <>
    
      {/* NAVBAR */}
      <nav className="cm-nav">
        <a href="#" className="cm-logo">cuddlematte</a>
        <ul className="cm-nav-links">
          <li><a href="#download">Download</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="/support/contact">Contact</a></li>
          <li><a href="/support/about">About</a></li>
        </ul>
        <div className="cm-nav-right">
          <Link href="/auth/login" className="cm-btn-login" >LOG IN</Link>
          <Link href="/auth/signup" className="cm-btn-signup">Create Account</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cm-hero">
        <div className="cm-hero-content">
          <h1 className="cm-hero-title">
            Welcome to <br /><span>Cuddle Matte</span>
          </h1>
          <p className="cm-hero-sub">
            No. 1 dating and meetup platform where you can connect with like-minded people and find your perfect match!
          </p>
          <div className="cm-hero-ctas">
            
            
            <Link href="/auth/signup" className="cm-cta cm-cta-email">GET STARTED</Link>
          </div>
          <p className="cm-tos">
            By tapping Sign Up, you agree to our <a href="#">Terms</a>. See our <a href="#">Privacy Policy</a> and <a href="#">Cookie Policy</a>.
          </p>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="cm-band">
        {[['75M+','Active Members'],['190+','Countries'],['1.5B','Swipes per Day'],['4M+','Dates per Week']].map(([n,l]) => (
          <div className="cm-stat" key={l}><div className="cm-stat-num">{n}</div><div className="cm-stat-lbl">{l}</div></div>
        ))}
      </div>

      {/* FEATURES */}
      <section id='features' className="cm-features">
        <div className="cm-eyebrow">The Cuddlematte Way</div>
        <h2 className="cm-h2">Designed for real connections.</h2>
        <p className="cm-desc">Every feature is built around one goal — helping you find someone genuinely worth your time.</p>
        <div className="cm-feat-grid">
          {[
            ['✨','Smart Matches','Our algorithm learns your preferences and surfaces people you\'ll actually want to meet.'],
            ['🛡️','Safe & Verified','Photo verification and safety features so you always know who you\'re talking to.'],
            ['💬','Better Conversations','Icebreaker prompts and shared interests give you something real to talk about.'],
            ['🌍','Local or Global','Meet someone in your neighbourhood or discover connections while you travel.'],
            ['🎯','Intentional Dating','Set what you\'re looking for — casual, serious, or something new.'],
            ['⚡','Boost Your Profile','Get seen by the right people at the right time with smart profile boosts.'],
          ].map(([icon, title, desc]) => (
            <div className="cm-feat" key={String(title)}>
              <div className="cm-feat-icon">{icon}</div>
              <div className="cm-feat-title">{title}</div>
              <div className="cm-feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPLIT 1 */}
      <section className="cm-split">
        <div className="cm-visual">
          <div className="cm-phone">
            <div className="cm-phone-notch" />
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80" alt="profile" />
            <div className="cm-phone-grad" />
            <div className="cm-phone-info">
              <div className="cm-phone-name">Amara, 26</div>
              <div className="cm-phone-loc">📍 Lagos · 2 km away</div>
              <div className="cm-phone-btns">
                <button className="cm-pbn cm-pbn-x">✕</button>
                <button className="cm-pbn cm-pbn-h">♥</button>
              </div>
            </div>
          </div>
          <div className="cm-badge cm-badge-match">💘 It&apos;s a Match!</div>
          <div className="cm-badge cm-badge-liked">💚 Liked you</div>
        </div>
        <div>
          <div className="cm-eyebrow">Swipe Smart</div>
          <h2 className="cm-h2">Every swipe brings you closer.</h2>
          <p className="cm-desc">Cuddlematte shows you real, verified profiles and learns what you love. The more you use it, the better it gets.</p>
          <a href="#" className="cm-link">Start swiping →</a>
        </div>
      </section>

      {/* SPLIT 2 */}
      <div className="cm-split-bg">
        <section  id='safety' className="cm-split cm-split-safe">
          <div>
            <div className="cm-eyebrow">Stay Safe</div>
            <h2 className="cm-h2">Your safety is our priority.</h2>
            <p className="cm-desc">We've built safety into every layer of the app — from photo verification to emergency support. Date with confidence.</p>
            <a href="#" className="cm-link">Learn about safety →</a>
          </div>
          <div className="cm-visual">
            <div className="cm-phone">
              <div className="cm-phone-notch" />
              <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=600&q=80" alt="profile" />
              <div className="cm-phone-grad" />
              <div className="cm-phone-info">
                <div className="cm-phone-name">Chisom, 28</div>
                <div className="cm-phone-loc">📍 Abuja · 5 km away</div>
                <div className="cm-phone-btns">
                  <button className="cm-pbn cm-pbn-x">✕</button>
                  <button className="cm-pbn cm-pbn-h">♥</button>
                </div>
              </div>
            </div>
            <div className="cm-badge cm-badge-verified">🔒 Verified Profile</div>
          </div>
        </section>
      </div>

      {/* TESTIMONIALS */}
      <section id='testimonials' className="cm-testi">
        <div className="cm-testi-inner">
          <div className="cm-eyebrow">Love Stories</div>
          <h2 className="cm-h2">They found each other here.</h2>
          <div className="cm-testi-grid">
            {[
              {q:"I'd almost given up on dating apps. Cuddlematte was different — we matched on a Tuesday and by Thursday we were on our first date. That was 8 months ago.",name:'Tolu A.',loc:'Lagos',img:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&q=80'},
              {q:"all I wanted was a quick hookup so we connected, exchanged numbers and less than an hour later she was on my bed.",name:'Emeka O.',loc:'Abuja',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80'},
              {q:"Safe, genuine, and refreshingly real. Found someone who actually matches my energy. Deleted the app happily after two months.",name:'Chidinma N.',loc:'Port Harcourt',img:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80'},
            ].map(t => (
              <div className="cm-tc" key={t.name}>
                <div className="cm-tc-stars">★★★★★</div>
                <p className="cm-tc-q">"{t.q}"</p>
                <div className="cm-tc-author">
                  <img className="cm-tc-img" src={t.img} alt={t.name} />
                  <div><div className="cm-tc-name">{t.name}</div><div className="cm-tc-loc">{t.loc}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id='download' className="cm-dl">
        <div className="cm-dl-inner">
          <div className="cm-eyebrow">Get the App</div>
          <h2 className="cm-dl-title">Your person is already on cuddlematte.</h2>
          <p className="cm-dl-sub">Free to download. Free to match. Join millions of people finding real connections every day.</p>
          <div className="cm-store-row">
            <a href="#" className="cm-store">
              <span className="cm-store-icon">🍎</span>
              <span><span className="cm-store-sub">Download on the</span><span className="cm-store-name">App Store</span></span>
            </a>
            <a href="#" className="cm-store">
              <span className="cm-store-icon">▶</span>
              <span><span className="cm-store-sub">Get it on</span><span className="cm-store-name">Google Play</span></span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
     {/* FOOTER */}
<footer className="cm-footer">
  <div className="cm-footer-top">
    <div>
      <span className="cm-footer-brand">cuddlematte</span>
      <p className="cm-footer-tagline">No. 1 dating and meetup platform where you can connect with like-minded people and find your perfect match.</p>
    </div>
    <div>
      <div className="cm-footer-col-title">Company</div>
      <ul className="cm-footer-ul">
        <li><Link href="/support/about">About Us</Link></li>
        <li><Link href="https://instagram.com/cuddlematte">Careers</Link></li>
        <li><Link href="https://instagram.com/cuddlematte">Press</Link></li>
        <li><Link href="https://instagram.com/cuddlematte">Blog</Link></li>
      </ul>
    </div>
    <div>
      <div className="cm-footer-col-title">Legal</div>
      <ul className="cm-footer-ul">
        <li><Link href="/support/privacy">Privacy Policy</Link></li>
        <li><Link href="/support/terms">Terms of Service</Link></li>
        <li><Link href="/support/privacy">Cookie Policy</Link></li>
        <li><Link href="/support/safety">Safety Tips</Link></li>
      </ul>
    </div>
    <div>
      <div className="cm-footer-col-title">Support</div>
      <ul className="cm-footer-ul">
        <li><Link href="/support/help">Help Center</Link></li>
        <li><Link href="/support/contact">Contact Us</Link></li>
        <li><Link href="/support/community">Community</Link></li>
        
      </ul>
    </div>
  </div>
  <div className="cm-footer-bottom">
    <span>© 2026 Cuddlematte Inc. All rights reserved.</span>
    <div className="cm-socials">
      <a href="https://x.com/cuddlematte" target="_blank" rel="noopener noreferrer" className="cm-soc">𝕏</a>
      <a href="https://instagram.com/cuddlematte" target="_blank" rel="noopener noreferrer" className="cm-soc">in</a>
      <a href="https://facebook.com/cuddlematte" target="_blank" rel="noopener noreferrer" className="cm-soc">f</a>
      <a href="https://tiktok.com/@cuddlematte" target="_blank" rel="noopener noreferrer" className="cm-soc">📸</a>
    </div>
  </div>
</footer>
    </>
  )
}
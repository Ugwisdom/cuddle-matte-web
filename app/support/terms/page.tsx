"use client";

import { useState } from "react";
import Link from "next/link";

type ViewMode = "simple" | "full";

interface TermSection {
  id: number;
  icon: string;
  title: string;
  summary: string;
  content: string[];
  highlight: boolean;
}

const termsData = {
  effectiveDate: "January 1, 2025",
  lastUpdated: "January 1, 2025",
  version: "2.0",
  sections: [
    {
      id: 1,
      icon: "📝",
      title: "Acceptance of Terms",
      summary: "By using CuddleMatte, you agree to these terms",
      content: [
        "By accessing or using the CuddleMatte platform, you agree to be bound by these Terms and Conditions.",
        "If you do not agree with any part of these terms, you must not use our service.",
        "We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.",
        "You are responsible for regularly reviewing these terms.",
        "Your use of the service is also governed by our Privacy Policy and Community Guidelines.",
      ],
      highlight: true,
    },
    {
      id: 2,
      icon: "👤",
      title: "Eligibility & Account",
      summary: "Requirements for creating and maintaining an account",
      content: [
        "You must be at least 18 years old to use CuddleMatte.",
        "You must provide accurate, current, and complete information during registration.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You must not share your account with others or allow others to access your account.",
        "One person may maintain only one account unless explicitly authorized.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
        "You must notify us immediately of any unauthorized use of your account.",
      ],
      highlight: true,
    },
    {
      id: 3,
      icon: "🚫",
      title: "Prohibited Activities",
      summary: "Actions that are not allowed on our platform",
      content: [
        "Harassment, abuse, or threatening behavior toward other users",
        "Posting false, misleading, or fraudulent information",
        "Using the platform for commercial solicitation or advertising",
        "Impersonating another person or entity",
        "Sharing or distributing illegal, harmful, or inappropriate content",
        "Attempting to access other users' accounts or private information",
        "Using automated systems (bots) to interact with the platform",
        "Promoting illegal activities or substances",
        "Exploitation, trafficking, or abuse of any kind",
        "Circumventing any security features or technological measures",
      ],
      highlight: true,
    },
    {
      id: 4,
      icon: "💳",
      title: "Payments & Subscriptions",
      summary: "Billing, payments, and subscription terms",
      content: [
        "Some features require a paid subscription or one-time payment.",
        "All fees are charged in US Dollars unless otherwise specified.",
        "Subscriptions automatically renew unless cancelled before the renewal date.",
        "You can cancel your subscription at any time through your account settings.",
        "Refunds are provided only in accordance with our Refund Policy.",
        "We reserve the right to change pricing with 30 days notice to subscribers.",
        "Failed payments may result in service interruption or account suspension.",
        "All sales are final unless required by law to provide refunds.",
      ],
      highlight: false,
    },
    {
      id: 5,
      icon: "📱",
      title: "User Content & Conduct",
      summary: "Rules about content you post and your behavior",
      content: [
        "You retain ownership of content you post, but grant us a license to use it.",
        "We can use, modify, and display your content to operate and promote the service.",
        "You are responsible for all content you post on the platform.",
        "You must not post content that violates intellectual property rights.",
        "We reserve the right to remove any content that violates these terms.",
        "You must not post nudity, sexually explicit content, or graphic violence.",
        "Content must comply with all applicable laws and regulations.",
        "We may monitor content for compliance but are not obligated to do so.",
      ],
      highlight: false,
    },
    {
      id: 6,
      icon: "🔒",
      title: "Privacy & Data",
      summary: "How we handle your personal information",
      content: [
        "Your use of the service is governed by our Privacy Policy.",
        "We collect and process data as described in our Privacy Policy.",
        "You consent to the collection and use of your data as outlined.",
        "We implement security measures to protect your information.",
        "We may share data with service providers who help operate the platform.",
        "You have rights to access, correct, or delete your personal data.",
        "We retain data as necessary to provide services and comply with legal obligations.",
        "Data may be transferred to and processed in countries outside your residence.",
      ],
      highlight: false,
    },
    {
      id: 7,
      icon: "⚖️",
      title: "Disclaimers & Warranties",
      summary: "Legal limitations and service disclaimers",
      content: [
        'The service is provided "AS IS" without warranties of any kind.',
        "We do not guarantee continuous, error-free, or secure operation.",
        "We are not responsible for the conduct of users on or off the platform.",
        "We do not screen, verify, or investigate users' backgrounds.",
        "You use the service at your own risk and discretion.",
        "We disclaim all warranties, express or implied, including merchantability.",
        "We do not guarantee specific results from using the service.",
        "Technical issues, downtime, or data loss may occur without liability.",
      ],
      highlight: false,
    },
    {
      id: 8,
      icon: "🛡️",
      title: "Limitation of Liability",
      summary: "Limits on our legal responsibility",
      content: [
        "We are not liable for indirect, incidental, or consequential damages.",
        "Our total liability is limited to the amount you paid in the last 12 months.",
        "We are not responsible for third-party content, links, or services.",
        "We are not liable for user conduct or interactions between users.",
        "You agree to indemnify us against claims arising from your use of the service.",
        "Some jurisdictions do not allow certain liability limitations.",
        "Force majeure events (natural disasters, wars, etc.) exempt us from liability.",
        "You assume all risks associated with meeting other users in person.",
      ],
      highlight: false,
    },
    {
      id: 9,
      icon: "🔨",
      title: "Termination",
      summary: "How accounts can be suspended or terminated",
      content: [
        "We may suspend or terminate your account at any time for violations.",
        "You can delete your account at any time through account settings.",
        "Upon termination, your right to use the service immediately ceases.",
        "We may retain certain information as required by law or for legitimate purposes.",
        "Paid subscriptions may not be refunded upon termination for violations.",
        "Termination does not affect provisions that should survive termination.",
        "We are not liable for any damages resulting from account termination.",
        "You remain liable for all obligations incurred before termination.",
      ],
      highlight: false,
    },
    {
      id: 10,
      icon: "📋",
      title: "Intellectual Property",
      summary: "Ownership of content and trademarks",
      content: [
        "CuddleMatte and all related marks are our property or our licensors'.",
        "You may not use our trademarks without express written permission.",
        "All software, design, and content are protected by intellectual property laws.",
        "You are granted a limited, non-exclusive license to use the service.",
        "You may not copy, modify, or create derivative works of our platform.",
        "Unauthorized use may result in termination and legal action.",
        "We respect intellectual property rights and expect users to do the same.",
        "Report copyright violations through our designated process.",
      ],
      highlight: false,
    },
    {
      id: 11,
      icon: "🌍",
      title: "Governing Law & Disputes",
      summary: "Legal jurisdiction and dispute resolution",
      content: [
        "These terms are governed by the laws of [State/Country].",
        "Disputes will be resolved through binding arbitration, not court proceedings.",
        "Arbitration will be conducted under [Arbitration Association] rules.",
        "You waive your right to participate in class action lawsuits.",
        "Small claims court disputes are exempt from arbitration requirement.",
        "Arbitration location will be in [City, State/Country].",
        "Either party may seek injunctive relief in court for certain violations.",
        "Prevailing party in disputes may recover attorney fees and costs.",
      ],
      highlight: false,
    },
    {
      id: 12,
      icon: "📞",
      title: "Contact & Support",
      summary: "How to reach us with questions",
      content: [
        "For questions about these terms, contact us at legal@cuddlematte.com",
        "For technical support, use the in-app help center.",
        "For account issues, contact support@cuddlematte.com",
        "Response times may vary based on inquiry complexity.",
        "We are not obligated to provide customer support but strive to assist.",
        "Business hours: Monday–Friday, 9 AM – 5 PM EST",
        "Mailing address: [Your Business Address]",
        "Emergency safety concerns: Use the in-app emergency report feature",
      ],
      highlight: false,
    },
  ] as TermSection[],
};

const keyPoints = [
  { icon: "18+", text: "Must be 18 or older", color: "#e8392a" },
  { icon: "🚫", text: "Zero tolerance for abuse", color: "#e8392a" },
  { icon: "💳", text: "Auto-renewal subscriptions", color: "#f97316" },
  { icon: "⚖️", text: "Binding arbitration", color: "#2563eb" },
  { icon: "🔒", text: "Data use per Privacy Policy", color: "#16a34a" },
  { icon: "🛡️", text: 'Service provided "AS IS"', color: "#9333ea" },
];

const simpleSections = [
  {
    icon: "✅",
    title: "What You Can Do",
    text: "Connect with verified users, book sessions, chat safely, leave reviews, and build meaningful connections.",
  },
  {
    icon: "❌",
    title: "What You Can't Do",
    text: "Harass others, share explicit content, create fake profiles, spam, or use the service for illegal activities.",
  },
  {
    icon: "💰",
    title: "Payment Terms",
    text: "Subscriptions auto-renew monthly. Cancel anytime. Refunds per our policy. Prices may change with notice.",
  },
  {
    icon: "🔒",
    title: "Your Privacy",
    text: "We protect your data but you control what you share. See Privacy Policy for details on data handling.",
  },
  {
    icon: "⚠️",
    title: "Important Disclaimers",
    text: 'Service provided "as is." We don\'t verify users. Meet safely in public. Use at your own risk.',
  },
];

const footerLinks = [
  "Privacy Policy",
  "Community Guidelines",
  "Cookie Policy",
  "Contact Legal Team",
];

export default function TermsAndConditions() {
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAccept = () => {
    setAccepted(true);
    setShowAcceptModal(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #fdf6f0;
          color: #1a1a1a;
        }

        .page { min-height: 100vh; background: #fdf6f0; }

        /* ── Header ── */
        .header-wrap {
          position: sticky; top: 0; z-index: 50;
          background: rgba(253,246,240,0.93);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8d5c4;
        }
        .header {
          max-width: 860px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
        }
        .icon-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: #fff; border: 1px solid #e8d5c4;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px;
          transition: background .15s;
          text-decoration: none; color: #1a1a1a;
        }
        .icon-btn:hover { background: #f0e6dc; }
        .header-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 700;
          letter-spacing: -.4px; color: #1a1a1a;
        }

        /* ── Main ── */
        .main { max-width: 860px; margin: 0 auto; padding: 0 0 60px; }

        /* ── Hero ── */
        .hero {
          text-align: center;
          padding: 40px 24px 32px;
          background: #fff8f4;
          border-bottom: 1px solid #e8d5c4;
        }
        .hero-icon { font-size: 56px; margin-bottom: 16px; }
        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: 28px; font-weight: 700;
          letter-spacing: -.6px; color: #1a1a1a;
          margin-bottom: 6px;
        }
        .hero-subtitle { font-size: 15px; color: #888; margin-bottom: 18px; }
        .version-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #e8d5c4;
          border-radius: 20px; padding: 7px 16px;
          font-size: 12px; color: #666; font-weight: 500;
        }
        .version-dot { color: #ccc; }

        /* ── Toggle ── */
        .toggle-row {
          display: flex; gap: 12px;
          padding: 20px 20px 0;
        }
        .toggle-btn {
          flex: 1; padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e8d5c4;
          background: #fff;
          font-size: 14px; font-weight: 600;
          color: #777; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .15s, border-color .15s, color .15s;
        }
        .toggle-btn:hover { background: #fdf6f0; }
        .toggle-btn.active {
          background: #e8392a; border-color: #e8392a; color: #fff;
        }

        /* ── Section title ── */
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 700;
          color: #1a1a1a; letter-spacing: -.3px;
          margin-bottom: 6px;
        }
        .section-sub { font-size: 14px; color: #999; margin-bottom: 20px; line-height: 1.55; }

        /* ── Simple view ── */
        .simple-view { padding: 24px 20px 0; }

        .key-points { margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
        .key-card {
          display: flex; align-items: center; gap: 16px;
          background: #fff; border: 1px solid #e8d5c4;
          border-radius: 12px; padding: 14px 16px;
          border-left-width: 4px;
        }
        .key-icon {
          font-size: 20px; width: 32px;
          text-align: center; font-weight: 800;
          flex-shrink: 0;
        }
        .key-text { font-size: 15px; font-weight: 600; color: #1a1a1a; }

        .simple-sections { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .simple-card {
          display: flex; gap: 16px;
          background: #fff; border: 1px solid #e8d5c4;
          border-radius: 14px; padding: 18px;
        }
        .simple-card-icon { font-size: 30px; flex-shrink: 0; }
        .simple-card-title {
          font-family: 'Fraunces', serif;
          font-size: 16px; font-weight: 700;
          color: #1a1a1a; margin-bottom: 6px;
        }
        .simple-card-text { font-size: 14px; color: #666; line-height: 1.6; }

        .view-full-btn {
          display: block; width: 100%;
          padding: 16px 24px;
          background: #fff;
          border: 2px solid #e8392a;
          border-radius: 12px;
          font-size: 16px; font-weight: 600;
          color: #e8392a; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 28px;
          transition: background .12s;
        }
        .view-full-btn:hover { background: #fff5f4; }

        /* ── Full view ── */
        .full-view { padding: 24px 20px 0; }
        .last-updated { font-size: 13px; color: #aaa; font-style: italic; margin-bottom: 20px; }

        .term-section {
          background: #fff;
          border: 1px solid #e8d5c4;
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .term-section.highlight { border-left: 4px solid #e8392a; }

        .term-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px;
          cursor: pointer;
          transition: background .12s;
          border: none; background: transparent;
          width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .term-header:hover { background: #fdf6f0; }

        .term-header-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .term-icon { font-size: 26px; flex-shrink: 0; }
        .term-title {
          font-family: 'Fraunces', serif;
          font-size: 16px; font-weight: 700; color: #1a1a1a;
          margin-bottom: 3px;
        }
        .term-summary { font-size: 13px; color: #999; line-height: 1.4; }
        .expand-icon { font-size: 12px; color: #bbb; margin-left: 12px; flex-shrink: 0; transition: transform .2s; }
        .expand-icon.open { transform: rotate(90deg); }

        .term-content {
          padding: 16px 18px;
          border-top: 1px solid #f2e5d9;
          display: flex; flex-direction: column; gap: 10px;
        }
        .term-item { display: flex; gap: 12px; align-items: flex-start; }
        .term-bullet { color: #e8392a; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .term-text { font-size: 14px; color: #555; line-height: 1.6; }

        /* ── Agreement ── */
        .agreement {
          margin: 28px 20px 24px;
          padding: 28px 24px;
          background: #fff;
          border: 2px solid #e8392a;
          border-radius: 20px;
          text-align: center;
        }
        .agreement-icon { font-size: 48px; margin-bottom: 14px; }
        .agreement-title {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 700;
          color: #1a1a1a; margin-bottom: 12px;
        }
        .agreement-text { font-size: 14px; color: #666; line-height: 1.65; margin-bottom: 22px; }
        .agreement-accepted {
          font-size: 15px; font-weight: 600; color: #16a34a;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 10px; padding: 12px 20px;
        }
        .agreement-btns { display: flex; gap: 12px; }
        .decline-btn {
          flex: 1; padding: 14px;
          border-radius: 12px;
          border: 1px solid #e8d5c4;
          background: #fff;
          font-size: 15px; font-weight: 600;
          color: #777; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .12s;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
        }
        .decline-btn:hover { background: #fdf6f0; }
        .accept-btn {
          flex: 1; padding: 14px;
          border-radius: 12px;
          border: none;
          background: #e8392a;
          font-size: 15px; font-weight: 700;
          color: #fff; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .12s;
        }
        .accept-btn:hover { background: #c9311f; }

        /* ── Footer ── */
        .footer-links { padding: 0 20px 20px; }
        .footer-link {
          display: block; padding: 13px 0;
          border-bottom: 1px solid #f2e5d9;
          font-size: 15px; font-weight: 500;
          color: #e8392a; cursor: pointer;
          text-decoration: none;
          transition: opacity .12s;
        }
        .footer-link:hover { opacity: 0.75; }
        .footer-link:last-child { border-bottom: none; }

        .copyright {
          text-align: center; padding: 16px 20px 0;
          font-size: 12px; color: #bbb;
        }

        /* ── Modal ── */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
        }
        .modal {
          background: #fff; border-radius: 20px;
          padding: 32px 24px; max-width: 360px; width: 100%;
          text-align: center;
        }
        .modal-icon { font-size: 40px; margin-bottom: 12px; }
        .modal-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 700; margin-bottom: 10px;
        }
        .modal-text { font-size: 14px; color: #666; margin-bottom: 22px; line-height: 1.55; }
        .modal-btns { display: flex; gap: 10px; }
        .modal-cancel {
          flex: 1; padding: 13px; border-radius: 12px;
          border: 1px solid #e8d5c4; background: #fff;
          font-size: 15px; font-weight: 600; color: #555;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
        .modal-accept {
          flex: 1; padding: 13px; border-radius: 12px;
          border: none; background: #e8392a;
          font-size: 15px; font-weight: 700; color: #fff;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="header-wrap">
          <div className="header">
            <Link href="/" className="icon-btn">←</Link>
            <span className="header-title">Terms & Conditions</span>
            <button 
              className="icon-btn" 
              title="Download PDF"
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([`CuddleMatte Terms & Conditions\n\nVersion ${termsData.version}\nEffective: ${termsData.effectiveDate}\n\n${termsData.sections.map(s => `${s.title}\n${s.content.join('\n')}`).join('\n\n')}`], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "CuddleMatte_Terms_and_Conditions.txt";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              ⬇️
            </button>
          </div>
        </div>

        <div className="main">
          {/* Hero */}
          <div className="hero">
            <div className="hero-icon">📜</div>
            <div className="hero-title">Terms & Conditions</div>
            <div className="hero-subtitle">CuddleMatte Service Agreement</div>
            <div className="version-pill">
              <span>Version {termsData.version}</span>
              <span className="version-dot">•</span>
              <span>Effective: {termsData.effectiveDate}</span>
            </div>
          </div>

          {/* Toggle */}
          <div className="toggle-row">
            <button
              className={`toggle-btn${viewMode === "simple" ? " active" : ""}`}
              onClick={() => setViewMode("simple")}
            >
              📌 Key Points
            </button>
            <button
              className={`toggle-btn${viewMode === "full" ? " active" : ""}`}
              onClick={() => setViewMode("full")}
            >
              📄 Full Terms
            </button>
          </div>

          {/* Simple View */}
          {viewMode === "simple" && (
            <div className="simple-view">
              <div className="section-title">Quick Overview</div>
              <div className="section-sub">
                Important highlights you should know before using CuddleMatte
              </div>

              <div className="key-points">
                {keyPoints.map((kp, i) => (
                  <div
                    key={i}
                    className="key-card"
                    style={{ borderLeftColor: kp.color }}
                  >
                    <span
                      className="key-icon"
                      style={{ color: kp.color, fontSize: kp.icon === "18+" ? "14px" : "20px" }}
                    >
                      {kp.icon}
                    </span>
                    <span className="key-text">{kp.text}</span>
                  </div>
                ))}
              </div>

              <div className="simple-sections">
                {simpleSections.map((s, i) => (
                  <div key={i} className="simple-card">
                    <span className="simple-card-icon">{s.icon}</span>
                    <div>
                      <div className="simple-card-title">{s.title}</div>
                      <div className="simple-card-text">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="view-full-btn" onClick={() => setViewMode("full")}>
                View Full Legal Terms →
              </button>
            </div>
          )}

          {/* Full View */}
          {viewMode === "full" && (
            <div className="full-view">
              <div className="section-title">Complete Legal Agreement</div>
              <div className="last-updated">Last Updated: {termsData.lastUpdated}</div>

              {termsData.sections.map((section, index) => {
                const isOpen = expandedSections.includes(index);
                return (
                  <div
                    key={section.id}
                    className={`term-section${section.highlight ? " highlight" : ""}`}
                  >
                    <button
                      className="term-header"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="term-header-left">
                        <span className="term-icon">{section.icon}</span>
                        <div>
                          <div className="term-title">{section.title}</div>
                          <div className="term-summary">{section.summary}</div>
                        </div>
                      </div>
                      <span className={`expand-icon${isOpen ? " open" : ""}`}>▶</span>
                    </button>

                    {isOpen && (
                      <div className="term-content">
                        {section.content.map((item, idx) => (
                          <div key={idx} className="term-item">
                            <span className="term-bullet">•</span>
                            <span className="term-text">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Agreement */}
          <div className="agreement">
            <div className="agreement-icon">📋</div>
            <div className="agreement-title">Legal Agreement</div>
            <div className="agreement-text">
              By clicking "I Accept" or by using CuddleMatte, you acknowledge that you
              have read, understood, and agree to be bound by these Terms and Conditions,
              including our Privacy Policy and Community Guidelines.
            </div>
            {accepted ? (
              <div className="agreement-accepted">✅ You have accepted the Terms and Conditions</div>
            ) : (
              <div className="agreement-btns">
                <Link href="/" className="decline-btn">Decline</Link>
                <button className="accept-btn" onClick={() => setShowAcceptModal(true)}>
                  I Accept
                </button>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="footer-links">
            {footerLinks.map((label) => (
              <a key={label} href="#" className="footer-link">
                {label} →
              </a>
            ))}
          </div>

          <div className="copyright">© 2025 CuddleMatte. All rights reserved.</div>
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">📋</div>
            <div className="modal-title">Accept Terms</div>
            <div className="modal-text">
              By accepting, you agree to be bound by these Terms and Conditions.
            </div>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowAcceptModal(false)}>
                Cancel
              </button>
              <button className="modal-accept" onClick={handleAccept}>
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
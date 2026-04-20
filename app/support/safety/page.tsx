"use client";

import { useState } from "react";
import Link from "next/link";

type Category = "all" | "before" | "during" | "after" | "online";
type Priority = "critical" | "high" | "medium";

interface SafetyTip {
  id: number;
  category: string;
  icon: string;
  title: string;
  description: string;
  tips: string[];
  priority: Priority;
}

interface EmergencyContact {
  name: string;
  number: string;
  icon: string;
}

const categories = [
  { id: "all", label: "All Tips", icon: "📋" },
  { id: "before", label: "Before Meeting", icon: "📝" },
  { id: "during", label: "During Date", icon: "☕" },
  { id: "after", label: "After Date", icon: "🏠" },
  { id: "online", label: "Online Safety", icon: "💻" },
];

const safetyTips: SafetyTip[] = [
  {
    id: 1,
    category: "before",
    icon: "🔍",
    title: "Research Your Date",
    description: "Do a quick online search to verify they are who they say they are",
    tips: [
      "Check their social media profiles",
      "Look for mutual connections",
      "Reverse image search their photos",
      "Trust your instincts if something feels off",
    ],
    priority: "high",
  },
  {
    id: 2,
    category: "before",
    icon: "👥",
    title: "Tell Someone Your Plans",
    description: "Always let a friend or family member know where you're going",
    tips: [
      "Share the location, time, and person's name",
      "Send photos of your date's profile",
      "Set up check-in times",
      "Share your live location if possible",
    ],
    priority: "critical",
  },
  {
    id: 3,
    category: "before",
    icon: "📍",
    title: "Choose Public Locations",
    description: "Always meet in a busy, public place for first dates",
    tips: [
      "Popular cafes or restaurants",
      "Public parks during daylight",
      "Shopping centers or museums",
      "Avoid private or isolated locations",
    ],
    priority: "critical",
  },
  {
    id: 4,
    category: "before",
    icon: "🚗",
    title: "Arrange Your Own Transportation",
    description: "Don't rely on your date for rides, especially on first meetings",
    tips: [
      "Drive yourself or use rideshare services",
      "Have enough money for emergency transport",
      "Know public transport routes",
      "Never get in their car on a first date",
    ],
    priority: "high",
  },
  {
    id: 5,
    category: "during",
    icon: "👀",
    title: "Stay Alert & Sober",
    description: "Keep your wits about you during the date",
    tips: [
      "Limit alcohol consumption",
      "Never leave your drink unattended",
      "Watch your drink being prepared",
      "Trust your instincts if you feel uncomfortable",
    ],
    priority: "critical",
  },
  {
    id: 6,
    category: "during",
    icon: "📱",
    title: "Keep Your Phone Charged",
    description: "Ensure you can always call for help or leave",
    tips: [
      "Charge your phone fully before leaving",
      "Bring a portable charger",
      "Keep emergency contacts accessible",
      "Have rideshare apps ready",
    ],
    priority: "high",
  },
  {
    id: 7,
    category: "during",
    icon: "🚪",
    title: "Have an Exit Strategy",
    description: "Know how to leave quickly if needed",
    tips: [
      "Sit near exits when possible",
      "Know where bathrooms are",
      "Have a safe word with your friend",
      "Don't be afraid to leave if uncomfortable",
    ],
    priority: "high",
  },
  {
    id: 8,
    category: "during",
    icon: "💳",
    title: "Manage Your Own Finances",
    description: "Be financially independent during dates",
    tips: [
      "Bring enough money to pay for yourself",
      "Don't feel obligated if they pay",
      "Never lend money on early dates",
      "Keep cards and cash secure",
    ],
    priority: "medium",
  },
  {
    id: 9,
    category: "after",
    icon: "🏠",
    title: "Don't Share Your Address",
    description: "Keep your home address private until you're comfortable",
    tips: [
      "Meet in public for pickup/drop-off",
      "Use general location descriptions",
      "Don't invite them home too early",
      "Wait until trust is established",
    ],
    priority: "high",
  },
  {
    id: 10,
    category: "after",
    icon: "🤔",
    title: "Reflect on Red Flags",
    description: "Think about any concerning behavior",
    tips: [
      "Were they respectful of boundaries?",
      "Did anything make you uncomfortable?",
      "Did they pressure you for anything?",
      "Trust your gut feelings",
    ],
    priority: "medium",
  },
  {
    id: 11,
    category: "online",
    icon: "🔒",
    title: "Protect Personal Information",
    description: "Be cautious about what you share online",
    tips: [
      "Don't share your full name initially",
      "Avoid sharing work location details",
      "Keep phone number private at first",
      "Use the app's messaging initially",
    ],
    priority: "critical",
  },
  {
    id: 12,
    category: "online",
    icon: "🚫",
    title: "Recognize Red Flags",
    description: "Watch for warning signs in conversations",
    tips: [
      "Asking for money or financial help",
      "Rushing to meet or profess feelings",
      "Avoiding video calls consistently",
      "Stories that don't add up",
    ],
    priority: "critical",
  },
  {
    id: 13,
    category: "online",
    icon: "📸",
    title: "Be Careful with Photos",
    description: "Think before sharing images",
    tips: [
      "Never send intimate photos to strangers",
      "Remove location data from images",
      "Don't share photos that reveal your address",
      "Remember: screenshots exist forever",
    ],
    priority: "high",
  },
  {
    id: 14,
    category: "online",
    icon: "💬",
    title: "Video Chat Before Meeting",
    description: "Verify they're real through video calls",
    tips: [
      "Suggest a video call before in-person meeting",
      "Confirms they look like their photos",
      "Helps assess personality and vibe",
      "Red flag if they always refuse",
    ],
    priority: "high",
  },
];

const emergencyContacts: EmergencyContact[] = [
  { name: "Emergency Services", number: "911", icon: "🚨" },
  { name: "National Domestic Violence Hotline", number: "1-800-799-7233", icon: "🆘" },
  { name: "RAINN Hotline", number: "1-800-656-4673", icon: "💙" },
  { name: "Crisis Text Line", number: "Text HOME to 741741", icon: "💬" },
];

const priorityStyles: Record<Priority, string> = {
  critical: "bg-red-100 border-red-300",
  high: "bg-orange-50 border-orange-200",
  medium: "bg-gray-50 border-gray-200",
};

const iconBgStyles: Record<Priority, string> = {
  critical: "bg-red-100",
  high: "bg-orange-100",
  medium: "bg-gray-100",
};

export default function SafetyTips() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState<string | null>(null);

  const filteredTips =
    selectedCategory === "all"
      ? safetyTips
      : safetyTips.filter((tip) => tip.category === selectedCategory);

  const handleCall = (number: string) => {
    const digits = number.replace(/[^0-9]/g, "");
    if (digits) window.location.href = `tel:${digits}`;
    setShowEmergencyConfirm(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #fff5fa;
          color: #1a1a1a;
        }

        .page-wrapper {
          min-height: 100vh;
          background: #fff5fa;
        }

        /* Header */
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 245, 250, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #f0d5e6;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 860px;
          margin: 0 auto;
          width: 100%;
        }

        .header-wrap {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 245, 250, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #f0d5e6;
        }

        .back-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #f0d5e6;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.15s;
          text-decoration: none;
          color: #1a1a1a;
        }
        .back-btn:hover { background: #ffe8f5; }

        .header-title {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }

        .main {
          max-width: 860px;
          margin: 0 auto;
          padding: 28px 20px 60px;
        }

        /* Hero banner */
        .hero-banner {
          display: flex;
          align-items: center;
          gap: 18px;
          background: linear-gradient(135deg, #fff5fa 0%, #ffe8f5 100%);
          border: 2px solid #f0d5e6;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .hero-icon { font-size: 44px; flex-shrink: 0; }

        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        }

        .hero-text {
          font-size: 14px;
          color: #666;
          line-height: 1.55;
        }

        /* Emergency button */
        .emergency-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #f9089c 0%, #fb0567 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 18px 24px;
          width: 100%;
          font-size: 17px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-bottom: 28px;
          box-shadow: 0 6px 20px rgba(249, 8, 156, 0.35);
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .emergency-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249, 8, 156, 0.45);
        }
        .emergency-btn:active { transform: translateY(0); }

        /* Section title */
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
          letter-spacing: -0.3px;
        }

        /* Category chips */
        .categories-section { margin-bottom: 28px; }

        .chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .chips-scroll::-webkit-scrollbar { display: none; }

        .chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 24px;
          background: #fff;
          border: 1.5px solid #f0d5e6;
          cursor: pointer;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .chip:hover { background: #ffe8f5; border-color: #f9089c; }
        .chip.active {
          background: linear-gradient(135deg, #f9089c 0%, #fb0567 100%);
          border-color: #f9089c;
          color: #fff;
        }

        /* Tips section */
        .tips-section { margin-bottom: 28px; }
        .tips-count { font-size: 13px; color: #999; margin-bottom: 16px; }

        .tip-card {
          background: #fff;
          border: 1px solid #f0d5e6;
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 14px;
          transition: box-shadow 0.15s;
        }
        .tip-card:hover { box-shadow: 0 4px 16px rgba(249, 8, 156, 0.1); }

        .tip-card.critical { border-left: 4px solid #f9089c; }
        .tip-card.high { border-left: 4px solid #f9089c; }

        .tip-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 12px;
        }

        .tip-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: #ffe8f5;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .tip-icon-wrap.critical { background: #ffe8f5; }
        .tip-icon-wrap.high { background: #fff; }

        .tip-header-text { flex: 1; min-width: 0; }

        .tip-title {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 5px;
          letter-spacing: -0.2px;
        }

        .critical-badge {
          display: inline-block;
          background: #ffe8f5;
          color: #f9089c;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .tip-desc {
          font-size: 14px;
          color: #777;
          line-height: 1.55;
          margin-bottom: 12px;
        }

        .tips-list {
          background: #fff;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tip-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .tip-bullet { color: #4caf50; font-weight: 700; font-size: 13px; flex-shrink: 0; margin-top: 1px; }

        .tip-item-text { font-size: 13px; color: #555; line-height: 1.5; }

        /* Checklist */
        .checklist-section { margin-bottom: 28px; }

        .checklist-card {
          background: #fff;
          border: 1px solid #f0d5e6;
          border-radius: 14px;
          padding: 6px 0;
          overflow: hidden;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 18px;
          border-bottom: 1px solid #f0d5e6;
          font-size: 14px;
          color: #555;
          cursor: pointer;
          transition: background 0.12s;
          user-select: none;
        }
        .checklist-item:last-child { border-bottom: none; }
        .checklist-item:hover { background: #fff5fa; }

        .checkbox {
          width: 22px; height: 22px;
          border: 1.5px solid #f0d5e6;
          border-radius: 6px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
          font-size: 13px;
          color: #fff;
        }
        .checkbox.checked { background: #4caf50; border-color: #4caf50; }

        /* Contacts */
        .contacts-section { margin-bottom: 28px; }
        .contacts-subtitle { font-size: 13px; color: #999; margin-bottom: 14px; }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1px solid #f0d5e6;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: background 0.12s, box-shadow 0.12s;
        }
        .contact-card:hover { background: #fff5fa; box-shadow: 0 2px 10px rgba(249, 8, 156, 0.08); }

        .contact-icon { font-size: 28px; flex-shrink: 0; }
        .contact-info { flex: 1; min-width: 0; }

        .contact-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px; }
        .contact-number { font-size: 13px; color: #999; }

        .call-btn {
          background: linear-gradient(135deg, #f9089c 0%, #fb0567 100%);
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: background 0.12s;
        }
        .call-btn:hover { background: linear-gradient(135deg, #fb0567 0%, #f9089c 100%); }

        /* Red flags */
        .red-flags-section { margin-bottom: 28px; }

        .red-flags-card {
          background: #fff5fa;
          border: 2px solid #f0d5e6;
          border-radius: 14px;
          padding: 18px;
        }

        .red-flag-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .red-flag-item:last-child { margin-bottom: 0; }

        .rf-dot { font-size: 12px; flex-shrink: 0; margin-top: 3px; }
        .rf-text { font-size: 14px; color: #1a1a1a; font-weight: 500; line-height: 1.55; }

        /* Instincts */
        .instincts-section {
          text-align: center;
          background: #fff;
          border: 1px solid #e8d5c4;
          border-radius: 20px;
          padding: 32px 28px;
          margin-bottom: 28px;
        }

        .instincts-icon { font-size: 48px; margin-bottom: 14px; }

        .instincts-title {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
          letter-spacing: -0.4px;
        }

        .instincts-text {
          font-size: 15px;
          color: #666;
          line-height: 1.65;
          max-width: 520px;
          margin: 0 auto;
        }

        /* Report button */
        .report-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: #fff;
          border: 2px solid #f9089c;
          color: #f9089c;
          padding: 16px 24px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .report-btn:hover { background: #ffe8f5; }

        /* Modal overlay */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: #fff;
          border-radius: 20px;
          padding: 28px 24px;
          max-width: 340px;
          width: 100%;
          text-align: center;
        }

        .modal-icon { font-size: 40px; margin-bottom: 12px; }
        .modal-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .modal-text { font-size: 14px; color: #666; margin-bottom: 20px; }

        .modal-actions { display: flex; gap: 10px; }
        .modal-cancel {
          flex: 1; padding: 12px;
          border: 1px solid #f0d5e6;
          border-radius: 12px;
          background: #fff;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: #555;
        }
        .modal-confirm {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #f9089c 0%, #fb0567 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px; font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="page-wrapper">
        {/* Header */}
        <div className="header-wrap">
          <div className="header">
            <Link href="/" className="back-btn">←</Link>
            <span className="header-title">Safety Tips</span>
            <div style={{ width: 40 }} />
          </div>
        </div>

        <main className="main">
          {/* Hero */}
          <div className="hero-banner">
            <div className="hero-icon">🛡️</div>
            <div>
              <div className="hero-title">Your Safety Matters</div>
              <div className="hero-text">
                Follow these tips to stay safe while meeting new people. Trust your instincts always.
              </div>
            </div>
          </div>

          {/* Emergency Button */}
          <button className="emergency-btn" onClick={() => setShowEmergencyConfirm("911")}>
            <span>🚨</span>
            <span>Emergency? Tap to Call 911</span>
          </button>

          {/* Categories */}
          <div className="categories-section">
            <div className="section-title">Browse by Category</div>
            <div className="chips-scroll">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`chip${selectedCategory === cat.id ? " active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id as Category)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="tips-section">
            <div className="section-title">
              {selectedCategory === "all"
                ? "All Safety Tips"
                : categories.find((c) => c.id === selectedCategory)?.label}
            </div>
            <div className="tips-count">
              {filteredTips.length} {filteredTips.length === 1 ? "tip" : "tips"}
            </div>

            {filteredTips.map((tip) => (
              <div key={tip.id} className={`tip-card ${tip.priority === "critical" || tip.priority === "high" ? tip.priority : ""}`}>
                <div className="tip-header">
                  <div className={`tip-icon-wrap ${tip.priority === "critical" ? "critical" : tip.priority === "high" ? "high" : ""}`}>
                    {tip.icon}
                  </div>
                  <div className="tip-header-text">
                    <div className="tip-title">{tip.title}</div>
                    {tip.priority === "critical" && (
                      <span className="critical-badge">CRITICAL</span>
                    )}
                  </div>
                </div>
                <div className="tip-desc">{tip.description}</div>
                <div className="tips-list">
                  {tip.tips.map((item, i) => (
                    <div key={i} className="tip-item">
                      <span className="tip-bullet">✓</span>
                      <span className="tip-item-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Checklist */}
          <ChecklistSection />

          {/* Emergency Contacts */}
          <div className="contacts-section">
            <div className="section-title">Emergency & Support Resources</div>
            <div className="contacts-subtitle">Save these numbers — help is available 24/7</div>
            {emergencyContacts.map((c, i) => (
              <div key={i} className="contact-card" onClick={() => setShowEmergencyConfirm(c.number)}>
                <span className="contact-icon">{c.icon}</span>
                <div className="contact-info">
                  <div className="contact-name">{c.name}</div>
                  <div className="contact-number">{c.number}</div>
                </div>
                <button className="call-btn" onClick={(e) => { e.stopPropagation(); setShowEmergencyConfirm(c.number); }}>Call</button>
              </div>
            ))}
          </div>

          {/* Red Flags */}
          <div className="red-flags-section">
            <div className="section-title">🚩 Major Red Flags — Leave Immediately If:</div>
            <div className="red-flags-card">
              {[
                "They pressure you to leave the public location",
                "You feel threatened or unsafe in any way",
                "They become aggressive or controlling",
                "They try to separate you from your belongings",
                "Your instincts say something is wrong",
              ].map((text, i) => (
                <div key={i} className="red-flag-item">
                  <span className="rf-dot">🔴</span>
                  <span className="rf-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instincts */}
          <div className="instincts-section">
            <div className="instincts-icon">💭</div>
            <div className="instincts-title">Trust Your Instincts</div>
            <div className="instincts-text">
              If something feels wrong, it probably is. You don't owe anyone an explanation for leaving or ending a date. Your safety comes first, always.
            </div>
          </div>

          {/* Report */}
          <button className="report-btn">
            <span>📢</span>
            <span>Report Unsafe Behavior</span>
          </button>
        </main>
      </div>

      {/* Emergency Confirm Modal */}
      {showEmergencyConfirm && (
        <div className="overlay" onClick={() => setShowEmergencyConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">📞</div>
            <div className="modal-title">Call {showEmergencyConfirm}?</div>
            <div className="modal-text">This will open your phone's dialer.</div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowEmergencyConfirm(null)}>Cancel</button>
              <button className="modal-confirm" onClick={() => handleCall(showEmergencyConfirm)}>Call</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChecklistSection() {
  const items = [
    "Told a friend where I'm going",
    "Meeting in a public place",
    "Have my own transportation",
    "Phone fully charged",
    "Set check-in time with friend",
  ];
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false));

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <div className="checklist-section">
      <div className="section-title">✅ Pre-Date Safety Checklist</div>
      <div className="checklist-card">
        {items.map((item, i) => (
          <div key={i} className="checklist-item" onClick={() => toggle(i)}>
            <div className={`checkbox${checked[i] ? " checked" : ""}`}>
              {checked[i] && "✓"}
            </div>
            <span style={{ textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#aaa" : "#555" }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
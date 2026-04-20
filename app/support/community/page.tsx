"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Importance = "critical" | "high" | "medium";

const guidelines = [
  {
    id: 1,
    icon: "🤝",
    title: "Respect & Kindness",
    summary: "Treat everyone with dignity and respect",
    importance: "critical" as Importance,
    details: [
      "Always communicate respectfully with other members",
      "Be kind and considerate in all interactions",
      "Accept rejection gracefully",
      "No harassment, hate speech, or discriminatory language",
      "Respect different backgrounds, identities, and preferences",
      "If someone asks you to stop contacting them, respect their wishes",
    ],
  },
  {
    id: 2,
    icon: "🔒",
    title: "Safety First",
    summary: "Prioritize your safety and the safety of others",
    importance: "critical" as Importance,
    details: [
      "Never share personal information (address, financial details) early on",
      "Meet in public places for first dates",
      "Let a friend or family member know your plans",
      "Trust your instincts - if something feels wrong, it probably is",
      "Report suspicious behavior immediately",
      "Use in-app messaging before sharing phone numbers",
      "Don't send money or financial help to people you haven't met",
    ],
  },
  {
    id: 3,
    icon: "✓",
    title: "Be Authentic",
    summary: "Honesty is the foundation of meaningful connections",
    importance: "high" as Importance,
    details: [
      "Use recent, accurate photos of yourself",
      "Be truthful in your profile information",
      "Don't impersonate others or create fake profiles",
      "Represent yourself honestly about your intentions",
      "If your appearance changes significantly, update your photos",
      "Be genuine about your interests and hobbies",
    ],
  },
  {
    id: 4,
    icon: "🚫",
    title: "Consent & Boundaries",
    summary: "Always respect personal boundaries and consent",
    importance: "critical" as Importance,
    details: [
      "Never pressure anyone for personal information or meetings",
      "Respect when someone says no to anything",
      "Don't share intimate images without explicit consent",
      "Understand that consent can be withdrawn at any time",
      "Respect boundaries around physical contact",
      "Ask before sharing someone's photos or information with others",
    ],
  },
  {
    id: 5,
    icon: "🎭",
    title: "Appropriate Content",
    summary: "Keep all content suitable for a public platform",
    importance: "high" as Importance,
    details: [
      "No nudity or sexually explicit content in photos or messages",
      "Keep conversations appropriate, especially early on",
      "Don't use the platform for commercial solicitation",
      "No promotion of illegal activities or substances",
      "Avoid offensive or graphic content",
      "Profile photos should be appropriate for all audiences",
    ],
  },
  {
    id: 6,
    icon: "💬",
    title: "Communication Standards",
    summary: "Engage in meaningful and respectful conversations",
    importance: "medium" as Importance,
    details: [
      "Avoid spam or copy-paste messages",
      "Don't send unsolicited inappropriate messages",
      "Be patient - not everyone responds immediately",
      "Use appropriate language",
      "Keep conversations on the platform initially",
      "Don't pressure others to move conversations off-platform",
    ],
  },
  {
    id: 7,
    icon: "⚖️",
    title: "Legal Compliance",
    summary: "Follow all applicable laws and regulations",
    importance: "critical" as Importance,
    details: [
      "You must be 18 years or older to use this platform",
      "Don't engage in or promote illegal activities",
      "Respect intellectual property rights",
      "Follow local laws regarding relationships and interactions",
      "Don't use the platform for human trafficking or exploitation",
      "Report any illegal activity immediately",
    ],
  },
  {
    id: 8,
    icon: "🚨",
    title: "Reporting & Enforcement",
    summary: "Help us maintain a safe community",
    importance: "high" as Importance,
    details: [
      "Report any violations of these guidelines",
      "Block users who make you uncomfortable",
      "Provide detailed information when reporting",
      "Understand that violations may result in account suspension",
      "Serious violations will be reported to authorities",
      "Help us keep the community safe for everyone",
    ],
  },
];

const violationConsequences = [
  {
    severity: "Minor",
    consequence: "Warning and content removal",
    examples: "Spam, inappropriate language",
  },
  {
    severity: "Moderate",
    consequence: "Temporary suspension (1–7 days)",
    examples: "Repeated violations, fake profiles",
  },
  {
    severity: "Serious",
    consequence: "Permanent ban",
    examples: "Harassment, threats, illegal content",
  },
  {
    severity: "Criminal",
    consequence: "Ban + law enforcement contact",
    examples: "Exploitation, trafficking, violence",
  },
];

const importanceRing: Record<Importance, string> = {
  critical: "bg-red-500/15",
  high: "bg-orange-400/15",
  medium: "bg-blue-400/15",
};

const severityStyles: Record<string, string> = {
  Minor: "bg-blue-400/20 text-blue-700 dark:text-blue-300",
  Moderate: "bg-orange-400/20 text-orange-700 dark:text-orange-300",
  Serious: "bg-red-400/20 text-red-700 dark:text-red-300",
  Criminal: "bg-red-900/20 text-red-900 dark:text-red-200",
};

export default function CommunityGuidelinesPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggle = (i: number) =>
    setExpanded((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background border-b border-border">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-lg hover:bg-accent transition-colors"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-base font-bold">Community Guidelines</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-2xl mx-auto pb-16">
        {/* Hero */}
        <section className="flex flex-col items-center text-center px-8 py-10 bg-muted border-b border-border">
          <span className="text-6xl mb-4" role="img" aria-label="shield">🛡️</span>
          <h2 className="text-2xl font-bold mb-3">
            Building a Safe &amp; Respectful Community
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Our guidelines ensure everyone can connect safely and authentically. By using
            CuddleMatte, you agree to follow these standards.
          </p>
        </section>

        {/* Last updated */}
        <div className="mx-5 mt-5">
          <div className="bg-pink-500/10 rounded-lg px-4 py-3 text-center text-sm font-semibold text-muted-foreground">
            📅 Last Updated: January {new Date().getFullYear()}
          </div>
        </div>

        {/* Core Guidelines */}
        <section className="px-5 pt-7">
          <h2 className="text-xl font-bold mb-4">Core Guidelines</h2>
          <div className="flex flex-col gap-3">
            {guidelines.map((g, i) => {
              const isOpen = expanded.includes(i);
              return (
                <div
                  key={g.id}
                  className="bg-muted rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${importanceRing[g.importance]}`}
                      >
                        {g.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{g.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {g.summary}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-2.5">
                      {g.details.map((d, di) => (
                        <div key={di} className="flex gap-3">
                          <span className="text-pink-500 font-bold text-sm mt-px shrink-0">•</span>
                          <p className="text-sm text-muted-foreground leading-snug">{d}</p>
                        </div>
                      ))}
                      {g.importance === "critical" && (
                        <div className="mt-3 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2.5 text-center text-xs font-bold text-red-500">
                          ⚠️ Critical — Zero Tolerance
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Violation Consequences */}
        <section className="mt-8 px-5 py-7 bg-muted border-y border-border">
          <h2 className="text-xl font-bold mb-1">Violation Consequences</h2>
          <p className="text-sm text-muted-foreground mb-5">
            We enforce these guidelines to protect our community
          </p>
          <div className="flex flex-col gap-3">
            {violationConsequences.map((v, i) => (
              <div
                key={i}
                className="bg-background rounded-xl border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${severityStyles[v.severity]}`}
                  >
                    {v.severity}
                  </span>
                  <span className="text-sm font-semibold">{v.consequence}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Examples: {v.examples}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Report a Violation */}
        <section className="mx-5 mt-6 bg-muted rounded-2xl border border-border p-6 flex flex-col items-center text-center">
          <span className="text-5xl mb-3" role="img" aria-label="siren">🚨</span>
          <h2 className="text-xl font-bold mb-2">See Something? Say Something!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-sm">
            If you encounter behavior that violates these guidelines, please report it
            immediately. Your reports help keep our community safe.
          </p>
          <button 
            onClick={() => router.push("/support/safety")}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors"
          >
            Report a Violation
          </button>
        </section>

        {/* Safety Resources */}
        <section className="px-5 pt-8">
          <h2 className="text-xl font-bold mb-4">Safety Resources</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "📖", name: "Safety Tips", desc: "Learn how to stay safe", href: "/support/safety" },
              { icon: "🆘", name: "Crisis Hotlines", desc: "24/7 support numbers", href: "tel:+2348065417518" },
              { icon: "💬", name: "Contact Support", desc: "Get help from our team", href: "mailto:support@cuddlematte.com" },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center gap-3 bg-muted rounded-xl border border-border px-4 py-4 hover:bg-accent transition-colors"
              >
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-5 pt-8 flex flex-col items-center text-center">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-3">
            By using CuddleMatte, you agree to follow these Community Guidelines and our
            Terms of Service.
          </p>
          <Link
            href="/support/terms"
            className="text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
          >
            Read Terms of Service →
          </Link>
        </footer>
      </main>
    </div>
  );
}
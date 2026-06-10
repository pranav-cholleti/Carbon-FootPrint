"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  TrendingDown,
  Users,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 btn btn-primary"
      >
        Skip to main content
      </a>

      {/* === NAV === */}
      <nav
        className="glass fixed top-0 left-0 right-0 z-50"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-green)" }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Imprint
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <main id="main-content">
        <section className="pt-32 pb-20 px-6">
          <div
            className={`max-w-4xl mx-auto text-center ${mounted ? "animate-fade-in" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 badge badge-green mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Carbon Intelligence
            </div>

            <h1
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Know your impact.
              <br />
              <span className="text-gradient">Change it.</span>
            </h1>

            <p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Imprint shows you exactly where your carbon comes from, ranks your best opportunities
              to cut it, and gives you three specific things to do about it this week — in under two
              minutes a day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Your Profile <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Demo Account <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="mt-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Free forever · No credit card · 5-minute setup
            </p>
          </div>
        </section>

        {/* === DASHBOARD PREVIEW === */}
        <section className="py-12 px-6">
          <div
            className={`max-w-5xl mx-auto ${mounted ? "animate-slide-up delay-300" : "opacity-0"}`}
          >
            <div
              className="card p-8 md:p-12"
              style={{
                background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
                border: "none",
              }}
            >
              <div className="grid md:grid-cols-3 gap-8 text-white">
                {/* Ring Chart Placeholder */}
                <div className="flex flex-col items-center">
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="20"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#2A9D8F"
                      strokeWidth="20"
                      strokeDasharray="110 330"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                      style={{
                        animation: mounted ? "drawRing 1.5s ease-out forwards" : "none",
                      }}
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#F4A261"
                      strokeWidth="20"
                      strokeDasharray="99 341"
                      strokeDashoffset="-110"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#7B68EE"
                      strokeWidth="20"
                      strokeDasharray="77 363"
                      strokeDashoffset="-209"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#E07A5F"
                      strokeWidth="20"
                      strokeDasharray="55 385"
                      strokeDashoffset="-286"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                    <text
                      x="90"
                      y="82"
                      textAnchor="middle"
                      fill="white"
                      fontSize="28"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      412
                    </text>
                    <text
                      x="90"
                      y="105"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.7)"
                      fontSize="12"
                    >
                      kg CO₂e / month
                    </text>
                  </svg>
                </div>

                {/* Stats */}
                <div className="flex flex-col justify-center gap-4">
                  <div>
                    <div className="text-sm opacity-70">Annual Projection</div>
                    <div className="text-3xl font-bold font-mono">4.9 tonnes</div>
                    <div className="text-sm text-green-300">↓ 12% vs. last month</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">vs. Regional Average</div>
                    <div className="text-lg font-semibold">9% below average</div>
                  </div>
                </div>

                {/* Top Actions */}
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold opacity-70 uppercase tracking-wide">
                    Top Actions
                  </div>
                  {[
                    { icon: "🌱", text: "2 meat-free days/week", save: "18 kg/mo" },
                    { icon: "🚶", text: "Walk trips under 3km", save: "8 kg/mo" },
                    { icon: "💡", text: "Switch to LED bulbs", save: "5 kg/mo" },
                  ].map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <span className="text-lg">{action.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{action.text}</div>
                        <div className="text-xs opacity-70">Saves {action.save}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === FEATURES === */}
        <section className="py-20 px-6" style={{ background: "var(--bg-secondary)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Not just another carbon calculator.
              </h2>
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Imprint bridges the gap from awareness to personalized, effort-ranked action.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="w-6 h-6" />,
                  color: "var(--cat-transport)",
                  bg: "var(--accent-blue-bg)",
                  title: "Effort-Impact Matrix",
                  desc: "See exactly which changes give you the most impact for the least effort. No more guessing.",
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  color: "var(--accent-amber)",
                  bg: "var(--accent-amber-bg)",
                  title: "AI Weekly Digest",
                  desc: "A personal, plain-English summary of your week — what changed, what matters, and one thing to try.",
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  color: "var(--accent-green)",
                  bg: "var(--accent-green-bg)",
                  title: "Personalized Actions",
                  desc: "Only see recommendations you can actually follow, filtered to your lifestyle and ranked by impact.",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  color: "var(--accent-purple)",
                  bg: "var(--accent-purple-bg)",
                  title: "Fair Comparisons",
                  desc: "Compare against people with similar profiles in your region — not unfair global averages.",
                },
                {
                  icon: <TrendingDown className="w-6 h-6" />,
                  color: "var(--accent-coral)",
                  bg: "var(--accent-coral-bg)",
                  title: "\"What If\" Simulator",
                  desc: "Model hypothetical changes before committing. See annual savings and real equivalencies.",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  color: "var(--text-secondary)",
                  bg: "var(--bg-elevated)",
                  title: "Transparent Science",
                  desc: "Every number is traceable to peer-reviewed sources. DEFRA, IPCC, Our World in Data.",
                },
              ].map((feature, i) => (
                <div key={i} className="card card-interactive p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: feature.bg, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Under two minutes a day.</h2>
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Three simple steps to understand and reduce your carbon footprint.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Build your profile",
                  desc: "A 5-minute quiz establishes your baseline across transport, food, home energy, and consumption.",
                  icon: <Zap className="w-5 h-5" />,
                },
                {
                  step: "02",
                  title: "Log & learn",
                  desc: "Quick-entry logging with instant CO₂e feedback. See exactly what each choice costs — and what alternatives save.",
                  icon: <BarChart3 className="w-5 h-5" />,
                },
                {
                  step: "03",
                  title: "Act on insights",
                  desc: "AI-personalized recommendations ranked by effort vs. impact. Set goals, track progress, celebrate wins.",
                  icon: <Target className="w-5 h-5" />,
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "var(--accent-green)",
                      color: "white",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    className="text-sm font-bold mb-2 font-mono"
                    style={{ color: "var(--accent-green)" }}
                  >
                    Step {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === COMPARISON TABLE === */}
        <section className="py-20 px-6" style={{ background: "var(--bg-secondary)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Imprint is different</h2>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-elevated)" }}>
                    <th className="text-left p-4 font-semibold" style={{ color: "var(--text-secondary)" }}>
                      Feature
                    </th>
                    <th className="text-left p-4 font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      Generic Tracker
                    </th>
                    <th className="text-left p-4 font-semibold" style={{ color: "var(--accent-green)" }}>
                      Imprint
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Footprint view", "Total tonnes/year", "Which habits drive 80% of your footprint"],
                    ["Comparisons", "Global averages", "People with similar profiles in your region"],
                    ["Recommendations", '"Eat less beef" for everyone', "Ranked by your personal effort-to-impact ratio"],
                    ["Data model", "One-time questionnaire", "Learns from logged activities over time"],
                    ["Communication", "No narrative context", "AI-written weekly digest in plain English"],
                    ["Motivation", "No momentum mechanics", "Streaks, milestones, visible forecasts"],
                  ].map(([feature, generic, imprint], i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--border-light)" }}>
                      <td className="p-4 font-medium">{feature}</td>
                      <td className="p-4" style={{ color: "var(--text-tertiary)" }}>
                        {generic}
                      </td>
                      <td className="p-4 font-medium" style={{ color: "var(--accent-green)" }}>
                        {imprint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* === CTA === */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Behavioral specificity beats awareness breadth.
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Start with 5 minutes. See where you stand. Get your first personalized action plan.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create Your Profile <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* === FOOTER === */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid var(--border-light)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5" style={{ color: "var(--accent-green)" }} />
            <span className="font-bold">Imprint</span>
            <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              — Know your impact. Change it.
            </span>
          </div>
          <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Emission factors: DEFRA 2023, IPCC AR6, Our World in Data · MIT License
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 24px", color: "#e2e8f0" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "32px" }}>
        Last updated: {new Date().toISOString().split("T")[0]}
      </p>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1. Information We Collect</h2>
        <p style={pStyle}>
          When you register, we collect your email, username, and optional profile data
          (avatar, country, birthday, gender). We use Supabase as our authentication and
          database provider.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2. How We Use Your Data</h2>
        <p style={pStyle}>
          Your data is used solely to provide platform features — account access, tune
          attribution, comments, and premium subscription billing via Stripe. We do not
          sell or share your data with third parties.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3. Cookies</h2>
        <p style={pStyle}>
          We use essential cookies for authentication (Supabase session) and language
          preference. No tracking or analytics cookies are set without consent.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4. Third-Party Services</h2>
        <p style={pStyle}>
          We use: Supabase (auth + database), Stripe (payments), Vercel (hosting),
          Google AdSense (optional ads). Each has its own privacy policy.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5. Contact</h2>
        <p style={pStyle}>
          For privacy concerns, contact us at{" "}
          <a href="mailto:peonic07@gmail.com" style={{ color: "#facc15" }}>
            peonic07@gmail.com
          </a>.
        </p>
      </section>
    </div>
  )
}

const sectionStyle: React.CSSProperties = { marginBottom: "28px" }
const h2Style: React.CSSProperties = { fontSize: "18px", fontWeight: 700, marginBottom: "10px", color: "#f1f5f9" }
const pStyle: React.CSSProperties = { color: "#94a3b8", lineHeight: 1.7, fontSize: "14px", margin: 0 }

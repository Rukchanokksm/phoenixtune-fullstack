import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 24px", color: "#e2e8f0" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Terms of Service</h1>
      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "32px" }}>
        Last updated: {new Date().toISOString().split("T")[0]}
      </p>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1. Acceptance of Terms</h2>
        <p style={pStyle}>
          By accessing or using Tunix, you agree to be bound by these Terms.
          If you disagree with any part, you may not use the service.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2. User Accounts</h2>
        <p style={pStyle}>
          You are responsible for maintaining the confidentiality of your account
          credentials. You must provide accurate information when registering.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3. User Content</h2>
        <p style={pStyle}>
          You retain ownership of tunes, comments, and other content you post.
          By posting, you grant Tunix a non-exclusive license to display your
          content on the platform.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4. Prohibited Conduct</h2>
        <p style={pStyle}>
          You may not: harass other users, post illegal content, attempt to
          breach platform security, or use the service for commercial spam.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5. Premium Subscriptions</h2>
        <p style={pStyle}>
          Premium features are billed via Stripe. You may cancel at any time.
          Refunds are handled case-by-case; contact support.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>6. Disclaimer</h2>
        <p style={pStyle}>
          Tunix is provided "as is". Tune settings are user-contributed and not
          guaranteed to work in any specific game version. Use at your own risk.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>7. Contact</h2>
        <p style={pStyle}>
          Questions? Reach out at{" "}
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

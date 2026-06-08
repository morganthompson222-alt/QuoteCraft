import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — JobStacker",
};

export default function PrivacyPage() {
  return (
    <section className="page">
      <div className="page__inner" style={{ maxWidth: 720 }}>
        <p className="hero__eyebrow">Legal</p>
        <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
          Effective date: 6 June 2026
        </p>

        <div className="legal-content">
          <p>
            This Privacy Policy explains how JobStacker (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects,
            uses, stores, and protects personal data in connection with the JobStacker
            platform (&ldquo;Service&rdquo;). It also sets out the rights you have over your personal
            data.
          </p>
          <p>
            We are committed to handling personal data responsibly and in compliance with
            the UK General Data Protection Regulation (UK GDPR), the Data Protection Act
            2018, and the Privacy and Electronic Communications Regulations 2003 (PECR).
          </p>

          <h2>1. Data Controller</h2>
          <p>
            JobStacker is the data controller in respect of personal data we collect
            directly from you (such as your account and profile information). Where you
            enter your customers&rsquo; personal data into the Service, you remain the data
            controller of that data and JobStacker acts as your data processor. Our
            contact details for privacy matters are set out in clause 13.
          </p>

          <h2>2. Personal Data We Collect</h2>
          <h3>2.1 Account and Profile Data</h3>
          <p>When you register and set up your profile, we collect: name and email address; hashed password (stored and managed by Supabase Auth &mdash; we never have access to your plaintext password); business name, telephone number, and business address; region and country (used to determine currency and tax labelling); and company logo (optional, for PDF branding).</p>
          <h3>2.2 Quote and Job Data</h3>
          <p>The Service stores all data you enter to create and manage quotes and jobs, including: quote line items, descriptions, pricing, tax rates, and totals; job scheduling information (date, time, location, notes); and quote status and payment tracking information.</p>
          <h3>2.3 Customer Data You Enter</h3>
          <p>You may enter personal data about your customers into the Service, including their name, email address, telephone number, and address. You are the data controller in respect of this data. We process it on your behalf as your data processor, solely to provide the Service to you.</p>
          <h3>2.4 Subscription and Billing Data</h3>
          <p>We receive limited billing information via our payment processor, Stripe. This includes your Stripe customer ID, subscription plan tier, subscription status, and billing period dates. We do not store your payment card details; these are handled entirely by Stripe.</p>
          <h3>2.5 Technical and Usage Data</h3>
          <p>We collect limited technical data, including authentication tokens, your region preference, and onboarding status, stored locally in your browser. Our servers log request metadata (HTTP method, path, response status, duration) for operational purposes. We do not use analytics or advertising tracking tools; no cookies beyond authentication cookies are set.</p>
          <h3>2.6 AI Feature Data</h3>
          <p>When you use the AI quote generation feature (available on paid plans), the natural language description of work that you type is transmitted to a third-party AI provider (currently Groq and/or OpenAI) to generate a structured quote. We do not transmit your customers&rsquo; names, contact details, or other personal data to AI providers. See clause 6.3 for further details.</p>

          <h2>3. Purposes and Lawful Basis for Processing</h2>
          <p>We only process personal data where we have a lawful basis for doing so under UK GDPR Article 6. The table below sets out our main processing activities and their lawful basis.</p>

          <div style={{ overflowX: "auto", margin: "16px 0 24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text)" }}>Processing activity</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text)" }}>Lawful basis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Account registration and authentication", "Performance of contract (Art. 6(1)(b))"],
                  ["Delivering the Service (storing quotes, jobs, customers)", "Performance of contract (Art. 6(1)(b))"],
                  ["Subscription billing and payment processing", "Performance of contract (Art. 6(1)(b))"],
                  ["Sending transactional emails (e.g. password reset, billing alerts)", "Performance of contract (Art. 6(1)(b))"],
                  ["Compliance with legal obligations (e.g. tax record retention)", "Legal obligation (Art. 6(1)(c))"],
                  ["AI quote generation feature", "Legitimate interests (Art. 6(1)(f)): improving user productivity; only non-PII work descriptions transmitted"],
                  ["Improving and securing the Service", "Legitimate interests (Art. 6(1)(f)): we have a legitimate interest in maintaining the security, integrity, and improvement of the Service"],
                ].map(([activity, basis]) => (
                  <tr key={activity} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--text)" }}>{activity}</td>
                    <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>Where we rely on legitimate interests, we have conducted a balancing assessment and determined that our interests are not overridden by your rights and freedoms. You have the right to object to processing based on legitimate interests; see clause 10.</p>

          <h2>4. Cookies and Browser Storage</h2>
          <p>We use the following browser-based storage mechanisms:</p>
          <ul>
            <li>Authentication session cookie (&ldquo;supabase-auth-token&rdquo;) &mdash; set by our server-side middleware to maintain your session. This cookie is necessary for the Service to function.</li>
            <li>localStorage items &mdash; we store your authentication token, region preference, and onboarding status flags locally in your browser. These are functional and strictly necessary to provide the Service.</li>
          </ul>
          <p>We do not use analytics cookies, advertising cookies, or any third-party tracking scripts. No non-essential cookies are set. Because only strictly necessary cookies and storage are used, a consent banner is not required under PECR. However, you may clear browser storage at any time via your browser settings, which will require you to log in again.</p>

          <h2>5. Data Storage and Retention</h2>
          <h3>5.1 Where Data is Stored</h3>
          <p>All personal data entered into the Service (account data, customer data, quotes, and jobs) is stored in a PostgreSQL database hosted by Supabase, Inc. on servers based in the United States. See clause 7 on international transfers.</p>
          <h3>5.2 Retention Periods</h3>
          <ul>
            <li>Account and profile data: retained for the duration of your Account, plus up to 30 days following account deletion to allow recovery in case of accidental deletion.</li>
            <li>Quote and job data: retained for the duration of your Account, plus up to 30 days following account deletion.</li>
            <li>Customer data you have entered: retained as above.</li>
            <li>Billing metadata: retained for 7 years from the relevant transaction date, as required by HMRC financial record-keeping obligations.</li>
            <li>Server logs: retained for up to 30 days on a rolling basis.</li>
          </ul>
          <h3>5.3 Account Deletion</h3>
          <p>You may request deletion of your Account via your account settings or by contacting us at the address in clause 13. On account deletion, your personal data will be purged within 30 days, subject to the billing retention requirement above and any overriding legal obligation.</p>

          <h2>6. Data Sharing and Third-Party Processors</h2>
          <p>We do not sell, rent, or trade your personal data. We share personal data only with the third-party service providers described below, who act as our data processors and are contractually bound to process data only on our instructions.</p>
          <h3>6.1 Supabase, Inc. (Database and Authentication)</h3>
          <p>Supabase provides our database and authentication infrastructure. All user account data, customer data, quotes, and jobs are stored with Supabase. Data is stored in the United States. We have entered or will enter into a Data Processing Agreement with Supabase that includes Standard Contractual Clauses (SCCs) as required by UK GDPR for international transfers.</p>
          <h3>6.2 Stripe, Inc. (Payment Processing)</h3>
          <p>Stripe processes subscription payments. We share your email address, an internal user identifier, and your selected subscription plan with Stripe to initiate checkout. Stripe handles all payment card data directly; JobStacker never receives or stores your card details. Stripe operates under its own Data Processing Agreement, available at stripe.com/dpa.</p>
          <h3>6.3 Groq, Inc. and/or OpenAI, L.L.C. (AI Features)</h3>
          <p>When you use the AI quote generation feature, the natural language description of work you enter is transmitted to Groq or OpenAI to generate a quote suggestion. We transmit only the work description text &mdash; no customer names, contact details, addresses, or any other personal data are included in this transmission. Both providers have Data Processing Agreements covering this processing. If you do not wish to use AI features, you may use the Service on the Solo tier, which does not include AI functionality.</p>
          <h3>6.4 Other Disclosures</h3>
          <p>We may disclose personal data: (a) to comply with a legal obligation or court order; (b) to protect the vital interests of any person; (c) in connection with a merger, acquisition, or sale of assets (where the acquirer will be bound by equivalent data protection obligations); or (d) to enforce our Terms or protect our legal rights.</p>

          <h2>7. International Data Transfers</h2>
          <p>Our data processors &mdash; Supabase, Stripe, Groq, and OpenAI &mdash; are based in the United States. The United States does not currently benefit from a UK adequacy decision. Data transfers to these processors are carried out under the UK International Data Transfer Agreement (IDTA) or Standard Contractual Clauses (SCCs) adopted in accordance with UK GDPR Article 46. Copies of the relevant transfer mechanisms are available on request.</p>

          <h2>8. Security</h2>
          <h3>8.1 Security Measures</h3>
          <p>We implement technical and organisational measures designed to protect personal data against unauthorised access, disclosure, loss, or destruction. Our current measures include: encrypted transmission of all data over HTTPS/TLS; database encryption at rest (managed by Supabase); row-level security policies ensuring each user can access only their own data; bcrypt-hashed passwords (handled by Supabase Auth); input validation and sanitisation on all API endpoints; rate limiting on AI API endpoints to prevent abuse; CORS and origin validation controls; and JWT-based authentication verified on every API request.</p>
          <h3>8.2 Security Disclaimer</h3>
          <p>Despite the measures described above, no system connected to the internet can be guaranteed to be completely secure. We cannot warrant that data transmissions over the internet are entirely secure or that unauthorised third parties will never succeed in defeating our security measures. You provide personal data to the Service at your own risk. We will promptly notify you and the Information Commissioner&rsquo;s Office (ICO) of any personal data breach to the extent required by UK GDPR Article 33 and 34.</p>
          <h3>8.3 Known Limitations</h3>
          <p>We periodically audit our security posture. Where we identify gaps, we work to address them on a risk-prioritised basis. If you discover a potential security vulnerability, please disclose it responsibly by contacting us at the address in clause 13 before making it public.</p>

          <h2>9. Children&rsquo;s Privacy</h2>
          <p>The Service is not directed at children under the age of 18. We do not knowingly collect personal data from anyone under 18. If we become aware that we have collected personal data from a child under 18 without appropriate parental consent, we will delete that data promptly.</p>

          <h2>10. Your Rights</h2>
          <p>Under UK GDPR, you have the following rights in relation to your personal data. To exercise any of these rights, contact us using the details in clause 13. We will respond within one calendar month (or notify you of any extension, as permitted under UK GDPR).</p>
          <h3>10.1 Right of Access</h3>
          <p>You have the right to obtain confirmation of whether we hold personal data about you, and to receive a copy of that data together with information about how it is processed.</p>
          <h3>10.2 Right to Rectification</h3>
          <p>You have the right to have inaccurate personal data corrected and incomplete personal data completed. You can update most account and profile data directly within the Service.</p>
          <h3>10.3 Right to Erasure</h3>
          <p>You have the right to request deletion of your personal data where: (a) the data is no longer necessary for the purposes for which it was collected; (b) you withdraw consent and no other lawful basis applies; (c) you object to processing and we have no overriding legitimate grounds; (d) the data has been unlawfully processed; or (e) deletion is required to comply with a legal obligation. Erasure is subject to retention requirements described in clause 5.2.</p>
          <h3>10.4 Right to Restriction</h3>
          <p>You have the right to request that we restrict processing of your personal data in certain circumstances, such as where you contest its accuracy or have objected to processing pending verification of our legitimate grounds.</p>
          <h3>10.5 Right to Data Portability</h3>
          <p>You have the right to receive personal data you have provided to us in a structured, commonly used, and machine-readable format, and to transmit that data to another controller, where processing is based on consent or contract and carried out by automated means. We will implement a data export feature to facilitate this right.</p>
          <h3>10.6 Right to Object</h3>
          <p>You have the right to object at any time to processing of your personal data where we rely on legitimate interests (Art. 6(1)(f)) as our lawful basis. We will cease processing unless we can demonstrate compelling legitimate grounds that override your interests, rights, and freedoms.</p>
          <h3>10.7 Automated Decision-Making</h3>
          <p>We do not make solely automated decisions that produce legal or similarly significant effects concerning you.</p>
          <h3>10.8 Right to Lodge a Complaint</h3>
          <p>You have the right to lodge a complaint with the Information Commissioner&rsquo;s Office (ICO) at ico.org.uk or by calling 0303 123 1113, if you believe we have not complied with our data protection obligations. We would appreciate the opportunity to address your concerns directly before you contact the ICO.</p>

          <h2>11. Third-Party Links</h2>
          <p>The Service may contain links to third-party websites or services. This Privacy Policy applies only to the JobStacker Service. We are not responsible for the privacy practices of any third-party sites and encourage you to review their privacy policies before providing any personal data.</p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes to our practices, the Service, or applicable law. Where we make material changes, we will notify you by email or in-app notification at least 30 days before the changes take effect. The effective date at the top of this document indicates when the current version came into force. We encourage you to review this Privacy Policy periodically.</p>

          <h2>13. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, wish to exercise your data subject rights, or have a privacy concern, please contact us at:</p>
          <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", margin: "16px 0" }}>
            <p style={{ margin: "0 0 4px" }}><strong style={{ color: "#1F6B4F" }}>JobStacker Privacy Team</strong></p>
            <p style={{ margin: "4px 0" }}>Email: privacy@jobstacker.app</p>
            <p style={{ margin: 0 }}>Postal address: [Registered Office Address]</p>
          </div>
          <p>We aim to respond to all privacy-related requests within 5 business days and to complete substantive responses within the statutory timeframe.</p>

          <div className="legal-footer" style={{ marginTop: 48, borderTop: "1px solid var(--border)", paddingTop: 24, color: "var(--text-muted)", fontSize: 13 }}>
            &copy; JobStacker. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "JobStacker's terms and conditions for using our quote and job management software for tradespeople.",
  alternates: { canonical: "https://jobstacker.app/terms" },
};

export default function TermsPage() {
  return (
    <section className="page">
      <div className="page__inner" style={{ maxWidth: 720 }}>
        <p className="hero__eyebrow">Legal</p>
        <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>Terms and Conditions</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
          Effective date: 6 June 2026
        </p>

        <div className="legal-content">
          <p>
            Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before using
            the JobStacker platform. By creating an account or using any part of the
            Service, you agree to be bound by these Terms. If you do not agree, you
            must not use the Service.
          </p>

          <h2>1. Interpretation</h2>
          <p>In these Terms, the following definitions apply:</p>
          <ul>
            <li>&ldquo;JobStacker&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo; means the operator of the JobStacker platform.</li>
            <li>&ldquo;Service&rdquo; means the JobStacker web application, including all features, APIs, and associated documentation.</li>
            <li>&ldquo;User&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo; means any individual or business that registers for or uses the Service.</li>
            <li>&ldquo;Account&rdquo; means the registered account created by a User to access the Service.</li>
            <li>&ldquo;Content&rdquo; means any data, text, information, or files uploaded or entered into the Service by a User, including customer data and quote information.</li>
            <li>&ldquo;Subscription&rdquo; means a paid plan that grants access to premium features of the Service.</li>
          </ul>

          <h2>2. Eligibility and Account Registration</h2>
          <h3>2.1 Eligibility</h3>
          <p>The Service is intended for use by businesses and individuals for lawful commercial purposes. By registering, you confirm that you are at least 18 years of age and have legal capacity to enter into a binding contract.</p>
          <h3>2.2 Account Creation</h3>
          <p>You must provide accurate, complete, and current information when registering. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your Account. You must notify us promptly at the contact details in clause 19 if you suspect any unauthorised use of your Account.</p>
          <h3>2.3 One Account per User</h3>
          <p>Each registration represents a single user or business entity. You must not create multiple Accounts to circumvent plan limits or other restrictions.</p>

          <h2>3. The Service</h2>
          <h3>3.1 Description</h3>
          <p>JobStacker provides a cloud-based SaaS platform for tradespeople and small businesses to create, manage, and send trade quotes, generate PDF quote documents, manage customer records, schedule jobs, and manage subscriptions. The Service includes an optional AI-assisted quote generation feature available on paid plans.</p>
          <h3>3.2 Free and Paid Tiers</h3>
          <p>The Service is offered on multiple plan tiers (Solo, Solo Pro, Business, Growth, and Enterprise). Plan-specific feature limits (such as the maximum number of customers, active quotes, and access to AI features) are set out on our pricing page and may be updated from time to time with reasonable notice.</p>
          <h3>3.3 AI-Generated Content</h3>
          <p>The AI quote generation feature uses third-party AI models (currently Groq and/or OpenAI) to produce suggested job descriptions, material lists, and pricing estimates. AI-generated content is provided as a starting-point only. You are solely responsible for reviewing, verifying, and amending any AI-generated quote before sending it to a customer. We do not warrant that AI-generated content is accurate, complete, or fit for any particular purpose. The disclaimer in clause 10 applies fully to AI-generated content.</p>
          <h3>3.4 Service Availability</h3>
          <p>We aim to maintain a high level of availability but do not guarantee that the Service will be uninterrupted, error-free, or available at any particular time. We may need to suspend or restrict the Service for scheduled maintenance, security patches, or emergency fixes. Where planned maintenance is scheduled, we will endeavour to give reasonable advance notice. Unplanned outages may occur without notice.</p>

          <h2>4. Subscriptions and Billing</h2>
          <h3>4.1 Subscription Plans</h3>
          <p>Access to certain features requires a paid Subscription. Subscription fees are charged in advance on a monthly or annual basis as selected at the time of purchase. All prices are as listed on our pricing page and are inclusive of any applicable VAT unless stated otherwise.</p>
          <h3>4.2 Payment Processing</h3>
          <p>Payments are processed by Stripe, Inc. (&ldquo;Stripe&rdquo;). JobStacker does not store or process your payment card details. By subscribing, you agree to Stripe&rsquo;s terms of service and privacy policy in addition to these Terms. You authorise us to instruct Stripe to charge your payment method on each renewal date.</p>
          <h3>4.3 Auto-Renewal</h3>
          <p>Subscriptions renew automatically at the end of each billing period unless cancelled before the renewal date. You may cancel your Subscription at any time via your account settings. Cancellation takes effect at the end of the current billing period; no partial-period refunds are issued unless required by applicable law.</p>
          <h3>4.4 Price Changes</h3>
          <p>We may change Subscription prices on reasonable written notice (at least 30 days in advance). If you do not wish to continue at the new price, you may cancel your Subscription before the new price takes effect.</p>
          <h3>4.5 Refund Policy</h3>
          <p>We do not offer refunds for unused portions of a billing period, except where required by the Consumer Rights Act 2015 or other applicable law. If you believe you have been incorrectly charged, contact us at the details in clause 19 and we will investigate promptly.</p>

          <h2>5. User Responsibilities</h2>
          <h3>5.1 Accuracy of Information</h3>
          <p>You are responsible for ensuring that all information you enter into the Service &mdash; including your own business details, customer information, and quote data &mdash; is accurate and lawful.</p>
          <h3>5.2 Customer Data and Client Consent</h3>
          <p>You may enter personal data relating to your customers into the Service (such as names, email addresses, postal addresses, and telephone numbers). By entering any such data into the Service, you represent, warrant, and undertake to JobStacker on a continuing basis that:</p>
          <ul>
            <li>you have obtained all necessary and valid consents from each individual whose personal data you enter, or otherwise have a clear and documented lawful basis under applicable data protection law (including the UK GDPR and the Data Protection Act 2018) for processing and storing that personal data via a third-party SaaS platform;</li>
            <li>prior to entering your customers&rsquo; personal data into the Service, you have clearly informed each affected individual: (a) that their personal data will be stored on a third-party cloud platform (JobStacker); (b) the nature of the data being stored; (c) the purposes for which it will be used; (d) that the data will be held on servers located in the United States under appropriate data transfer safeguards; and (e) how they may exercise their data subject rights, including the right to access, correct, or request deletion of their data;</li>
            <li>you have made your customers aware of the inherent risks associated with storing personal data via internet-based services, including the risk that, despite reasonable security measures, no system can guarantee absolute protection against unauthorised access, data breaches, or loss, and that you have taken responsibility for communicating those risks to your clients before entering their data into the Service;</li>
            <li>you have provided your customers with a privacy notice or fair processing information that is accurate, up to date, and compliant with your obligations as a data controller under UK GDPR Article 13 or 14 (as applicable); and</li>
            <li>you will comply with all applicable data protection and privacy laws in connection with your use of the Service, and will promptly notify affected individuals and, where required, the Information Commissioner&rsquo;s Office (ICO), in the event of any personal data breach involving data you have entered into the Service.</li>
          </ul>
          <p>You remain the data controller in respect of your customers&rsquo; personal data at all times. JobStacker acts solely as a data processor on your behalf in respect of that data and will process it only in accordance with your instructions and these Terms. Where required by applicable law, we will enter into a separate Data Processing Agreement with you on request.</p>
          <p><strong>You acknowledge that JobStacker bears no liability for any failure on your part to obtain the necessary consents, provide adequate privacy information to your clients, or otherwise comply with your obligations as a data controller. Any claim brought by your customers arising from your failure to meet these obligations is your sole responsibility.</strong></p>
          <h3>5.3 Account Security</h3>
          <p>You must take reasonable steps to keep your login credentials secure. You should use a strong, unique password and enable any multi-factor authentication features we make available. We are not liable for any loss or damage arising from your failure to maintain the security of your Account.</p>

          <h2>6. Acceptable Use</h2>
          <h3>6.1 Permitted Use</h3>
          <p>The Service is provided for lawful business purposes only. You may use the Service to manage your own trade quoting and job scheduling activities.</p>
          <h3>6.2 Prohibited Conduct</h3>
          <p>You must not use the Service to:</p>
          <ul>
            <li>violate any applicable law or regulation, including data protection, consumer protection, or financial services laws;</li>
            <li>process, store, or transmit any data that is defamatory, fraudulent, harassing, obscene, or otherwise unlawful;</li>
            <li>enter third-party personal data into the Service without a lawful basis or appropriate notice to the individuals concerned;</li>
            <li>interfere with or attempt to disrupt the integrity, performance, or security of the Service or its underlying infrastructure;</li>
            <li>use automated means (bots, scrapers, crawlers) to access the Service in a manner that imposes disproportionate load on our infrastructure;</li>
            <li>reverse engineer, decompile, or attempt to extract the source code of the Service;</li>
            <li>resell, sublicense, or otherwise commercially exploit access to the Service without our prior written consent; or</li>
            <li>create multiple Accounts to circumvent usage limits or other restrictions.</li>
          </ul>
          <h3>6.3 Enforcement</h3>
          <p>We reserve the right to investigate suspected violations and to suspend or terminate access where we reasonably believe a violation has occurred or is likely to occur. We will notify you where it is lawful and practical to do so before taking enforcement action.</p>

          <h2>7. Intellectual Property</h2>
          <h3>7.1 Our Intellectual Property</h3>
          <p>All rights, title, and interest in the Service (including the software, design, branding, and documentation) are and remain the exclusive property of JobStacker or our licensors. Nothing in these Terms transfers any ownership of intellectual property to you. You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for your own internal business purposes during the term of your Subscription (or, for the Free tier, while your Account remains active).</p>
          <h3>7.2 Your Content</h3>
          <p>You retain ownership of all Content you create or upload to the Service. By using the Service, you grant JobStacker a limited, non-exclusive licence to store, process, and reproduce your Content solely to the extent necessary to provide the Service to you. We will not use your Content for any other purpose, including training AI models, without your express consent.</p>
          <h3>7.3 Feedback</h3>
          <p>If you submit feedback, suggestions, or ideas about the Service, you grant us an irrevocable, royalty-free licence to use that feedback for any purpose without restriction or compensation to you.</p>

          <h2>8. Data Protection</h2>
          <p>Our collection and use of personal data in connection with the Service is described in our Privacy Policy, which forms part of these Terms. By using the Service, you acknowledge the Privacy Policy. Where you process your customers&rsquo; personal data using the Service, the provisions of clause 5.2 apply.</p>

          <h2>9. Confidentiality</h2>
          <p>Each party agrees to keep confidential any non-public information disclosed by the other party in connection with these Terms that is identified as confidential or that a reasonable person would consider confidential in context. This obligation does not apply to information that is publicly available, already known to the receiving party, independently developed, or required to be disclosed by law.</p>

          <h2>10. Disclaimers and Warranties</h2>
          <p>THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, QUOTECRAFT MAKES NO WARRANTY, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          <p>In particular, we do not warrant that: the Service will meet your specific requirements or expectations; the Service will be uninterrupted, timely, secure, or error-free at all times; AI-generated quotes or pricing suggestions will be accurate, suitable, or commercially appropriate for your circumstances; or any errors or defects in the Service will be corrected within any particular timeframe.</p>
          <p>Nothing in these Terms affects any statutory rights you may have as a consumer that cannot be excluded or limited by law.</p>

          <h2>11. Limitation of Liability</h2>
          <h3>11.1 Exclusion of Consequential Loss</h3>
          <p>To the maximum extent permitted by law, JobStacker shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, loss of business, loss of data, or loss of goodwill, arising out of or in connection with the Service or these Terms, even if we have been advised of the possibility of such damages.</p>
          <h3>11.2 Cap on Liability</h3>
          <p>To the maximum extent permitted by law, JobStacker&rsquo;s total aggregate liability to you for all claims arising out of or relating to the Service or these Terms in any 12-month period shall not exceed the greater of: (a) the total fees paid by you to JobStacker during the 12 months immediately preceding the claim; or (b) &pound;100.</p>
          <h3>11.3 Exceptions</h3>
          <p>Nothing in these Terms limits or excludes our liability for: death or personal injury caused by our negligence; fraud or fraudulent misrepresentation; or any other liability that cannot lawfully be excluded or limited under the laws of England and Wales.</p>
          <h3>11.4 Basis of the Bargain</h3>
          <p>You acknowledge that the limitations and exclusions of liability in this clause 11 reflect a reasonable allocation of risk and are an essential element of the basis of the bargain between the parties. JobStacker would not provide the Service on the terms set out in these Terms without these limitations.</p>

          <h2>12. Indemnity</h2>
          <p>You agree to indemnify, defend, and hold harmless JobStacker and its officers, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to: (a) your use of the Service in breach of these Terms; (b) your violation of any applicable law; or (c) any third-party claim arising from data you have entered into the Service, including claims by your customers.</p>

          <h2>13. Third-Party Services</h2>
          <p>The Service integrates with third-party platforms including Supabase (database and authentication), Stripe (payment processing), and Groq/OpenAI (AI features). These third-party services are provided under their own terms and privacy policies. JobStacker is not responsible for the performance, availability, or practices of any third-party service provider. Links to third-party services within the Service do not constitute our endorsement of those services.</p>

          <h2>14. Suspension and Termination</h2>
          <h3>14.1 Termination by You</h3>
          <p>You may cancel your Account at any time via your account settings. Cancellation of a paid Subscription takes effect at the end of the current billing period. Data retention and deletion following account cancellation is described in the Privacy Policy.</p>
          <h3>14.2 Suspension or Termination by Us</h3>
          <p>We may suspend or terminate your Account with immediate effect (and without refund of prepaid fees) if: you materially breach these Terms and (where the breach is capable of remedy) fail to remedy it within 14 days of written notice; you engage in conduct that, in our reasonable opinion, poses a risk to the security or integrity of the Service or to other users; you fail to pay any amount due under your Subscription and the payment remains outstanding for more than 14 days after we notify you; or we are required to do so by law or a regulatory authority. Where practical and lawful, we will give you reasonable notice before suspension or termination and an opportunity to remedy the issue.</p>
          <h3>14.3 Effect of Termination</h3>
          <p>On termination of your Account for any reason, your licence to use the Service will cease immediately. Subject to our data retention obligations under the Privacy Policy, we will delete or anonymise your data within 30 days of account deletion. We recommend that you export your data before cancelling.</p>

          <h2>15. Changes to the Service and Terms</h2>
          <h3>15.1 Service Changes</h3>
          <p>We may modify, suspend, or discontinue features of the Service at any time. Where a material change adversely affects your use of the Service, we will provide at least 30 days&rsquo; notice by email or in-app notification before implementing the change.</p>
          <h3>15.2 Changes to Terms</h3>
          <p>We may update these Terms from time to time. Where changes are material, we will notify you by email or in-app notification at least 30 days before the updated Terms take effect. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes. If you do not agree to the revised Terms, you should cancel your Account before they take effect.</p>

          <h2>16. Force Majeure</h2>
          <p>Neither party will be liable for any failure or delay in performance to the extent caused by circumstances beyond their reasonable control, including natural disasters, war, civil unrest, government action, labour disputes, interruptions to third-party infrastructure (including internet service providers or cloud providers), or power outages. The affected party must notify the other promptly and take reasonable steps to mitigate the effects.</p>

          <h2>17. Assignment</h2>
          <p>You may not assign or transfer any of your rights or obligations under these Terms without our prior written consent. We may assign these Terms (in whole or in part) to a successor entity in connection with a merger, acquisition, or sale of all or substantially all of our assets, provided that the successor entity assumes all obligations under these Terms.</p>

          <h2>18. Governing Law and Dispute Resolution</h2>
          <h3>18.1 Governing Law</h3>
          <p>These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of England and Wales.</p>
          <h3>18.2 Jurisdiction</h3>
          <p>Each party irrevocably agrees that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms, except that either party may seek urgent injunctive relief in any competent jurisdiction.</p>
          <h3>18.3 Dispute Resolution</h3>
          <p>Before commencing formal legal proceedings, the parties agree to attempt to resolve any dispute in good faith through negotiation for at least 30 days from the date one party notifies the other of the dispute in writing. This clause does not prevent either party from seeking emergency or interim relief from a court.</p>

          <h2>19. General</h2>
          <h3>19.1 Entire Agreement</h3>
          <p>These Terms, together with the Privacy Policy and any order confirmation or Subscription documentation, constitute the entire agreement between you and JobStacker in relation to the Service and supersede all prior agreements, representations, or understandings.</p>
          <h3>19.2 Severability</h3>
          <p>If any provision of these Terms is found by a court to be invalid, unlawful, or unenforceable, that provision will be deemed severed from the remaining provisions, which will continue in full force and effect.</p>
          <h3>19.3 Waiver</h3>
          <p>Our failure to enforce any provision of these Terms shall not constitute a waiver of our right to enforce that provision or any other provision in future.</p>
          <h3>19.4 No Partnership</h3>
          <p>Nothing in these Terms creates a partnership, joint venture, agency, franchise, or employment relationship between you and JobStacker.</p>
          <h3>19.5 Contact</h3>
          <p>Questions about these Terms should be directed to us at: legal@jobstacker.app (or the contact address provided in your account settings). We aim to respond to all enquiries within 5 business days.</p>

          <div className="legal-footer" style={{ marginTop: 48, borderTop: "1px solid var(--border)", paddingTop: 24, color: "var(--text-muted)", fontSize: 13 }}>
            &copy; JobStacker. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
}

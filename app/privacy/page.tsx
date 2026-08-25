import { Metadata } from "next";
import { MainContainer } from "@/components/layout/MainContainer";
import { generatePageMetadata } from "@/lib/seo";

const LAST_UPDATED = "August 24, 2026";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for MixWise — how we collect, use, and protect your information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-16 bg-cream min-h-screen">
      <MainContainer>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none text-charcoal">
            <p className="text-sage text-sm mb-8">
              Last updated: {LAST_UPDATED}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                1. Information We Collect
              </h2>
              <p className="text-charcoal/80 mb-4">
                We collect information you provide directly to us, such as when you create an
                account, save cocktail recipes, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-charcoal/80 space-y-2">
                <li>Email address and display name</li>
                <li>Profile information (optional)</li>
                <li>Your saved bar ingredients, favorite cocktails, notes, and shopping lists</li>
                <li>Photos you choose to take or select when sharing a pour to Stories</li>
                <li>Usage data and preferences (for example, features you use in the app)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-charcoal/80 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-charcoal/80 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience with cocktail recommendations</li>
                <li>Send you updates and marketing communications (with your consent)</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                3. Cookies, Analytics, and Similar Technologies
              </h2>
              <p className="text-charcoal/80 mb-4">
                We use cookies and similar technologies to keep you signed in, remember
                preferences, and understand how MixWise is used. On the website and in the iOS
                app, we use product analytics (including PostHog) to measure feature usage and
                improve the experience. We do not use this data for third-party advertising
                tracking, and we do not use App Tracking Transparency / IDFA-based tracking.
              </p>
              <p className="text-charcoal/80">
                You can instruct your browser to refuse cookies or to indicate when a cookie is
                being sent. If you do not accept cookies, some portions of the website may not
                work as expected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                4. Sharing Features
              </h2>
              <p className="text-charcoal/80 mb-4">
                If you share content from MixWise (for example, Instagram or Facebook Stories),
                the photo or sticker you choose is handed off to that app on your device so you
                can post it. Those platforms process the shared content under their own privacy
                policies. MixWise does not sell your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                5. Data Security
              </h2>
              <p className="text-charcoal/80">
                The security of your data is important to us. We implement appropriate technical
                and organizational measures to protect the security of your personal information.
                However, please note that no method of transmission over the Internet or method
                of electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-charcoal/80 mb-4">
                We use third-party services to operate MixWise, including authentication and
                database hosting (Supabase), email delivery, analytics, and (on the website)
                optional session analytics. These providers process data under their own privacy
                policies and only as needed to provide their services to us.
              </p>
              <p className="text-charcoal/80">
                Our service may contain links to other sites. If you click a third-party link,
                you will be directed to that site. We strongly advise you to review the Privacy
                Policy of every site you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                7. Your Choices
              </h2>
              <p className="text-charcoal/80 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-charcoal/80 space-y-2">
                <li>Access and update your account information at any time</li>
                <li>
                  Delete your account and associated data from Account settings in the app or
                  website (or by contacting us)
                </li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p className="text-charcoal/80">
                Our service is intended for users who are of legal drinking age in their
                jurisdiction. We do not knowingly collect personally identifiable information
                from anyone under the legal drinking age.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <p className="text-charcoal/80">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the
                &quot;Last updated&quot; date at the top of this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                10. Contact Us
              </h2>
              <p className="text-charcoal/80">
                If you have any questions about this Privacy Policy, email us at{" "}
                <a
                  href="mailto:hello@getmixwise.com"
                  className="text-terracotta hover:text-terracotta-dark underline"
                >
                  hello@getmixwise.com
                </a>{" "}
                or use our{" "}
                <a href="/contact" className="text-terracotta hover:text-terracotta-dark underline">
                  contact page
                </a>
                . See also our{" "}
                <a href="/terms" className="text-terracotta hover:text-terracotta-dark underline">
                  Terms of Service
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}

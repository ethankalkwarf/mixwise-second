import { Metadata } from "next";
import { MainContainer } from "@/components/layout/MainContainer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for MixWise - Learn how we collect, use, and protect your information.",
};

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
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                1. Information We Collect
              </h2>
              <p className="text-charcoal/80 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                save cocktail recipes, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-charcoal/80 space-y-2">
                <li>Email address and display name</li>
                <li>Profile information (optional)</li>
                <li>Your saved bar ingredients and favorite cocktails</li>
                <li>Usage data and preferences</li>
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
                3. Cookies and Tracking Technologies
              </h2>
              <p className="text-charcoal/80 mb-4">
                We use cookies and similar tracking technologies to track activity on our service 
                and hold certain information. Cookies are files with a small amount of data which 
                may include an anonymous unique identifier.
              </p>
              <p className="text-charcoal/80">
                You can instruct your browser to refuse all cookies or to indicate when a cookie 
                is being sent. However, if you do not accept cookies, you may not be able to use 
                some portions of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                4. Data Security
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
                5. Third-Party Services
              </h2>
              <p className="text-charcoal/80 mb-4">
                We may use third-party services that collect, monitor, and analyze data. These 
                third-party service providers have their own privacy policies addressing how 
                they use such information.
              </p>
              <p className="text-charcoal/80">
                Our service may contain links to other sites. If you click on a third-party link, 
                you will be directed to that site. We strongly advise you to review the Privacy 
                Policy of every site you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                6. Your Choices
              </h2>
              <p className="text-charcoal/80 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-charcoal/80 space-y-2">
                <li>Access and update your account information at any time</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-charcoal/80">
                Our service is intended for users who are of legal drinking age in their 
                jurisdiction. We do not knowingly collect personally identifiable information 
                from anyone under the legal drinking age.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-charcoal/80">
                We may update our Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the 
                &quot;Last updated&quot; date at the top of this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">
                9. Contact Us
              </h2>
              <p className="text-charcoal/80">
                If you have any questions about this Privacy Policy, please contact us through 
                our <a href="/contact" className="text-terracotta hover:text-terracotta-dark underline">contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}


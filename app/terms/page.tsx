import { MainContainer } from "@/components/layout/MainContainer";
import { generatePageMetadata } from "@/lib/seo";
import Link from "next/link";

const LAST_UPDATED = "August 12, 2026";

export const metadata = generatePageMetadata({
  title: "Terms of Service",
  description: "Terms of Service for MixWise — the cocktail recipes, mix tool, and account features at getmixwise.com.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-16 bg-cream min-h-screen">
      <MainContainer>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none text-charcoal">
            <p className="text-sage text-sm mb-8">Last updated: {LAST_UPDATED}</p>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">1. Agreement</h2>
              <p className="text-charcoal/80 mb-4">
                These Terms of Service govern your use of MixWise (getmixwise.com) and related
                features, including cocktail recipes, the mix tool, accounts, shopping lists, and
                email newsletters. By using the site you agree to these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">2. Age requirement</h2>
              <p className="text-charcoal/80 mb-4">
                MixWise is intended for people of legal drinking age in their jurisdiction. You
                may not use the service if you are under that age.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">3. Accounts</h2>
              <p className="text-charcoal/80 mb-4">
                You are responsible for the information you provide and for keeping your login
                details secure. You may delete your account from account settings or by contacting
                us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">4. Content and recipes</h2>
              <p className="text-charcoal/80 mb-4">
                Recipes, instructions, and related content are provided for home bartending
                inspiration. Drink responsibly. MixWise does not guarantee that any recipe is
                complete, accurate, or suitable for you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">5. Acceptable use</h2>
              <p className="text-charcoal/80 mb-4">
                Do not misuse the service, attempt to access other users&apos; data, scrape the
                site in a way that disrupts it, or use MixWise for anything unlawful.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">6. Emails</h2>
              <p className="text-charcoal/80 mb-4">
                If you create an account or join a newsletter, we may send related emails. You can
                unsubscribe using the link in those emails or from your account preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">7. Disclaimer</h2>
              <p className="text-charcoal/80 mb-4">
                The service is provided as-is. We are not liable for drinks you make, ingredients
                you buy, or decisions you make based on content on the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">8. Changes</h2>
              <p className="text-charcoal/80 mb-4">
                We may update these terms from time to time. Continued use of MixWise after
                changes are posted means you accept the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-bold text-forest mb-4">9. Contact</h2>
              <p className="text-charcoal/80">
                Questions about these terms: use our{" "}
                <Link href="/contact" className="text-terracotta hover:text-terracotta-dark underline">
                  contact page
                </Link>
                . See also our{" "}
                <Link href="/privacy" className="text-terracotta hover:text-terracotta-dark underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}

import { Metadata } from "next";

export default function PublicBarPage({ params }: { params: { userId: string } }) {
  return (
    <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚧</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-forest mb-4">
            Share My Bar - Coming Soon
          </h1>
          <p className="text-sage text-lg mb-8 max-w-2xl mx-auto">
            We're working on bringing you the ability to share your bar with friends and discover what cocktails others can make. This feature will be available soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
            >
              ← Back to Home
            </a>
            <a
              href="/mix"
              className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
            >
              Try Mix Tool
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
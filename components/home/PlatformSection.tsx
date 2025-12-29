"use client";

export function PlatformSection() {
  return (
    <section className="bg-[#2C3628] text-[#F9F7F2] py-32 lg:py-40 xl:py-48 rounded-t-[3rem] relative overflow-hidden mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-display max-w-2xl leading-[1.1] mb-6 text-[#E6EBE4]">
            Everything you need to master home mixology.
          </h2>
          <div className="h-1 w-24 bg-[#BC5A45] rounded-full"></div>
        </div>

        {/* Grid Container */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">

          {/* Column 1 */}
          <div className="relative group pt-8 border-t border-white/10 md:border-t-0 hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute -top-12 -left-4 text-[140px] leading-none font-display italic text-white opacity-[0.05] select-none pointer-events-none z-0">1</div>
            <div className="relative z-10 pt-4">
              <h3 className="text-3xl font-display mb-4 text-white">Curated Recipes</h3>
              <p className="text-[#D1DAD0] leading-relaxed mb-8 pr-8">
                Explore an extensive collection of handcrafted cocktails, complete with historical context and precise measurements.
              </p>
              <a
                href="/cocktails"
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-[#8A9A5B] hover:text-white transition-colors gap-3"
              >
                Start Browsing <span className="bg-[#8A9A5B]/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">→</span>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="relative group pt-8 border-t border-white/10 md:border-t-0 hover:-translate-y-2 transition-transform duration-500 delay-100">
            <div className="absolute -top-12 -left-4 text-[140px] leading-none font-display italic text-white opacity-[0.05] select-none pointer-events-none z-0">2</div>
            <div className="relative z-10 pt-4">
              <h3 className="text-3xl font-display mb-4 text-white">My Cabinet</h3>
              <p className="text-[#D1DAD0] leading-relaxed mb-8 pr-8">
                Input your available spirits and mixers to instantly generate a personalized menu of cocktails you can craft right now.
              </p>
              <a
                href="/mix"
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-[#BC5A45] hover:text-white transition-colors gap-3"
              >
                Launch My Cabinet <span className="bg-[#BC5A45]/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">→</span>
              </a>
            </div>
          </div>

          {/* Column 3 */}
          <div className="relative group pt-8 border-t border-white/10 md:border-t-0 hover:-translate-y-2 transition-transform duration-500 delay-200">
            <div className="absolute -top-12 -left-4 text-[140px] leading-none font-display italic text-white opacity-[0.05] select-none pointer-events-none z-0">3</div>
            <div className="relative z-10 pt-4">
              <h3 className="text-3xl font-display mb-4 text-white">Master Class</h3>
              <p className="text-[#D1DAD0] leading-relaxed mb-8 pr-8">
                Elevate your home bartending with expert guides on essential techniques, glassware selection, and preparation.
              </p>
              <a
                href="/about"
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-[#8A9A5B] hover:text-white transition-colors gap-3"
              >
                Read Guides <span className="bg-[#8A9A5B]/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

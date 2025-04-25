import KeywordAnalyzer from "@/components/keyword-analyzer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
      {/* Dot pattern background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(#1e3a8a 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        ></div>
      </div>

      <header className="relative z-10 py-8 px-6">
        <div className="container mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <img src="/moskal-logo.png" alt="Moskal Logo" className="w-12 h-12" />
            <h1 className="text-[#0047AB] text-3xl font-bold tracking-tight">MOSKAL</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-white border border-blue-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#0047AB] mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Keyword Analysis Tool</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            <span className="text-[#0047AB]">Discover</span> relevant keywords for your social media analysis
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Uncover trending topics and sentiment patterns before they hit the headlines.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <KeywordAnalyzer />
        </div>
      </main>

      <footer className="relative z-10 py-8 mt-12 border-t border-blue-100">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Moskal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

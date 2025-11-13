import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded"></div>
            <span className="font-semibold text-slate-900">Pathways</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Build Your Organization
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Start by creating your organizational structure. Define your hierarchy, branches, and teams to lay the foundation for effective project management.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/organization/create")}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 mb-4"
          >
            Create Your Organization
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          {/* Secondary Text */}
          <p className="text-sm text-slate-500">
            Takes less than 5 minutes to set up
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500">
            © 2025 Pathways. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useOrgStore } from "../store/orgStore";

export default function WizardShell({ children }) {
  const step = useOrgStore((s) => s.step);

  const percent = ((step + 1) / 4) * 100; // 4-step wizard

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      
      {/* Header */}
      <header className="py-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create Your Organization
        </h1>
        <p className="text-gray-500 text-sm">
          Let's get you set up in just a few steps
        </p>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-10">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-6">{children}</div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        © 2025 Pathways. All rights reserved.
      </footer>
    </div>
  );
}

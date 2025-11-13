import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

export default function InitiationStep2() {
  const navigate = useNavigate();
  const {
    projectPurpose,
    targetAudience,
    setProjectPurpose,
    setTargetAudience,
  } = useProjectStore();

  const [localPurpose, setLocalPurpose] = useState(projectPurpose);
  const [localAudience, setLocalAudience] = useState(targetAudience);

  const handleContinue = () => {
    if (!localPurpose.trim() || !localAudience.trim()) return;
    setProjectPurpose(localPurpose);
    setTargetAudience(localAudience);
    navigate("/projects/create/step3");
  };

  const handleBack = () => {
    navigate("/projects/create/step1");
  };

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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Project Initiation
            </h1>
            <p className="text-slate-600">
              Define your project in 5 simple steps
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Step 2 of 5
                </span>
                <span className="text-sm text-slate-500">40%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    The Project WHY
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Why are we doing this and who benefits from it?
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex gap-3">
                <svg
                  className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm text-purple-900">
                  Explain the purpose and value this project brings
                </p>
              </div>

              {/* Project Purpose */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Project Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={localPurpose}
                  onChange={(e) => setLocalPurpose(e.target.value)}
                  placeholder="Why are we doing this project? What problem does it solve?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  The business case and rationale for this project
                </p>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Target Audience / Beneficiary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={localAudience}
                  onChange={(e) => setLocalAudience(e.target.value)}
                  placeholder="Who will benefit from this project? What need does it answer for them?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Identify the stakeholders who will benefit from the work
                </p>
              </div>
            </div>

            {/* Button Group */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!localPurpose.trim() || !localAudience.trim()}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

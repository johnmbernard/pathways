import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

export default function InitiationStep4() {
  const navigate = useNavigate();
  const { estimatedBudget, setEstimatedBudget } = useProjectStore();
  const [localBudget, setLocalBudget] = useState(
    estimatedBudget ? estimatedBudget.toString() : ""
  );

  const handleContinue = () => {
    if (localBudget) {
      setEstimatedBudget(parseInt(localBudget, 10));
    }
    navigate("/projects/create/step5");
  };

  const handleSkip = () => {
    setEstimatedBudget(null);
    navigate("/projects/create/step5");
  };

  const handleBack = () => {
    navigate("/projects/create/step3");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
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
                  Step 4 of 5
                </span>
                <span className="text-sm text-slate-500">80%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: "80%" }}
                ></div>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    The Project COST
                  </h2>
                  <p className="text-slate-600 text-sm">
                    What is the estimated budget for this project?
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm text-green-900">
                  Estimate the total budget required for this project
                </p>
              </div>

              {/* Budget Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Estimated Budget
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500">$</span>
                  <input
                    type="number"
                    value={localBudget}
                    onChange={(e) => setLocalBudget(e.target.value)}
                    placeholder="150000"
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total estimated cost to complete the project
                </p>
              </div>

              {/* Completion Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Completion Summary
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Project What: Complete
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Project Why: Complete
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Project Who: Pending (Optional)
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1" />
                      </svg>
                      Project Cost: Pending (Optional)
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1" />
                      </svg>
                      Project When: Pending (Optional)
                    </span>
                  </li>
                </ul>
              </div>

              {localBudget && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    Estimated budget: <span className="font-semibold">{formatCurrency(parseInt(localBudget, 10))}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Button Group */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 text-slate-700 font-medium border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  Skip to Review
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

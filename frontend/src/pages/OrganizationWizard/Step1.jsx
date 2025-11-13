import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrgStore } from "../../store/orgStore";

export default function Step1() {
  const navigate = useNavigate();
  const { orgName, setOrgName } = useOrgStore();
  const [localName, setLocalName] = useState(orgName);

  const handleContinue = () => {
    if (!localName.trim()) return;
    setOrgName(localName);
    navigate("/organization/create/step2");
  };

  const handleBack = () => {
    navigate("/");
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
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Create Your Organization
            </h1>
            <p className="text-slate-600">
              Let's get you set up in just a few steps
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">

            {/* Form Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Organization Details
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                What would you like to call your organization?
              </p>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm text-blue-900">
                  Choose a name that represents your organization
                </p>
              </div>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleContinue()}
                  placeholder="e.g., Synapse Solutions LLC"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                disabled={!localName.trim()}
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


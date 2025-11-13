import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

export default function InitiationStep1() {
  const navigate = useNavigate();
  const {
    projectName,
    projectDescription,
    setProjectName,
    setProjectDescription,
  } = useProjectStore();

  const [localName, setLocalName] = useState(projectName);
  const [localDescription, setLocalDescription] = useState(projectDescription);

  const handleContinue = () => {
    if (!localName.trim() || !localDescription.trim()) return;
    setProjectName(localName);
    setProjectDescription(localDescription);
    navigate("/projects/create/step2");
  };

  const handleBack = () => {
    navigate("/dashboard");
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
                  Step 1 of 5
                </span>
                <span className="text-sm text-slate-500">20%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    The Project WHAT
                  </h2>
                  <p className="text-slate-600 text-sm">
                    What is this project and what does it aim to deliver?
                  </p>
                </div>
              </div>

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
                  Define what this project is and what it will deliver
                </p>
              </div>

              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="e.g., Website Redesign Initiative"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  placeholder="Describe what this project will deliver in 2-3 sentences..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  A brief overview of the project scope and deliverables
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
                disabled={!localName.trim() || !localDescription.trim()}
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

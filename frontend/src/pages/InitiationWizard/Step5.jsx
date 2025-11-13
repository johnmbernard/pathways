import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

export default function InitiationStep5() {
  const navigate = useNavigate();
  const {
    plannedStartDate,
    targetCompletionDate,
    setPlannedStartDate,
    setTargetCompletionDate,
  } = useProjectStore();

  const [localStartDate, setLocalStartDate] = useState(plannedStartDate || "");
  const [localEndDate, setLocalEndDate] = useState(targetCompletionDate || "");

  const handleContinue = () => {
    if (localStartDate) setPlannedStartDate(localStartDate);
    if (localEndDate) setTargetCompletionDate(localEndDate);
    navigate("/projects/hub");
  };

  const handleSkip = () => {
    setPlannedStartDate(null);
    setTargetCompletionDate(null);
    navigate("/projects/hub");
  };

  const handleBack = () => {
    navigate("/projects/create/step4");
  };

  const calculateDuration = () => {
    if (!localStartDate || !localEndDate) return null;
    const start = new Date(localStartDate);
    const end = new Date(localEndDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days;
  };

  const duration = calculateDuration();

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
                  Step 5 of 5
                </span>
                <span className="text-sm text-slate-500">100%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.04l4.12-5.23L12.5 7l-3.54 4.29z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    The Project WHEN
                  </h2>
                  <p className="text-slate-600 text-sm">
                    When do you plan to start and complete this project?
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3">
                <svg
                  className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm text-orange-900">
                  Set your project timeline and key milestones
                </p>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Planned Start Date
                  </label>
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>

              {/* Duration Display */}
              {duration !== null && duration >= 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Project Duration:</span> {duration} days
                    {duration > 0 && ` (approximately ${Math.ceil(duration / 7)} weeks)`}
                  </p>
                </div>
              )}

              {duration !== null && duration < 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <p className="text-sm text-red-900">
                    End date must be after start date
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
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";
import { useOrgStore } from "../../store/orgStore";

export default function InitiationStep3() {
  const navigate = useNavigate();
  const { selectedTeams, setSelectedTeams } = useProjectStore();
  const { orgBranches } = useOrgStore();
  const [localTeams, setLocalTeams] = useState(selectedTeams);

  const flattenBranches = (nodes, level = 0) => {
    return nodes.reduce((acc, node) => {
      acc.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        acc.push(...flattenBranches(node.children, level + 1));
      }
      return acc;
    }, []);
  };

  const allBranches = flattenBranches(orgBranches);

  const toggleTeam = (teamId) => {
    setLocalTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleContinue = () => {
    setSelectedTeams(localTeams);
    navigate("/projects/create/step4");
  };

  const handleSkip = () => {
    setSelectedTeams([]);
    navigate("/projects/create/step4");
  };

  const handleBack = () => {
    navigate("/projects/create/step2");
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
                  Step 3 of 5
                </span>
                <span className="text-sm text-slate-500">60%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: "60%" }}
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
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    The Project WHO
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Which teams from your organization will be involved?
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
                  Select teams from your organization that will be involved
                </p>
              </div>

              {/* Teams List */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-4">
                  Select Teams (Optional)
                </label>
                {allBranches.length > 0 ? (
                  <div className="space-y-2 border border-slate-200 rounded-lg p-4 bg-slate-50 max-h-64 overflow-y-auto">
                    {allBranches.map((branch) => (
                      <label
                        key={branch.id}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={localTeams.includes(branch.id)}
                          onChange={() => toggleTeam(branch.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className="text-sm text-slate-700"
                          style={{ paddingLeft: `${branch.level * 12}px` }}
                        >
                          {branch.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    No teams available. Create teams in your organization structure first.
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  You can update this later
                </p>
              </div>

              {/* Selected Count */}
              {localTeams.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">{localTeams.length}</span> team
                    {localTeams.length !== 1 ? "s" : ""} selected
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

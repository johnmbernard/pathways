import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";
import Nav from "../components/Nav";

export default function Projects() {
  const navigate = useNavigate();
  const { projectName, scopeFeatures } = useProjectStore();
  
  const mvpFeaturesCount = scopeFeatures.filter(f => f.isMVP).length;
  const acceptanceCriteriaCount = scopeFeatures.filter(f => f.acceptanceCriteria).length;

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Navigation Sidebar */}
      <Nav />

      {/* Main Content */}
      <div className="flex-1 ml-64">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <p className="text-xs text-slate-500">Project Hub</p>
              <p className="font-semibold text-slate-900">{projectName || "Project"}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Project Info
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12">
          <div className="flex gap-4">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Welcome to Your Project Hub! 🎉
              </h2>
              <p className="text-slate-700 mb-2">
                Your project has been initiated. Now it's time to build the foundation using the triple constraint framework: <span className="font-semibold">Schedule, Cost, and Performance</span>.
              </p>
              <p className="text-slate-600 text-sm">
                Complete each wizard below to unlock comprehensive project tracking and management capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Reminder Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-12 flex gap-3">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Reminder:</span> You have 3 optional initiation sections pending. Consider completing teams, timeline, and budget before proceeding.
          </p>
        </div>

        {/* Project Foundation Wizards */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Project Foundation Setup
          </h3>
          <p className="text-slate-600 mb-8">
            Complete these wizards in sequence to build your project foundation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Scope Card - Step 1 (Mandatory) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 2C5.13 2 2 5.13 2 9v6c0 3.87 3.13 7 7 7h6c3.87 0 7-3.13 7-7V9c0-3.87-3.13-7-7-7H9zm0 2h6c2.76 0 5 2.24 5 5v6c0 2.76-2.24 5-5 5H9c-2.76 0-5-2.24-5-5V9c0-2.76 2.24-5 5-5z" />
                  </svg>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    scopeFeatures.length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {scopeFeatures.length > 0 ? '✓ Complete' : 'Step 1'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Scope</h4>
                <p className="text-sm text-slate-600">
                  {scopeFeatures.length > 0 ? 'Scope Definition' : 'Define Project Scope'}
                </p>
              </div>
              <div className="p-6">
                {scopeFeatures.length > 0 ? (
                  <>
                    <div className="mb-4 space-y-3">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600">Total Features</p>
                        <p className="text-2xl font-bold text-indigo-600">{scopeFeatures.length}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600">MVP Features</p>
                        <p className="text-2xl font-bold text-green-600">{mvpFeaturesCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Acceptance Criteria</p>
                        <div className="space-y-1">
                          {scopeFeatures
                            .filter(f => f.acceptanceCriteria)
                            .slice(0, 2)
                            .map(f => (
                              <div key={f.id} className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                <span className="text-sm text-slate-700">{f.title}</span>
                              </div>
                            ))}
                          {acceptanceCriteriaCount > 2 && (
                            <p className="text-xs text-slate-500 ml-6">+{acceptanceCriteriaCount - 2} more</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-slate-600 mb-2">MVP Coverage</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${scopeFeatures.length > 0 ? (mvpFeaturesCount / scopeFeatures.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{Math.round((mvpFeaturesCount / (scopeFeatures.length || 1)) * 100)}%</p>
                    </div>
                    <button
                      onClick={() => navigate('/projects/foundation/scope')}
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Edit Scope
                      <svg
                        className="w-4 h-4 inline ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-700 mb-4">
                      Define your project scope, acceptance criteria, and quality standards.
                    </p>
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-slate-600 mb-3">You'll define:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          Project scope
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          Acceptance criteria
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          Quality standards
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => navigate('/projects/foundation/scope')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Start Scope Wizard
                      <svg
                        className="w-4 h-4 inline ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Schedule Card - Step 2 (Mandatory) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7h-4v4h4v-4z" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    Step 2
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Schedule</h4>
                <p className="text-sm text-slate-600">Work Breakdown & Timeline</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 mb-4">
                  Guide your team through requirements gathering and build a comprehensive Work Breakdown Structure (WBS) or Product Backlog.
                </p>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-600 mb-3">What you'll create:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Requirements & deliverables
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Hierarchical work structure
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Milestones & dependencies
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Critical path analysis
                    </li>
                  </ul>
                </div>
                {scopeFeatures.length > 0 ? (
                  <button onClick={() => navigate('/projects/foundation/schedule')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Start Schedule Wizard
                    <svg
                      className="w-4 h-4 inline ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <button onClick={() => navigate('/projects/foundation/scope')} className="w-full bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors opacity-80">
                    Complete Scope First
                  </button>
                )}
              </div>
            </div>

            {/* Cost Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.85v-1.93c-1.3-.98-2.47-2.48-2.56-4.39h2.05c.09 1.32.75 2.55 2.51 2.55.75 0 1.43-.36 1.43-1.09 0-.58-.66-1.18-2.05-1.49-.93-.23-2.13-.66-2.13-2.41 0-1.26 1.08-2.28 2.56-2.33V8h2.85v1.95c.86.18 1.71.55 2.05 1.45h-2.05c-.09-.25-.67-1.04-1.85-1.04-.79 0-1.37.45-1.37 1.1 0 .55.78 1.16 2.05 1.49.93.23 2.13.66 2.13 2.41 0 .9-.64 1.78-1.98 2.15z" />
                  </svg>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    Step 3 (Optional)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Cost</h4>
                <p className="text-sm text-slate-600">Budget Allocation & Resources</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 mb-4">
                  Allocate your budget to resources, teams, and work packages to enable real-time cost tracking.
                </p>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-600 mb-3">You'll create:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Resource allocation
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Cost baselines
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Earned value metrics
                    </li>
                  </ul>
                </div>
                <button className="w-full bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-not-allowed opacity-75">
                  Start Cost Wizard
                  <svg
                    className="w-4 h-4 inline ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-10 h-10 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Step 4 (Optional)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Performance</h4>
                <p className="text-sm text-slate-600">Quality Standards & Metrics</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 mb-4">
                  Define quality standards and performance metrics to track scope creep and measure success.
                </p>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-600 mb-3">You'll create:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Quality metrics & KPIs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Acceptance criteria
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Change control process
                    </li>
                  </ul>
                </div>
                <button className="w-full bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-not-allowed opacity-75">
                  Start Performance Wizard
                  <svg
                    className="w-4 h-4 inline ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Project Setup Progress */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Project Setup Progress</h3>
          </div>
          <p className="text-slate-600 mb-6">
            Complete all three wizards to unlock full project management
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-slate-900">Wizards Completed</p>
                <p className="text-sm font-bold text-slate-900">0 / 3</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Setup Progress</p>
              <p className="text-xs text-slate-400">0%</p>
            </div>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}

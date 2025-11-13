import { useNavigate } from "react-router-dom";
import { useOrgStore } from "../store/orgStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { orgName } = useOrgStore();

  const handleNewProject = () => {
    navigate("/projects/create");
  };

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded"></div>
              <span className="font-semibold text-slate-900">Pathways</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <p className="text-xs text-slate-500">Organization</p>
              <p className="font-medium text-slate-900">{orgName || "Your Organization"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Dashboard Overview Section */}
        <section className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Dashboard Overview
              </h1>
              <p className="text-slate-600">
                Monitor your projects across cost, schedule, and performance metrics
              </p>
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Customize Dashboard
            </button>
          </div>

          {/* Widgets Container */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="w-16 h-16 text-slate-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No widgets added yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md">
                Customize your dashboard by adding widgets to monitor key metrics across your projects.
              </p>
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add Widget
              </button>
            </div>
          </div>
        </section>

        {/* Active Projects Section */}
        <section>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Active Projects
              </h2>
              <p className="text-slate-600">
                Track cost, schedule, and performance for each project
              </p>
            </div>
            <button
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              New Project
            </button>
          </div>

          {/* Empty State - Active Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No projects yet
            </h3>
            <p className="text-slate-600 mb-6">
              Get started by creating your first project to track costs, schedules, and performance.
            </p>
            <button
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add your first project
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

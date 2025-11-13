import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrgStore } from "../store/orgStore";
import { useProjectStore } from "../store/projectStore";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgName } = useOrgStore();
  const { projectName } = useProjectStore();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded"></div>
          <span className="font-bold text-slate-900">Pathways</span>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Create/Edit Organization Section */}
        <div>
          <button
            onClick={() => toggleSection("organization")}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Organization</p>
                <p className="font-semibold text-slate-900 truncate">
                  {orgName || "Create Organization"}
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${
                expandedSection === "organization" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {expandedSection === "organization" && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
              <button
                onClick={() => navigate("/organization/create")}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
              >
                {orgName ? "Edit Organization" : "Create Organization"}
              </button>
              {orgName && (
                <button
                  onClick={() => navigate("/organization/create/step2")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit Structure
                </button>
              )}
            </div>
          )}
        </div>

        {/* Project Initiation Section */}
        {projectName && (
          <div>
            <button
              onClick={() => toggleSection("initiation")}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 text-left">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Project Initiation</p>
                  <p className="font-semibold text-slate-900 truncate">{projectName}</p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === "initiation" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {expandedSection === "initiation" && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                  Mandatory
                </p>
                <button
                  onClick={() => navigate("/projects/create")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit What
                </button>
                <button
                  onClick={() => navigate("/projects/create/step2")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit Why
                </button>

                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase mt-3">
                  Optional
                </p>
                <button
                  onClick={() => navigate("/projects/create/step3")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit Who
                </button>
                <button
                  onClick={() => navigate("/projects/create/step4")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit When
                </button>
                <button
                  onClick={() => navigate("/projects/create/step5")}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Edit Cost
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Create Project - Always show if org exists */}
        {orgName && !projectName && (
          <button
            onClick={() => navigate("/projects/create")}
            className="w-full flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg transition-colors font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Create Project
          </button>
        )}

        {/* Project Foundations Section */}
        {projectName && (
          <div>
            <button
              onClick={() => toggleSection("foundations")}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 text-left">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Project Foundations</p>
                  <p className="font-semibold text-slate-900">Wizards</p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === "foundations" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {expandedSection === "foundations" && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                  Mandatory
                </p>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Scope Wizard
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Schedule Wizard
                </button>

                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase mt-3">
                  Optional
                </p>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Cost Wizard
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  Performance Wizard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive("/dashboard")
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          Dashboard
        </button>
        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive("/")
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
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
    </nav>
  );
}

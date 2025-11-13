import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrgStore } from "../../store/orgStore";

export default function Step2() {
  const navigate = useNavigate();
  const { orgName, orgBranches, addBranch, addChildBranch, deleteBranch } = useOrgStore();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [editingParentId, setEditingParentId] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const toggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const startAddingBranch = (parentId = null) => {
    setEditingParentId(parentId);
    setInputValue("");
  };

  const handleAddBranch = () => {
    if (!inputValue.trim()) return;

    if (editingParentId === null) {
      // Adding top-level branch
      addBranch(inputValue.trim());
    } else {
      // Adding sub-branch
      addChildBranch(editingParentId, inputValue.trim());
      // Ensure parent is expanded
      const newExpanded = new Set(expandedNodes);
      newExpanded.add(editingParentId);
      setExpandedNodes(newExpanded);
    }

    setEditingParentId(null);
    setInputValue("");
  };

  const cancelAdd = () => {
    setEditingParentId(null);
    setInputValue("");
  };

  const countAllBranches = (nodes) => {
    return nodes.reduce((count, node) => {
      return count + 1 + countAllBranches(node.children || []);
    }, 0);
  };

  const renderTreeNode = (node, level = 0, parentId = null) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isTopLevel = level === 0;

    return (
      <div key={node.id}>
        <div className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 group ${
          isTopLevel ? "mb-3" : "ml-6 mb-1"
        }`}>
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
          )}
          {!hasChildren && <span className="w-4"></span>}

          <span className={`flex-1 ${isTopLevel ? "font-medium text-slate-900" : "text-slate-700"}`}>
            {node.name}
          </span>

          {isTopLevel && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              Top Level
            </span>
          )}

          <button
            onClick={() => startAddingBranch(node.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
            title="Add sub-branch"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={() => deleteBranch(node.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
            title="Delete branch"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-2 pl-2">
            {node.children.map((child) => renderTreeNode(child, level + 1, node.id))}
          </div>
        )}

        {editingParentId === node.id && (
          <div className={`flex gap-2 py-2 px-3 rounded-lg ${isTopLevel ? "mb-3" : "ml-6 mb-1"}`}>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAddBranch();
                  if (e.key === "Escape") cancelAdd();
                }}
                autoFocus
                placeholder="Enter branch name..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleAddBranch}
                disabled={!inputValue.trim()}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={cancelAdd}
                className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalBranches = countAllBranches(orgBranches);

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
        <div className="max-w-3xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Create Your Organization
            </h1>
            <p className="text-slate-600">
              Let's get you set up in just a few steps
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
            {/* Form Section Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Organization Structure
              </h2>
              <p className="text-slate-600 text-sm">
                Build your organizational hierarchy with tiers and branches
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Build your organizational hierarchy by adding branches and sub-branches. Start with your top-level divisions, then add teams, departments, or any structure that fits your organization.
                  </p>
                  <p className="text-xs text-blue-800">
                    Tip: You can nest branches as deep as you need to represent your entire organization structure.
                  </p>
                </div>
              </div>
            </div>

            {/* Tree Structure */}
            <div className="mb-8 border border-slate-200 rounded-lg p-6 bg-slate-50">
              {orgName && (
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand("root")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedNodes.has("root") ? "rotate-90" : ""}`}
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
                    <span className="font-bold text-slate-900">{orgName}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Top Level
                    </span>
                  </div>
                </div>
              )}

              {expandedNodes.has("root") && (
                <div>
                  {orgBranches.length > 0 ? (
                    <div>
                      {orgBranches.map((branch) => renderTreeNode(branch))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic mb-4">
                      No branches yet. Add your first branch below.
                    </p>
                  )}

                  {editingParentId === null && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            if (inputValue.trim()) {
                              addBranch(inputValue.trim());
                              setInputValue("");
                            }
                          }
                        }}
                        placeholder="Enter branch name..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => {
                          if (inputValue.trim()) {
                            addBranch(inputValue.trim());
                            setInputValue("");
                          }
                        }}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setInputValue("")}
                        className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Branch Count */}
            <p className="text-sm text-slate-600 mb-8">
              Total branches: <span className="font-semibold text-slate-900">{totalBranches}</span>
            </p>

            {/* Button Group */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={() => navigate("/organization/create")}
                className="px-6 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Create Organization
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

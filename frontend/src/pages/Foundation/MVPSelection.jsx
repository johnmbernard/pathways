import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useProjectStore } from "../../store/projectStore";

const HIERARCHY_COLORS = {
  0: { bg: "#c7d2fe", text: "#4338ca", border: "#4f46e5", label: "Epic" },
  1: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", label: "Feature" },
  2: { bg: "#bbf7d0", text: "#065f46", border: "#10b981", label: "Sub-feature" },
  3: { bg: "#ddd6fe", text: "#5b21b6", border: "#8b5cf6", label: "Task" },
};

export default function MVPSelection() {
  const navigate = useNavigate();
  const { scopeFeatures, updateFeature } = useProjectStore();
  const [mvpItems, setMvpItems] = useState(new Set());
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Build parent-child map and root items
  useEffect(() => {
    const root = scopeFeatures.filter((f) => !f.parentId);
    setExpandedItems(new Set(root.map((f) => f.id)));
  }, [scopeFeatures]);

  function getChildren(id) {
    return scopeFeatures.filter((f) => f.parentId === id);
  }

  function toggleMVP(id) {
    const newMvp = new Set(mvpItems);
    if (newMvp.has(id)) {
      newMvp.delete(id);
      // Also remove children from MVP if parent is removed
      const removeDescendants = (itemId) => {
        getChildren(itemId).forEach((child) => {
          newMvp.delete(child.id);
          removeDescendants(child.id);
        });
      };
      removeDescendants(id);
    } else {
      newMvp.add(id);
    }
    setMvpItems(newMvp);
  }

  function toggleExpanded(id) {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  }

  function handleSaveMVP() {
    scopeFeatures.forEach((f) => {
      if (mvpItems.has(f.id)) {
        updateFeature(f.id, { isMVP: true });
      } else {
        updateFeature(f.id, { isMVP: false });
      }
    });
    navigate("/projects");
  }

  function selectAllEpics() {
    const rootItems = scopeFeatures.filter((f) => !f.parentId && f.hierarchy === 0);
    const newMvp = new Set(rootItems.map((f) => f.id));
    setMvpItems(newMvp);
  }

  function clearAll() {
    setMvpItems(new Set());
  }

  const rootItems = scopeFeatures.filter((f) => !f.parentId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Nav />

      <div className="flex-1 ml-64 flex flex-col">
        <header className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-slate-500">Scope Wizard</p>
              <p className="font-semibold text-slate-900">Define Minimum Viable Product (MVP)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/projects/foundation/scope")} className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200">
              Back to Scope
            </button>
            <button onClick={handleSaveMVP} className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">
              Save & Continue
            </button>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Select MVP Features</h2>
                <p className="text-sm text-slate-600">
                  Choose which features should be included in your Minimum Viable Product. Select at least the epics that make up your core offering.
                </p>
              </div>

              {rootItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No scope items found. Please create scope features first.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {rootItems.map((item) => (
                    <FeatureTreeNode
                      key={item.id}
                      feature={item}
                      onToggleMVP={toggleMVP}
                      onToggleExpanded={toggleExpanded}
                      isExpanded={expandedItems.has(item.id)}
                      isMVP={mvpItems.has(item.id)}
                      getChildren={getChildren}
                      depth={0}
                      mvpItems={mvpItems}
                      expandedItems={expandedItems}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 flex flex-col gap-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={selectAllEpics}
                  className="w-full px-3 py-2 text-sm border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50 font-medium"
                >
                  Select All Epics
                </button>
                <button
                  onClick={clearAll}
                  className="w-full px-3 py-2 text-sm border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-sm mb-3">MVP Summary</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Total Features:</span>
                  <span className="ml-2 font-bold text-slate-900">{scopeFeatures.length}</span>
                </div>
                <div>
                  <span className="text-slate-600">MVP Items:</span>
                  <span className="ml-2 font-bold text-indigo-600">{mvpItems.size}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-600">Coverage:</span>
                  <span className="ml-2 font-bold text-slate-900">
                    {scopeFeatures.length > 0 ? Math.round((mvpItems.size / scopeFeatures.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Hierarchy Legend */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-sm mb-3">Hierarchy</h3>
              <div className="space-y-2">
                {Object.entries(HIERARCHY_COLORS).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
                    ></div>
                    <span className="text-xs text-slate-700">{color.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureTreeNode({
  feature,
  onToggleMVP,
  onToggleExpanded,
  isExpanded,
  isMVP,
  getChildren,
  depth,
  mvpItems,
  expandedItems,
}) {
  const children = getChildren(feature.id);
  const hasChildren = children.length > 0;
  const color = HIERARCHY_COLORS[feature.hierarchy] || HIERARCHY_COLORS[0];

  return (
    <div>
      <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer group">
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(feature.id);
            }}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-5 h-5 flex-shrink-0"></div>
        )}

        <input
          type="checkbox"
          checked={isMVP}
          onChange={() => onToggleMVP(feature.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
        />

        <div
          className="flex-1 px-2 py-1 rounded text-sm font-medium truncate"
          style={{
            backgroundColor: color.bg,
            color: color.text,
            border: isMVP ? `2px solid ${color.border}` : `1px solid ${color.border}`,
          }}
        >
          {feature.title}
        </div>

        <span className="text-xs text-slate-400 px-2">{isMVP ? "✓ MVP" : ""}</span>
      </div>

      {hasChildren && isExpanded && (
        <div style={{ paddingLeft: `${(depth + 1) * 20}px` }} className="space-y-1">
          {children.map((child) => (
            <FeatureTreeNode
              key={child.id}
              feature={child}
              onToggleMVP={onToggleMVP}
              onToggleExpanded={onToggleExpanded}
              isExpanded={expandedItems?.has?.(child.id) || false}
              isMVP={mvpItems.has(child.id)}
              getChildren={getChildren}
              depth={depth + 1}
              mvpItems={mvpItems}
              expandedItems={expandedItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}

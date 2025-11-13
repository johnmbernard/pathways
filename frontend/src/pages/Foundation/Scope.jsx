import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useProjectStore } from "../../store/projectStore";

export default function ScopeWizard() {
  const navigate = useNavigate();
  const {
    scopeFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
    moveFeature,
    toggleFeatureMVP,
    setFeatureAcceptanceCriteria,
  } = useProjectStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  function handleAdd() {
    if (!title.trim()) return;
    addFeature({ title: title.trim(), description: description.trim() });
    setTitle("");
    setDescription("");
  }

  function startEdit(f) {
    setEditingId(f.id);
    setEditTitle(f.title);
    setEditDescription(f.description);
  }

  function saveEdit(id) {
    updateFeature(id, { title: editTitle, description: editDescription });
    setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Nav />

      <div className="flex-1 ml-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <p className="text-xs text-slate-500">Scope Wizard</p>
                <p className="font-semibold text-slate-900">Define Project Features</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate("/projects")}
                className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
              >
                Back to Hub
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Add feature / instructions */}
            <section className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Add Feature</h3>
              <p className="text-sm text-slate-600 mb-4">
                Brainstorm features as sticky notes. Add details, mark as MVP, and add acceptance criteria when ready.
              </p>

              <label className="block text-sm text-slate-700 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2 mb-3"
                placeholder="Feature title"
              />

              <label className="block text-sm text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2 mb-3 h-24"
                placeholder="Short notes or user story"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2 rounded shadow"
                >
                  Add Sticky
                </button>
                <button
                  onClick={() => { setTitle(""); setDescription(""); }}
                  className="px-3 py-2 border rounded text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6 text-sm text-slate-500">
                <p className="font-medium mb-1">Quick tips</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use short titles for sticky notes.</li>
                  <li>Add acceptance criteria for clarity.</li>
                  <li>Mark key items as MVP so scheduling can prioritize them.</li>
                </ul>
              </div>
            </section>

            {/* Right: Sticky board */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Feature Board</h3>
                <p className="text-sm text-slate-600">Drag order using move buttons — top = highest priority</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scopeFeatures && scopeFeatures.length > 0 ? (
                  scopeFeatures.map((f, idx) => (
                    <div key={f.id} className="relative bg-yellow-50 rounded-lg p-4 shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {editingId === f.id ? (
                            <div>
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full border border-slate-200 rounded px-2 py-1 mb-2"
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full border border-slate-200 rounded px-2 py-1 mb-2"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(f.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 border rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-900 truncate">{f.title}</h4>
                                <span className="text-xs text-slate-600">#{f.priority + 1}</span>
                                {f.isMVP && (
                                  <span className="ml-2 text-xs text-white bg-rose-500 px-2 py-0.5 rounded-full">MVP</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{f.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex flex-col gap-1">
                            <button
                              title="Move up"
                              onClick={() => moveFeature(f.id, "up")}
                              className="w-8 h-8 bg-white border rounded flex items-center justify-center text-slate-600"
                            >
                              ▲
                            </button>
                            <button
                              title="Move down"
                              onClick={() => moveFeature(f.id, "down")}
                              className="w-8 h-8 bg-white border rounded flex items-center justify-center text-slate-600"
                            >
                              ▼
                            </button>
                          </div>

                          <div className="flex flex-col gap-1 mt-2">
                            <button
                              title="Edit"
                              onClick={() => startEdit(f)}
                              className="w-8 h-8 bg-white border rounded flex items-center justify-center text-slate-600"
                            >
                              ✎
                            </button>
                            <button
                              title="Delete"
                              onClick={() => deleteFeature(f.id)}
                              className="w-8 h-8 bg-white border rounded flex items-center justify-center text-rose-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 border-t pt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={f.isMVP}
                              onChange={() => toggleFeatureMVP(f.id)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">Mark as MVP</span>
                          </label>
                          <button
                            onClick={() => {
                              const newCrit = prompt(
                                "Edit acceptance criteria:",
                                f.acceptanceCriteria || ""
                              );
                              if (newCrit !== null) setFeatureAcceptanceCriteria(f.id, newCrit);
                            }}
                            className="text-sm text-slate-600 hover:text-slate-900"
                          >
                            {f.acceptanceCriteria ? "Edit Acceptance" : "Add Acceptance"}
                          </button>
                        </div>

                        <div className="text-xs text-slate-500">Updated {new Date(f.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No features yet — add your first sticky note.</div>
                )}
              </div>
            </section>
          </div>

          {/* Save Scope Section */}
          <section className="mt-12 bg-white border border-slate-200 rounded-xl p-8">
            <div className="max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Scope Ready</h3>
                  <p className="text-slate-600">
                    You have <span className="font-semibold">{scopeFeatures.length}</span> feature{scopeFeatures.length !== 1 ? 's' : ''} defined.
                    {scopeFeatures.filter(f => f.isMVP).length > 0 && (
                      <span> <span className="font-semibold">{scopeFeatures.filter(f => f.isMVP).length}</span> marked as MVP.</span>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-6">
                When you save your scope, these features will be available in the Schedule wizard to create work breakdown structure, timelines, and dependencies.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/projects')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Save & Continue to Schedule
                  <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors"
                >
                  Back to Hub
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

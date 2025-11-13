import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useProjectStore } from "../../store/projectStore";

function formatDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function parseDateInput(val) {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return d.toISOString();
}

export default function ScheduleWizard() {
  const navigate = useNavigate();
  const {
    scopeFeatures,
    workItems,
    addWorkItem,
    updateWorkItem,
    deleteWorkItem,
    setWorkItems,
    autoScheduleSimple,
    selectedTeams,
  } = useProjectStore();

  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => workItems.find((w) => w.id === selectedId) || null, [workItems, selectedId]);

  const [local, setLocal] = useState({});

  // keep local in sync when selection changes
  useMemo(() => {
    if (selected) {
      setLocal({
        title: selected.title,
        description: selected.description,
        estimateDays: selected.estimateDays || 1,
        assignees: selected.assignees || [],
        startDate: formatDateInput(selected.startDate),
        endDate: formatDateInput(selected.endDate),
      });
    } else {
      setLocal({});
    }
  }, [selected]);

  function handleCreateFromFeature(f) {
    const item = {
      title: f.title,
      description: f.description || f.acceptanceCriteria || "",
      featureId: f.id,
      isMVP: !!f.isMVP,
      estimateDays: 1,
    };
    addWorkItem(item);
  }

  function handleSave() {
    if (!selected) return;
    updateWorkItem(selected.id, {
      title: local.title,
      description: local.description,
      estimateDays: Number(local.estimateDays) || 1,
      assignees: local.assignees || [],
      startDate: parseDateInput(local.startDate),
      endDate: parseDateInput(local.endDate),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Nav />

      <div className="flex-1 ml-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <p className="text-xs text-slate-500">Schedule Wizard</p>
                <p className="font-semibold text-slate-900">Work Breakdown & Timeline</p>
              </div>
            </div>
            <div>
              <button onClick={() => navigate('/projects')} className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">Back to Hub</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-6">
            {/* Left column: features and work items */}
            <div className="w-1/3">
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-2">Create from Scope</h4>
                <p className="text-sm text-slate-600 mb-3">Convert features into work items quickly.</p>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {scopeFeatures.length > 0 ? (
                    scopeFeatures.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-slate-800 truncate">{f.title}</div>
                          <div className="text-xs text-slate-500">{f.isMVP ? 'MVP' : ''}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleCreateFromFeature(f)} className="px-2 py-1 text-xs bg-yellow-400 rounded">Create</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No scope features yet. Create scope first.</div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Work Items</h4>
                  <div className="flex gap-2">
                    <button onClick={() => autoScheduleSimple()} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">Auto-schedule MVP</button>
                    <button onClick={() => setWorkItems([])} className="text-sm px-2 py-1 border rounded">Clear</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[48vh] overflow-auto">
                  {workItems.length > 0 ? (
                    workItems.map((w) => (
                      <div key={w.id} onClick={() => setSelectedId(w.id)} className={`p-3 rounded cursor-pointer ${selectedId === w.id ? 'bg-slate-100' : 'bg-white'} border`}> 
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-800 truncate">{w.title}</div>
                            <div className="text-xs text-slate-500">{w.estimateDays} day(s){w.isMVP ? ' • MVP' : ''}</div>
                          </div>
                          <div className="text-xs text-slate-400">{w.startDate ? formatDateInput(w.startDate) : ''}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No work items yet. Create from features or add manually.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: detail editor */}
            <div className="flex-1">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                {selected ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Edit Work Item</h3>
                        <p className="text-sm text-slate-600">Link: {selected.featureId ? (scopeFeatures.find(s=>s.id===selected.featureId)?.title || selected.featureId) : '—'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { deleteWorkItem(selected.id); setSelectedId(null); }} className="px-3 py-1 border rounded text-rose-600">Delete</button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Title</label>
                        <input value={local.title || ''} onChange={(e)=>setLocal({...local, title: e.target.value})} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Estimate (days)</label>
                        <input type="number" min={1} value={local.estimateDays || 1} onChange={(e)=>setLocal({...local, estimateDays: e.target.value})} className="w-full border rounded px-3 py-2" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm text-slate-700">Description</label>
                      <textarea value={local.description || ''} onChange={(e)=>setLocal({...local, description: e.target.value})} className="w-full border rounded px-3 py-2 h-28" />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Start Date</label>
                        <input type="date" value={local.startDate || ''} onChange={(e)=>setLocal({...local, startDate: e.target.value})} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">End Date</label>
                        <input type="date" value={local.endDate || ''} onChange={(e)=>setLocal({...local, endDate: e.target.value})} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Assignees</label>
                        <select multiple value={local.assignees || []} onChange={(e)=>{
                          const opts = Array.from(e.target.selectedOptions).map(o=>o.value);
                          setLocal({...local, assignees: opts});
                        }} className="w-full border rounded px-3 py-2 h-28">
                          {selectedTeams && selectedTeams.length > 0 ? (
                            selectedTeams.map(t=> <option key={t.id || t} value={t.id || t}>{t.name || t}</option>)
                          ) : (
                            <option value="">No teams</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
                      <button onClick={()=>{ setLocal({}); setSelectedId(null); }} className="px-4 py-2 border rounded">Close</button>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500">Select a work item to edit or create one from the scope list.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

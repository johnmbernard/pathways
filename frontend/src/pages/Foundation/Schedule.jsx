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
    updateFeature,
    toggleFeatureMVP,
    setFeatureAcceptanceCriteria,
    addFeatureDependency,
    removeFeatureDependency,
    plannedStartDate,
    targetCompletionDate,
  } = useProjectStore();

  const [step, setStep] = useState(0); // 0 = Critical Path

  // Compute feature-level schedule based on dependencies and feature estimates
  const featureSchedule = useMemo(() => {
    // duration per feature = feature.estimateDays or default 1
    const featureDurations = {};
    scopeFeatures.forEach((f) => {
      featureDurations[f.id] = Math.max(1, Number(f.estimateDays) || 1);
    });

    // Build graph: edges from predecessor -> successor (if feature A has dependency {targetId: B}, then A depends on B, so edge B -> A)
    const nodes = scopeFeatures.map((f) => f.id);
    const adj = {};
    const indeg = {};
    nodes.forEach((n) => {
      adj[n] = [];
      indeg[n] = 0;
    });
    scopeFeatures.forEach((f) => {
      (f.dependencies || []).forEach((d) => {
        const pred = d.targetId;
        const succ = f.id;
        if (adj[pred]) {
          adj[pred].push({ to: succ, type: d.type });
          indeg[succ] = (indeg[succ] || 0) + 1;
        }
      });
    });

    // Kahn's algorithm for topological order
    const q = [];
    Object.keys(indeg).forEach((k) => { if (!indeg[k]) q.push(k); });
    const topo = [];
    while (q.length > 0) {
      const n = q.shift();
      topo.push(n);
      adj[n].forEach((e) => {
        indeg[e.to] = (indeg[e.to] || 0) - 1;
        if (indeg[e.to] === 0) q.push(e.to);
      });
    }

    // detect cycle: if topo doesn't include all nodes, we fallback to insertion order
    if (topo.length !== nodes.length) {
      // fallback: use original order
      topo.length = 0;
      nodes.forEach((n) => topo.push(n));
    }

    // anchor date: use plannedStartDate if provided, otherwise today
    const anchorDate = plannedStartDate ? new Date(plannedStartDate) : new Date();

    const schedule = {};

    // easier: build reverse map: for each succ, list preds with types
    const predsMap = {};
    scopeFeatures.forEach((f) => {
      predsMap[f.id] = [];
    });
    scopeFeatures.forEach((f) => {
      (f.dependencies || []).forEach((d) => {
        predsMap[f.id].push({ id: d.targetId, type: d.type });
      });
    });

    // process topo order
    topo.forEach((fid) => {
      const dur = featureDurations[fid] || 1;
      if (!predsMap[fid] || predsMap[fid].length === 0) {
        // no preds -> start at anchor
        const s = new Date(anchorDate);
        const e = new Date(s);
        e.setDate(e.getDate() + dur - 1);
        schedule[fid] = { start: s.toISOString(), end: e.toISOString() };
      } else {
        // compute start/end based on predecessor constraints
        let candidateStart = null;
        let candidateEnd = null;
        predsMap[fid].forEach((p) => {
          const pSched = schedule[p.id];
          if (!pSched) return;
          const pStart = new Date(pSched.start);
          const pEnd = new Date(pSched.end);
          if (p.type === "FS") {
            // successor start after predecessor end + 1
            const s = new Date(pEnd);
            s.setDate(s.getDate() + 1);
            if (!candidateStart || s > candidateStart) candidateStart = s;
          } else if (p.type === "SS") {
            const s = new Date(pStart);
            if (!candidateStart || s > candidateStart) candidateStart = s;
          } else if (p.type === "FF") {
            const e = new Date(pEnd);
            if (!candidateEnd || e > candidateEnd) candidateEnd = e;
          } else if (p.type === "SF") {
            const e = new Date(pStart);
            if (!candidateEnd || e > candidateEnd) candidateEnd = e;
          }
        });

        if (candidateEnd) {
          const e = candidateEnd;
          const s = new Date(e);
          s.setDate(s.getDate() - dur + 1);
          schedule[fid] = { start: s.toISOString(), end: e.toISOString() };
        } else {
          const s = candidateStart || new Date(anchorDate);
          const e = new Date(s);
          e.setDate(e.getDate() + dur - 1);
          schedule[fid] = { start: s.toISOString(), end: e.toISOString() };
        }
      }
    });

    return schedule;
  }, [scopeFeatures, plannedStartDate]);

  // Recompute a primitive 'critical path' by longest end date chain — highlight later
  const criticalPath = useMemo(() => {
    // compute longest-path on DAG by dynamic programming (since topo order is available in featureSchedule computation above, but we will approximate by choosing features with latest end)
    const entries = Object.entries(featureSchedule);
    if (entries.length === 0) return [];
    // pick features in order of end date desc, return top N as highlight
    const sorted = entries.sort((a, b) => new Date(b[1].end) - new Date(a[1].end));
    // prefer MVPs if present
    const mvp = scopeFeatures.filter(f => f.isMVP).map(f => f.id);
    if (mvp.length > 0) return mvp;
    return sorted.slice(0, Math.min(3, sorted.length)).map(e => e[0]);
  }, [featureSchedule, scopeFeatures]);

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
            {/* Critical Path Sequencer */}
            <div className="w-1/3">
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-2">Critical Path Sequencer</h4>
                <p className="text-sm text-slate-600 mb-3">Create critical-path relationships between business features (start-finish, finish-start, etc.).</p>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {scopeFeatures.length > 0 ? (
                    scopeFeatures.map((f) => (
                      <div key={f.id} className="p-2 rounded bg-slate-50 border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800">{f.title}</div>
                            <div className="text-xs text-slate-500">{(f.dependencies || []).length} dependency{(f.dependencies || []).length !== 1 ? 'ies' : ''}</div>
                            {(f.dependencies || []).length > 0 && (
                              <div className="mt-2 text-xs space-y-1">
                                {(f.dependencies || []).map((d) => {
                                  const target = scopeFeatures.find(s => s.id === d.targetId);
                                  return (
                                    <div key={d.targetId} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1 border">
                                      <div className="text-xs text-slate-700">{d.type} → {target ? target.title : d.targetId}</div>
                                      <button onClick={() => removeFeatureDependency(f.id, d.targetId)} className="text-rose-600 text-xs px-2">Remove</button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <FeatureDependencyEditor
                              feature={f}
                              features={scopeFeatures}
                              onAdd={(targetId, type) => addFeatureDependency(f.id, targetId, type)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No scope features yet.</div>
                  )}
                </div>
              </div>
              {/* Gantt visualization for feature schedule */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
                <h5 className="text-sm font-semibold mb-2">Gantt Preview</h5>
                <GanttChart schedule={featureSchedule} features={scopeFeatures} criticalPath={criticalPath} />
              </div>
            </div>

            {/* Single-column: Critical Path + Gantt with estimate editing */}
            <div className="flex-1">
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">Features & Estimates</h4>
                    <p className="text-sm text-slate-600">Set estimated completion times per feature and define critical-path dependencies.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-500">
                      {plannedStartDate ? `Project Start: ${formatDateInput(plannedStartDate)}` : 'Project Start: (not set)'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {targetCompletionDate ? `Target Completion: ${formatDateInput(targetCompletionDate)}` : 'Target Completion: (not set)'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scopeFeatures.length > 0 ? (
                    scopeFeatures.map((f) => (
                      <div key={f.id} className="p-3 rounded bg-slate-50 border flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-slate-900 truncate">{f.title}</h5>
                            {f.isMVP && <span className="text-xs text-white bg-rose-500 px-2 py-0.5 rounded-full">MVP</span>}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{f.description}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <label className="text-xs text-slate-600">Estimate (days)</label>
                            <input type="number" min={1} value={f.estimateDays || 1} onChange={(e) => updateFeature(f.id, { estimateDays: Number(e.target.value) || 1 })} className="w-20 border rounded px-2 py-1 text-sm" />
                            <button onClick={() => { const c = prompt('Acceptance criteria:', f.acceptanceCriteria || ''); if (c !== null) setFeatureAcceptanceCriteria(f.id, c); }} className="text-sm px-2 py-1 border rounded">Edit Acceptance</button>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={!!f.isMVP} onChange={() => toggleFeatureMVP(f.id)} />
                              <span className="text-sm text-slate-700">MVP</span>
                            </label>
                          </div>
                          {(f.dependencies || []).length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                              Dependencies:
                              <ul className="list-disc pl-5">
                                {(f.dependencies || []).map(d => {
                                  const t = scopeFeatures.find(s => s.id === d.targetId);
                                  return <li key={d.targetId}>{d.type} → {t ? t.title : d.targetId}</li>;
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <FeatureDependencyEditor feature={f} features={scopeFeatures} onAdd={(targetId, type) => addFeatureDependency(f.id, targetId, type)} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No features yet — create them in the Scope wizard first.</div>
                  )}
                </div>
              </div>

              {/* Gantt visualization for feature schedule */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold">Gantt Preview</h5>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(0)} className="text-sm px-3 py-1 border rounded">Recompute</button>
                  </div>
                </div>
                <GanttChart schedule={featureSchedule} features={scopeFeatures} criticalPath={criticalPath} />

                {/* Timeline validation */}
                {Object.keys(featureSchedule).length > 0 && targetCompletionDate && (() => {
                  const ends = Object.values(featureSchedule).map(s => new Date(s.end));
                  const latest = new Date(Math.max(...ends.map(d => d.getTime())));
                  const target = new Date(targetCompletionDate);
                  if (latest > target) {
                    return (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded text-rose-700">
                        Schedule ends on {latest.toLocaleDateString()} which is after the project target completion {target.toLocaleDateString()}. Consider reducing estimates or changing dependencies.
                      </div>
                    );
                  }
                  return (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded text-green-700">Schedule fits within target completion date.</div>
                  );
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureDependencyEditor({ feature, features, onAdd }) {
  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("FS");

  return (
    <div className="flex flex-col gap-2 items-end">
      <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="text-sm border rounded px-2 py-1">
        <option value="">Link to...</option>
        {features.filter(f => f.id !== feature.id).map(f => (
          <option key={f.id} value={f.id}>{f.title}</option>
        ))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border rounded px-2 py-1">
        <option value="FS">Finish → Start (FS)</option>
        <option value="SS">Start → Start (SS)</option>
        <option value="FF">Finish → Finish (FF)</option>
        <option value="SF">Start → Finish (SF)</option>
      </select>
      <button
        onClick={() => {
          if (!targetId) return;
          onAdd(targetId, type);
          setTargetId("");
        }}
        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
      >
        Add
      </button>
    </div>
  );
}

function GanttChart({ schedule, features, criticalPath = [] }) {
  // build rows from features in order
  const rows = features.map(f => ({ id: f.id, title: f.title }));
  const dates = Object.values(schedule).flatMap(s => [s.start, s.end]).filter(Boolean).map(d => new Date(d));
  if (dates.length === 0) {
    return <div className="text-sm text-slate-500">No scheduled dates yet — set estimates and dependencies to preview.</div>;
  }

  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  // compute inclusive days
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((max - min) / msPerDay) + 1;
  const dayWidth = 18; // px per day

  return (
    <div className="overflow-auto">
      <div className="flex gap-4">
        <div className="w-48">
          {rows.map(r => (
            <div key={r.id} className="h-8 flex items-center border-b border-slate-100 text-sm text-slate-700">{r.title}</div>
          ))}
        </div>
        <div style={{ minWidth: `${days * dayWidth}px` }} className="border-l pl-4">
          {/* header */}
          <div className="flex">
            {Array.from({ length: days }).map((_, i) => {
              const d = new Date(min);
              d.setDate(d.getDate() + i);
              return (
                <div key={i} className="text-xs text-slate-400 w-" style={{ width: dayWidth }}>{d.toISOString().slice(5,10)}</div>
              );
            })}
          </div>
          {/* rows */}
          {rows.map(r => {
            const s = schedule[r.id];
            if (!s) return <div key={r.id} className="h-8 border-b border-slate-100" />;
            const start = new Date(s.start);
            const end = new Date(s.end);
            const offsetDays = Math.round((start - min) / msPerDay);
            const lenDays = Math.round((end - start) / msPerDay) + 1;
            const left = offsetDays * dayWidth;
            const width = lenDays * dayWidth;
            const isCritical = criticalPath.includes(r.id);
            return (
              <div key={r.id} className="relative h-8 border-b border-slate-100">
                <div style={{ position: 'absolute', left: left, width: width }} className={`h-6 rounded flex items-center px-2 ${isCritical ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'}`}>
                  <span className="text-xs truncate">{r.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

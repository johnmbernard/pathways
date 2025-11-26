import React, { useState } from 'react';
import { useHierarchyStore } from '../store/hierarchyStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';

export default function HierarchyBuilder({ open, onClose }) {
  const {
    tiers, flatTypes,
    addTier, updateTier, removeTier, moveTier,
    addFlatType, updateFlatType, removeFlatType,
  } = useHierarchyStore();
  const workItemsStore = useWorkItemsStore;

  const [newTierName, setNewTierName] = useState('');
  const [newFlatTypeName, setNewFlatTypeName] = useState('');
  const [baselineTiers, setBaselineTiers] = useState([]);
  const [baselineFlatTypes, setBaselineFlatTypes] = useState([]);

  React.useEffect(() => {
    if (open) {
      setBaselineTiers(tiers.map(t => ({ ...t }))); 
      setBaselineFlatTypes(flatTypes.map(t => ({ ...t })));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900" style={{ opacity: 0.4 }} onClick={onClose} />
      {/* Modal container */}
      <div className="absolute inset-0 flex items-start justify-center mt-16" onClick={onClose}>
        <div
          className="bg-white rounded shadow-lg border border-gray-300 w-[720px] p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h2 className="text-lg font-semibold">Hierarchy Builder</h2>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={onClose}><X size={18} /></button>
          </div>

          {/* Tiers */}
          <section className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Nested hierarchy tiers</h3>
            <div className="border border-gray-200 rounded">
              {tiers.map((t, idx) => (
                <div key={t.id} className="flex items-center border-b border-gray-200 last:border-b-0 p-2">
                  <span className="text-gray-500 w-6 text-center" title="Drag handle"><GripVertical size={16} /></span>
                  <span className="text-xs text-gray-500 w-10">{idx + 1}</span>
                  <input
                    value={t.name}
                    onChange={(e) => updateTier(t.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveTier(idx, Math.max(0, idx - 1))}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >Up</button>
                    <button
                      disabled={idx === tiers.length - 1}
                      onClick={() => moveTier(idx, Math.min(tiers.length - 1, idx + 1))}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >Down</button>
                    <button
                      onClick={() => removeTier(t.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-600"
                      title="Remove tier"
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                placeholder="New tier name"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={() => { if (newTierName.trim()) { addTier(newTierName.trim()); setNewTierName(''); } }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              ><Plus size={16} /> Add Tier</button>
            </div>
            <div className="mt-3">
              <button
                onClick={() => {
                  // Build mapping from baseline names to current names by index
                  const mapping = {};
                  baselineTiers.forEach((bt, idx) => {
                    const current = tiers[idx];
                    if (bt && current && bt.name !== current.name) {
                      mapping[bt.name] = current.name;
                    }
                  });
                  baselineFlatTypes.forEach((bf, idx) => {
                    const current = flatTypes[idx];
                    if (bf && current && bf.name !== current.name) {
                      mapping[bf.name] = current.name;
                    }
                  });
                  const validTypes = [...tiers.map(t => t.name), ...flatTypes.map(t => t.name)];
                  // Invoke bulk rename in work items store
                  workItemsStore.getState().bulkRenameTypes(mapping, validTypes);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Apply changes to existing items
              </button>
            </div>
          </section>

          {/* Flat types */}
          <section>
            <h3 className="text-sm font-semibold mb-2">Flat (non-nested) work item types</h3>
            <div className="border border-gray-200 rounded">
              {flatTypes.map((t) => (
                <div key={t.id} className="flex items-center border-b border-gray-200 last:border-b-0 p-2">
                  <input
                    value={t.name}
                    onChange={(e) => updateFlatType(t.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => removeFlatType(t.id)}
                    className="p-1 hover:bg-red-50 rounded text-red-600 ml-2"
                    title="Remove type"
                  ><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                placeholder="New flat type"
                value={newFlatTypeName}
                onChange={(e) => setNewFlatTypeName(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={() => { if (newFlatTypeName.trim()) { addFlatType(newFlatTypeName.trim()); setNewFlatTypeName(''); } }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              ><Plus size={16} /> Add Type</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

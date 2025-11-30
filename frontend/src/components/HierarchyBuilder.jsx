import React, { useState } from 'react';
import { useHierarchyStore } from '../store/hierarchyStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from './ui';
import styles from './HierarchyBuilder.module.css';

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
  }, [open, tiers, flatTypes]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Modal container */}
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Hierarchy Builder</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Tiers */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Nested hierarchy tiers</h3>
            <div className={styles.list}>
              {tiers.map((t, idx) => (
                <div key={t.id} className={styles.listItem}>
                  <span className={styles.dragHandle} title="Drag handle">
                    <GripVertical size={16} />
                  </span>
                  <span className={styles.index}>{idx + 1}</span>
                  <input
                    value={t.name}
                    onChange={(e) => updateTier(t.id, e.target.value)}
                    className={styles.input}
                  />
                  <div className={styles.actions}>
                    <button
                      disabled={idx === 0}
                      onClick={() => moveTier(idx, Math.max(0, idx - 1))}
                      className={styles.moveButton}
                    >Up</button>
                    <button
                      disabled={idx === tiers.length - 1}
                      onClick={() => moveTier(idx, Math.min(tiers.length - 1, idx + 1))}
                      className={styles.moveButton}
                    >Down</button>
                    <button
                      onClick={() => removeTier(t.id)}
                      className={styles.deleteButton}
                      title="Remove tier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.addForm}>
              <input
                placeholder="New tier name"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTierName.trim()) {
                    addTier(newTierName.trim());
                    setNewTierName('');
                  }
                }}
                className={styles.input}
              />
              <Button
                onClick={() => { if (newTierName.trim()) { addTier(newTierName.trim()); setNewTierName(''); } }}
                variant="primary"
                size="sm"
              >
                <Plus size={16} /> Add Tier
              </Button>
            </div>
            <div className={styles.applySection}>
              <Button
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
                variant="secondary"
                size="sm"
                className={styles.applyButton}
              >
                Apply changes to existing items
              </Button>
            </div>
          </section>

          {/* Flat types */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Flat (non-nested) work item types</h3>
            <div className={styles.list}>
              {flatTypes.map((t) => (
                <div key={t.id} className={styles.listItem}>
                  <input
                    value={t.name}
                    onChange={(e) => updateFlatType(t.id, e.target.value)}
                    className={styles.input}
                  />
                  <button
                    onClick={() => removeFlatType(t.id)}
                    className={styles.deleteButton}
                    title="Remove type"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.addForm}>
              <input
                placeholder="New flat type"
                value={newFlatTypeName}
                onChange={(e) => setNewFlatTypeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFlatTypeName.trim()) {
                    addFlatType(newFlatTypeName.trim());
                    setNewFlatTypeName('');
                  }
                }}
                className={styles.input}
              />
              <Button
                onClick={() => { if (newFlatTypeName.trim()) { addFlatType(newFlatTypeName.trim()); setNewFlatTypeName(''); } }}
                variant="primary"
                size="sm"
              >
                <Plus size={16} /> Add Type
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

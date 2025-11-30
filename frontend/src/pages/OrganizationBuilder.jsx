import React, { useState } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, ChevronDown, Trash2, Building2, Tag } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { PageHeader } from '../components/layout/Layout';
import styles from './OrganizationBuilder.module.css';

function OrgUnitRow({ unit, depth = 0 }) {
  const { updateUnit, deleteUnit, toggleExpanded, getChildren, expandedUnits, addUnit, getTierLevel } = useOrganizationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(unit.name);

  const children = getChildren(unit.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedUnits.has(unit.id);
  const tierLevel = getTierLevel(unit.id);

  const handleSave = () => {
    if (editName.trim()) {
      updateUnit(unit.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleAddChild = () => {
    addUnit({
      name: 'New Unit',
      parentId: unit.id,
    });
    if (!isExpanded) {
      toggleExpanded(unit.id);
    }
  };

  return (
    <>
      <div
        className={`${styles.row} ${isEditing ? styles.editing : ''}`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && toggleExpanded(unit.id)}
          className={`${styles.expandButton} ${!hasChildren ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Organization Icon */}
        <span className={styles.icon}>
          <Building2 size={18} />
        </span>

        {/* Tier Badge */}
        <div className={styles.tierBadge}>
          <Badge variant="primary">
            Tier {tierLevel}
          </Badge>
        </div>

        {/* Name */}
        <div className={styles.nameCell}>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setEditName(unit.name);
                  setIsEditing(false);
                }
              }}
              className={styles.nameInput}
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditing(true)}
              className={styles.nameText}
            >
              {unit.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={handleAddChild}
            className={`${styles.actionButton} ${styles.add}`}
            title="Add child unit"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => deleteUnit(unit.id)}
            className={`${styles.actionButton} ${styles.delete}`}
            title="Delete unit and all children"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && children.map(child => (
        <OrgUnitRow key={child.id} unit={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function OrganizationBuilder() {
  const navigate = useNavigate();
  const { getRootUnits, addUnit, flatUnits, addFlatUnit, updateFlatUnit, deleteFlatUnit } = useOrganizationStore();
  const rootUnits = getRootUnits();
  const [newFlatUnitName, setNewFlatUnitName] = useState('');

  const handleNewRootUnit = () => {
    addUnit({ name: 'New Organization', parentId: null });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Organization Builder"
        subtitle="Build your organization structure"
        actions={
          <Button onClick={handleNewRootUnit} variant="primary">
            <Plus size={18} />
            New Root Organization
          </Button>
        }
      />

      <div className={styles.container}>
        <div className={styles.treeContainer}>
          <div className={styles.treeHeader}>
            <div className={styles.headerExpand}></div>
            <div className={styles.headerIcon}></div>
            <div className={styles.headerTier}>Tier</div>
            <div className={styles.headerName}>Organization Unit</div>
            <div className={styles.headerActions}></div>
          </div>

          <div className={styles.treeBody}>
            {rootUnits.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <Building2 className={styles.emptyStateIcon} />
                  <p className={styles.emptyStateTitle}>No organizations yet</p>
                  <p className={styles.emptyStateText}>Click "New Root Organization" to get started</p>
                </div>
              </div>
            ) : (
              rootUnits.map(unit => (
                <OrgUnitRow key={unit.id} unit={unit} depth={0} />
              ))
            )}
          </div>
        </div>

        <div className={styles.infoBox}>
          <h4 className={styles.infoTitle}>
            💡 How to use
          </h4>
          <ul className={styles.infoList}>
            <li>• Create your top-level organization (e.g., "Synapse Solutions LLC") - this is <strong>Tier 1</strong></li>
            <li>• Hover over any unit and click <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> to add child units underneath</li>
            <li>• Each nesting level increases the tier: Tier 1 → Tier 2 → Tier 3, etc.</li>
            <li>• Double-click any name to edit it inline</li>
            <li>• Click the arrow to expand/collapse child units</li>
            <li>• Delete units (and all their children) with the trash icon</li>
            <li>• Example: Tier 1: Company → Tier 2: Departments → Tier 3: Teams → Tier 4: Squads</li>
          </ul>
        </div>

        <div className={styles.flatSection}>
          <h3 className={styles.flatTitle}>Flat (Non-Tiered) Organization Units</h3>
          <p className={styles.flatDescription}>
            These are organization units that don't fit into the hierarchical structure (e.g., Contractors, Consultants, Vendors).
          </p>

          <div className={styles.flatList}>
            {flatUnits.length === 0 ? (
              <div className={styles.flatEmpty}>
                No flat units yet. Add one below.
              </div>
            ) : (
              flatUnits.map((unit) => (
                <div key={unit.id} className={styles.flatRow}>
                  <Tag size={18} className={styles.flatIcon} />
                  <input
                    value={unit.name}
                    onChange={(e) => updateFlatUnit(unit.id, e.target.value)}
                    className={styles.flatInput}
                  />
                  <button
                    onClick={() => deleteFlatUnit(unit.id)}
                    className={styles.flatDeleteButton}
                    title="Remove flat unit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={styles.addForm}>
            <input
              placeholder="New flat unit (e.g., Contractors, Vendors)"
              value={newFlatUnitName}
              onChange={(e) => setNewFlatUnitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFlatUnitName.trim()) {
                  addFlatUnit(newFlatUnitName.trim());
                  setNewFlatUnitName('');
                }
              }}
              className={styles.addInput}
            />
            <Button
              onClick={() => {
                if (newFlatUnitName.trim()) {
                  addFlatUnit(newFlatUnitName.trim());
                  setNewFlatUnitName('');
                }
              }}
              variant="primary"
            >
              <Plus size={18} />
              Add Flat Unit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, ChevronDown, Trash2, Building2, Tag } from 'lucide-react';
import { Button, Badge, HelpTooltip } from '../components/ui';
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

  const handleSave = async () => {
    if (editName.trim()) {
      try {
        await updateUnit(unit.id, { name: editName.trim() });
      } catch (error) {
        console.error('Failed to update unit:', error);
      }
    }
    setIsEditing(false);
  };

  const handleAddChild = async () => {
    try {
      await addUnit({
        id: `org-${Date.now()}`,
        name: 'New Unit',
        parentId: unit.id,
        tier: tierLevel + 1,
      });
      if (!isExpanded) {
        toggleExpanded(unit.id);
      }
    } catch (error) {
      console.error('Failed to add child unit:', error);
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
            onClick={async () => {
              if (window.confirm(`Delete "${unit.name}"? This will also delete all child units.`)) {
                try {
                  await deleteUnit(unit.id);
                } catch (error) {
                  alert(error.message || 'Failed to delete unit');
                }
              }
            }}
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
  const { getRootUnits, addUnit, fetchUnits, loading } = useOrganizationStore();
  const rootUnits = getRootUnits();

  // Fetch organizational units on mount
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleNewRootUnit = async () => {
    try {
      await addUnit({ 
        id: `org-${Date.now()}`,
        name: 'New Organization', 
        parentId: null, 
        tier: 1 
      });
    } catch (error) {
      console.error('Failed to create root unit:', error);
      alert('Failed to create organization');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader title="Organization Builder" subtitle="Loading..." />
        <div className={styles.container}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading organizational units...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Organization Builder
            <HelpTooltip
              title="Organization Structure"
              content={
                <div>
                  <p><strong>Build your organizational hierarchy</strong> to enable tiered planning and refinement.</p>
                  <p><strong>Key Concepts:</strong></p>
                  <ul>
                    <li><strong>Tiers:</strong> Hierarchical levels (Tier 1 = highest, e.g., Company)</li>
                    <li><strong>Parent-Child Relationships:</strong> Higher tiers supervise lower tiers</li>
                    <li><strong>Refinement Flow:</strong> Objectives cascade down and get refined at each tier</li>
                    <li><strong>Leaf Units:</strong> Bottom-tier teams that create actual work items</li>
                  </ul>
                  <p>Click the <strong>+</strong> button on any unit to add a child unit beneath it.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
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
      </div>
    </div>
  );
}

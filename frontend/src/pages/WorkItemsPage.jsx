import React, { useMemo, useState } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useProjectsStore } from '../store/projectsStore';
import { ChevronRight, ChevronDown, Plus, Trash2, Pencil, Building, X, Check, FolderKanban } from 'lucide-react';
import DateInputs from '../components/DateInputs';
import HierarchyBuilder from '../components/HierarchyBuilder';
import { useHierarchyStore } from '../store/hierarchyStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '../components/ui';
import { PageHeader } from '../components/layout/Layout';
import styles from './WorkItemsPage.module.css';
import layoutStyles from '../components/layout/Layout.module.css';
import modalStyles from './EditWorkItemModal.module.css';

// Types derived from hierarchy tiers + flat types

function WorkItemRow({ item, depth = 0, onEdit }) {
  const { updateItem, deleteItem, toggleExpanded, getChildren, expandedItems, addItem } = useWorkItemsStore();
  const { getProject } = useProjectsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units, getTierLevel } = useOrganizationStore();
  const project = item.projectId ? getProject(item.projectId) : null;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  // Actions are now always visible; remove hover state

  // Use tree units for dropdown with tier info
  const allOrgUnits = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name, isFlat: false, tierLevel: getTierLevel(u.id) })),
  ], [units, getTierLevel]);

  // Color palette for org tiers
  const getTierColor = (tierLevel) => {
    const colors = [
      '#3b82f6', // blue-500 (Tier 1)
      '#8b5cf6', // violet-500 (Tier 2)
      '#ec4899', // pink-500 (Tier 3)
      '#f59e0b', // amber-500 (Tier 4)
      '#10b981', // emerald-500 (Tier 5+)
    ];
    if (tierLevel === null) return '#6b7280'; // gray-500 for flat units
    return colors[Math.min(tierLevel - 1, colors.length - 1)];
  };

  const children = getChildren(item.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedItems.has(item.id);

  // Determine icon based on hierarchy tier or flat type name
  const tierIndex = tiers.findIndex(t => t.name === item.type);
  let icon = '🏷️';
  if (tierIndex === 0) icon = '📦';
  else if (tierIndex === 1) icon = '🔥';
  else if (tierIndex >= 2) icon = '📋';
  else if (flatTypes.some(t => t.name.toLowerCase() === String(item.type).toLowerCase())) {
    icon = /bug/i.test(item.type) ? '🐛' : '🏷️';
  }

  const handleSave = () => {
    if (editTitle.trim()) {
      updateItem(item.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleAddChild = () => {
    // Default child type to next tier after parent's type
    const parentTierIndex = tiers.findIndex(t => t.name === item.type);
    const nextTierType = parentTierIndex >= 0 && tiers[parentTierIndex + 1]
      ? tiers[parentTierIndex + 1].name
      : (tiers[parentTierIndex] ? tiers[parentTierIndex].name : (tiers[0]?.name || 'Feature'));

    addItem({
      title: 'New Work Item',
      state: 'New',
      type: nextTierType,
      parentId: item.id,
      assignedOrgUnit: item.assignedOrgUnit ?? null,
    });
    if (!isExpanded) {
      toggleExpanded(item.id);
    }
  };

  return (
    <>
      <div
        className={`${styles.row} ${isEditing ? styles.editing : ''}`}
        style={{ paddingLeft: `${depth * 20 + 24}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && toggleExpanded(item.id)}
          className={`${styles.expandButton} ${!hasChildren ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>

        {/* Work Item Type Icon */}
        <span className={styles.icon}>{icon}</span>

        {/* ID */}
        <div className={styles.idBadge}>
          <span className={styles.idBadgeInner}>#{item.id}</span>
        </div>

        {/* Title */}
        <div className={styles.titleCell}>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setEditTitle(item.title);
                  setIsEditing(false);
                }
              }}
              className={styles.titleInput}
              autoFocus
            />
          ) : (
            <div className={styles.titleContent}>
              <span 
                onDoubleClick={() => setIsEditing(true)}
                className={styles.titleText}
                title={item.title}
              >
                {item.title}
              </span>
              {project && (
                <span className={styles.projectBadge} title={`Project: ${project.title}`}>
                  <FolderKanban size={12} />
                  {project.title}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Type Dropdown (derived from hierarchy + flat types) */}
        <div className={styles.typeCell}>
          <select
            value={item.type}
            onChange={(e) => {
              const newType = e.target.value;
              // If promoted to top tier, remove indentation by clearing parentId
              const topTier = tiers[0]?.name;
              if (topTier && newType === topTier) {
                updateItem(item.id, { type: newType, parentId: null });
              } else {
                updateItem(item.id, { type: newType });
              }
            }}
            className={styles.typeSelect}
          >
            {tiers.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
            {flatTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Start/Target Dates */}
        <div className={styles.scheduleCell}>
          <DateInputs
            startDate={item.startDate}
            targetDate={item.targetDate}
            onChange={(updates) => {
              // updates contains either startDate or targetDate
              const payload = {};
              if (updates.startDate !== undefined) payload.startDate = updates.startDate;
              if (updates.targetDate !== undefined) payload.targetDate = updates.targetDate;
              // Normalize: empty string represents no date
              const normalized = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v || '']));
              updateItem(item.id, normalized);
            }}
          />
        </div>

        {/* Assigned Organization Unit Dropdown */}
        <div className={styles.teamCell}>
          <Building size={14} className={styles.teamIcon} />
          <select
            value={item.assignedOrgUnit || ''}
            onChange={(e) => updateItem(item.id, { assignedOrgUnit: e.target.value || null })}
            className={styles.teamSelect}
          >
            <option value="">No Team</option>
            {allOrgUnits.map(org => (
              <option 
                key={org.id} 
                value={org.id}
                style={{ 
                  color: getTierColor(org.tierLevel),
                  fontWeight: org.isFlat ? 'normal' : '500'
                }}
              >
                {org.isFlat ? '🏷️ ' : `Tier ${org.tierLevel} • `}{org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className={styles.actionsCell}>
          <button
            onClick={handleAddChild}
            className={`${styles.actionButton} ${styles.add}`}
            title="Add child work item"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className={`${styles.actionButton} ${styles.edit}`}
            title="Edit work item details"
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => deleteItem(item.id)}
            className={`${styles.actionButton} ${styles.delete}`}
            title="Delete work item"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && children.map(child => (
        <WorkItemRow key={child.id} item={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </>
  );
}

export default function WorkItemsPage() {
  const { getRootItems, addItem, updateItem } = useWorkItemsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units } = useOrganizationStore();
  const navigate = useNavigate();
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const rootItems = getRootItems();

  const allTypes = useMemo(() => [...tiers.map(t => t.name), ...flatTypes.map(t => t.name)], [tiers, flatTypes]);
  
  // Get root organization name (first unit with no parent)
  const rootOrg = units.find(u => u.parentId === null);
  const orgName = rootOrg?.name || 'your organization';
  
  const handleNewWorkItem = () => {
    const defaultType = tiers[1]?.name || tiers[0]?.name || allTypes[0] || 'Feature';
    // Always create as top-level (root) item
    addItem({ title: 'New Work Item', state: 'New', type: defaultType, parentId: null });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Backlog"
        subtitle={`Manage ${orgName}'s backlog`}
        actions={
          <>
            <Button onClick={handleNewWorkItem} variant="primary">
              <Plus size={18} />
              New Work Item
            </Button>
            <Button onClick={() => setIsHierarchyOpen(true)} variant="secondary">
              Hierarchy Builder
            </Button>
          </>
        }
      />

      <div className={styles.container}>
        <div className={styles.tableWrapper}>
          {/* Work Items Table Header */}
          <div className={styles.tableHeader}>
            <div className={styles.headerExpand}></div>
            <div className={styles.headerIcon}></div>
            <div className={styles.headerId}>ID</div>
            <div className={styles.headerTitle}>Title</div>
            <div className={styles.headerType}>Type</div>
            <div className={styles.headerSchedule}>Schedule</div>
            <div className={styles.headerTeam}>Assigned Team</div>
            <div className={styles.headerActions}>Actions</div>
          </div>

          {/* Work Items List */}
          <div className={styles.tableBody}>
            {rootItems.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <div>
                    <svg className={styles.emptyStateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={styles.emptyStateTitle}>No work items yet</p>
                  <p className={styles.emptyStateText}>Click "New Work Item" to get started</p>
                </div>
              </div>
            ) : (
              rootItems.map(item => (
                <WorkItemRow key={item.id} item={item} depth={0} onEdit={setEditingItem} />
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className={styles.tableFooter}>
            <div className={styles.footerStats}>
              <Badge variant="primary">{rootItems.length} total</Badge>
              <span className={styles.footerDivider}>•</span>
              <span className={styles.footerText}>Last updated just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Builder Modal */}
      <HierarchyBuilder open={isHierarchyOpen} onClose={() => setIsHierarchyOpen(false)} />

      {/* Edit Work Item Modal */}
      {editingItem && (
        <EditWorkItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => {
            updateItem(editingItem.id, updates);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Work Item Modal Component
function EditWorkItemModal({ item, onClose, onSave }) {
  const [description, setDescription] = useState(item.description || '');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    item.acceptanceCriteria || []
  );
  const [newCriterion, setNewCriterion] = useState('');

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, { text: newCriterion.trim(), completed: false }]);
      setNewCriterion('');
    }
  };

  const handleToggleCriterion = (index) => {
    setAcceptanceCriteria(
      acceptanceCriteria.map((criterion, i) =>
        i === index ? { ...criterion, completed: !criterion.completed } : criterion
      )
    );
  };

  const handleRemoveCriterion = (index) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ description, acceptanceCriteria });
  };

  return (
    <div className={layoutStyles.modalOverlay}>
      <div className={layoutStyles.modal}>
        {/* Header */}
        <div className={layoutStyles.modalHeader}>
          <div>
            <h2 className={layoutStyles.modalTitle}>Edit Work Item</h2>
            <p className={layoutStyles.modalSubtitle}>{item.title}</p>
          </div>
          <button
            onClick={onClose}
            className={layoutStyles.modalClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={layoutStyles.modalBody}>
          {/* Description */}
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description of this work item..."
              className={modalStyles.textarea}
            />
          </div>

          {/* Acceptance Criteria */}
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>
              Acceptance Criteria
            </label>

            {/* Criteria List */}
            <div className={modalStyles.criteriaList}>
              {acceptanceCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className={`${modalStyles.criterionItem} ${criterion.completed ? modalStyles.completed : modalStyles.incomplete}`}
                >
                  <button
                    onClick={() => handleToggleCriterion(index)}
                    className={`${modalStyles.checkbox} ${criterion.completed ? modalStyles.checked : modalStyles.unchecked}`}
                  >
                    {criterion.completed && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                  <span
                    className={`${modalStyles.criterionText} ${criterion.completed ? modalStyles.completed : modalStyles.incomplete}`}
                  >
                    {criterion.text}
                  </span>
                  <button
                    onClick={() => handleRemoveCriterion(index)}
                    className={modalStyles.removeButton}
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Criterion */}
            <div className={modalStyles.addCriterionRow}>
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCriterion();
                  }
                }}
                placeholder="Add acceptance criterion..."
                className={modalStyles.criterionInput}
              />
              <Button
                onClick={handleAddCriterion}
                variant="secondary"
                disabled={!newCriterion.trim()}
              >
                <Plus size={16} />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={layoutStyles.modalFooter}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            <Check size={16} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

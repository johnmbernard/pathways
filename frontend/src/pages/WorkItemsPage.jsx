import React, { useMemo, useState } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useProjectsStore } from '../store/projectsStore';
import { ChevronRight, ChevronDown, Plus, Trash2, Pencil, Building, X, Check, FolderKanban } from 'lucide-react';
import DateInputs from '../components/DateInputs';
import HierarchyBuilder from '../components/HierarchyBuilder';
import { useHierarchyStore } from '../store/hierarchyStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/layout/Layout';
import styles from './WorkItemsPage.module.css';
import layoutStyles from '../components/layout/Layout.module.css';
import modalStyles from './EditWorkItemModal.module.css';

// Types derived from hierarchy tiers + flat types

function WorkItemRow({ item, depth = 0, onEdit, highlightId }) {
  const { updateItem, deleteItem, toggleExpanded, getChildren, expandedItems, addItem } = useWorkItemsStore();
  const { getProject } = useProjectsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units, getTierLevel } = useOrganizationStore();
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const project = item.projectId ? getProject(item.projectId) : null;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const isHighlighted = item.id === highlightId;
  
  // Handle different item types (project, objective, workItem)
  const itemType = item.itemType || 'workItem';
  
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

  // Children are either from store (for work items) or from item.children (for projects/objectives)
  const children = itemType === 'workItem' ? getChildren(item.id) : (item.children || []);
  const hasChildren = children.length > 0;
  const isExpanded = itemType === 'workItem' ? expandedItems.has(item.id) : localExpanded;
  
  // Debug logging
  if (itemType !== 'workItem' && depth === 0) {
    console.log('Row:', item.title, 'itemType:', itemType, 'hasChildren:', hasChildren, 'children:', children.length);
  }

  // Determine icon based on item type
  let icon = '🏷️';
  if (itemType === 'project') {
    icon = '📂';
  } else if (itemType === 'objective') {
    icon = '🎯';
  } else {
    // Work item - use tier-based icons
    const tierIndex = tiers.findIndex(t => t.name === item.type);
    if (tierIndex === 0) icon = '📦';
    else if (tierIndex === 1) icon = '🔥';
    else if (tierIndex >= 2) icon = '📋';
    else if (flatTypes.some(t => t.name.toLowerCase() === String(item.type).toLowerCase())) {
      icon = /bug/i.test(item.type) ? '🐛' : '🏷️';
    }
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
        id={`work-item-${item.id}`}
        className={`${styles.row} ${isEditing ? styles.editing : ''} ${isHighlighted ? styles.highlighted : ''}`}
        style={{ paddingLeft: `${depth * 20 + 24}px` }}
        data-item-type={itemType}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => {
            if (hasChildren) {
              if (itemType === 'workItem') {
                toggleExpanded(item.id);
              } else {
                setLocalExpanded(!localExpanded);
              }
            }
          }}
          className={`${styles.expandButton} ${!hasChildren ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>

        {/* Work Item Type Icon */}
        <span className={styles.icon}>{icon}</span>

        {/* ID */}
        <div className={styles.idBadge}>
          <span className={styles.idBadgeInner}>
            {itemType === 'workItem' ? `#${item.id}` : '—'}
          </span>
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
          {(itemType === 'project' || itemType === 'objective') ? (
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {item.targetDate && (
                <div>Target: {new Date(item.targetDate).toLocaleDateString()}</div>
              )}
            </div>
          ) : (
            <DateInputs
              startDate={item.startDate}
              targetDate={item.targetDate}
              onChange={(updates) => {
                const payload = {};
                if (updates.startDate !== undefined) payload.startDate = updates.startDate;
                if (updates.targetDate !== undefined) payload.targetDate = updates.targetDate;
                const normalized = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v || '']));
                updateItem(item.id, normalized);
              }}
            />
          )}
        </div>

        {/* Assigned Organization Unit Dropdown */}
        <div className={styles.teamCell}>
          {(itemType === 'project' || itemType === 'objective') ? (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsCell}>
          {itemType === 'workItem' ? (
            <>
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
            </>
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
          )}
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && children.map(child => (
        <WorkItemRow key={child.id} item={child} depth={depth + 1} onEdit={onEdit} highlightId={highlightId} />
      ))}
    </>
  );
}

export default function WorkItemsPage() {
  const { addItem, updateItem, items, expandedItems, toggleExpanded, fetchWorkItems } = useWorkItemsStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units } = useOrganizationStore();
  const navigate = useNavigate();
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [objectives, setObjectives] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Fetch projects and work items on mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchWorkItems(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchProjects, fetchWorkItems]);
  
  // Fetch objectives when projects change
  React.useEffect(() => {
    const loadObjectives = async () => {
      if (projects.length === 0) {
        setObjectives([]);
        return;
      }
      
      const allObjectives = [];
      for (const project of projects) {
        try {
          const response = await fetch(`${API_BASE_URL}/projects/${project.id}`);
          if (response.ok) {
            const projectData = await response.json();
            if (projectData.objectives) {
              projectData.objectives.forEach(obj => {
                allObjectives.push({ ...obj, projectId: project.id });
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch objectives for project ${project.id}:`, error);
        }
      }
      setObjectives(allObjectives);
    };
    loadObjectives();
  }, [projects]);
  
  // Build unified hierarchy: Projects > Objectives > Work Items
  const hierarchyItems = React.useMemo(() => {
    console.log('Building hierarchy:', { projectsCount: projects.length, objectivesCount: objectives.length, itemsCount: items.length });
    const result = [];
    
    // Add all projects as root items with objectives and work items nested
    projects.forEach(project => {
      console.log('Processing project:', project.title, 'objectives:', objectives.filter(obj => obj.projectId === project.id).length);
      const projectItem = {
        id: project.id,
        title: project.title,
        type: 'Project',
        itemType: 'project',
        targetDate: project.targetDate,
        description: project.description,
        status: project.status,
        children: []
      };
      
      // Get objectives for this project
      const projectObjectives = objectives.filter(obj => obj.projectId === project.id);
      console.log('Project:', project.title, 'projectObjectives:', projectObjectives.length, 'sample parentId:', projectObjectives[0]?.parentId, 'all parentIds:', projectObjectives.map(o => ({id: o.id, parentId: o.parentId})));
      
      // Build objective tree (handle multi-tier objectives)
      const buildObjectiveTree = (parentId = null) => {
        const filtered = projectObjectives.filter(obj => {
          // Handle both null and undefined as root objectives
          if (parentId === null) {
            return obj.parentId === null || obj.parentId === undefined;
          }
          return obj.parentId === parentId;
        });
        console.log('buildObjectiveTree parentId:', parentId, 'filtered:', filtered.length, 'filtered ids:', filtered.map(f => f.id));
        return filtered.map(objective => {
            const objectiveItem = {
              id: objective.id,
              title: objective.title,
              type: `Objective (Tier ${objective.tier})`,
              itemType: 'objective',
              targetDate: objective.targetDate,
              description: objective.description,
              tier: objective.tier,
              objectiveId: objective.id,
              projectId: project.id,
              children: []
            };
            
            // Add child objectives
            objectiveItem.children = buildObjectiveTree(objective.id);
            
            // Add work items for this objective
            const objectiveWorkItems = items.filter(item => 
              item.objectiveId === objective.id
            );
            
            console.log('Objective:', objective.title, 'work items:', objectiveWorkItems.length, 
                       'total items:', items.length, 
                       'sample objectiveId:', items[0]?.objectiveId);
            
            objectiveWorkItems.forEach(workItem => {
              objectiveItem.children.push({
                ...workItem,
                itemType: 'workItem'
              });
            });
            
            return objectiveItem;
          });
      };
      
      projectItem.children = buildObjectiveTree();
      console.log('Project:', project.title, 'final children count:', projectItem.children.length);
      result.push(projectItem);
    });
    
    return result;
  }, [projects, objectives, items]);
  
  // Handle highlight parameter from URL
  const [highlightId, setHighlightId] = React.useState(null);
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      setHighlightId(highlight);
      
      // Expand all parent items to make the highlighted item visible
      const expandParents = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item?.parentId) {
          if (!expandedItems.has(item.parentId)) {
            toggleExpanded(item.parentId);
          }
          expandParents(item.parentId);
        }
      };
      
      expandParents(highlight);
      
      // Scroll to the item after a short delay
      setTimeout(() => {
        const element = document.getElementById(`work-item-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightId(null);
        // Clear URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      }, 5000);
    }
  }, [items, expandedItems, toggleExpanded]);

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
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Backlog
            <HelpTooltip
              title="Work Items & Backlog"
              content={
                <div>
                  <p><strong>Your backlog</strong> contains all work items created through refinement sessions.</p>
                  <p><strong>Features:</strong></p>
                  <ul>
                    <li><strong>Hierarchical View:</strong> Work items can be nested (epics, stories, tasks)</li>
                    <li><strong>Project Association:</strong> All items link back to projects and objectives</li>
                    <li><strong>Acceptance Criteria:</strong> Define and track completion criteria</li>
                    <li><strong>Estimates:</strong> T-shirt sizing (S/M/L) for planning</li>
                  </ul>
                  <p>Use <strong>Hierarchy Builder</strong> to customize work item types and relationships.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
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
            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <p className={styles.emptyStateTitle}>Loading...</p>
                </div>
              </div>
            ) : hierarchyItems.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <div>
                    <svg className={styles.emptyStateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={styles.emptyStateTitle}>No projects yet</p>
                  <p className={styles.emptyStateText}>Create a project to get started</p>
                </div>
              </div>
            ) : (
              hierarchyItems.map(item => (
                <WorkItemRow key={item.id} item={item} depth={0} onEdit={setEditingItem} highlightId={highlightId} />
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className={styles.tableFooter}>
            <div className={styles.footerStats}>
              <Badge variant="primary">{hierarchyItems.length} projects</Badge>
              <span className={styles.footerDivider}>•</span>
              <Badge variant="secondary">{items.length} work items</Badge>
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

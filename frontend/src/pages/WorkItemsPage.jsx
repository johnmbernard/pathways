import React, { useMemo, useState } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useProjectsStore } from '../store/projectsStore';
import { ChevronRight, ChevronDown, Building, X, Check, FolderKanban } from 'lucide-react';
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

function WorkItemRow({ item, depth = 0, highlightId }) {
  const { toggleExpanded, getChildren, expandedItems } = useWorkItemsStore();
  const { getProject } = useProjectsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units, getTierLevel } = useOrganizationStore();
  const project = item.projectId ? getProject(item.projectId) : null;
  const isHighlighted = item.id === highlightId;
  
  // Use tree units for dropdown with tier info
  const allOrgUnits = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name, isFlat: false, tierLevel: getTierLevel(u.id) })),
  ], [units, getTierLevel]);

  // Get children work items
  const children = getChildren(item.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedItems.has(item.id);

  // Determine icon based on item type
  let icon = '🏷️';
  const tierIndex = tiers.findIndex(t => t.name === item.type);
  if (tierIndex === 0) icon = '📦';
  else if (tierIndex === 1) icon = '🔥';
  else if (tierIndex >= 2) icon = '📋';
  else if (flatTypes.some(t => t.name.toLowerCase() === String(item.type).toLowerCase())) {
    icon = /bug/i.test(item.type) ? '🐛' : '🏷️';
  }

  return (
    <>
      <div
        id={`work-item-${item.id}`}
        className={`${styles.row} ${isHighlighted ? styles.highlighted : ''}`}
        style={{ paddingLeft: `${depth * 20 + 24}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
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
            #{item.id}
          </span>
        </div>

        {/* Title */}
        <div className={styles.titleCell}>
          <div className={styles.titleContent}>
            <span 
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
        </div>

        {/* Type (read-only) */}
        <div className={styles.typeCell}>
          <span className={styles.typeBadge}>{item.type || 'N/A'}</span>
        </div>

        {/* Start/Target Dates (read-only) */}
        <div className={styles.scheduleCell}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {item.targetDate ? (
              <div>Target: {new Date(item.targetDate).toLocaleDateString()}</div>
            ) : (
              <div style={{ color: '#94a3b8' }}>-</div>
            )}
          </div>
        </div>

        {/* Assigned Organization Unit (read-only) */}
        <div className={styles.teamCell}>
          {item.assignedOrgUnit ? (
            <>
              <Building size={14} className={styles.teamIcon} />
              <span style={{ fontSize: '13px', color: '#475569' }}>
                {allOrgUnits.find(org => org.id === item.assignedOrgUnit)?.name || 'Unknown'}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
          )}
        </div>

        {/* Actions (read-only - no actions available) */}
        <div className={styles.actionsCell}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && children.map(child => (
        <WorkItemRow key={child.id} item={child} depth={depth + 1} highlightId={highlightId} />
      ))}
    </>
  );
}

export default function WorkItemsPage() {
  const { items, expandedItems, toggleExpanded, fetchWorkItems } = useWorkItemsStore();
  const { projects, fetchProjects, getProject } = useProjectsStore();
  const { tiers, flatTypes } = useHierarchyStore();
  const { units } = useOrganizationStore();
  const navigate = useNavigate();
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
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
  
  // Get root level work items (those without a parent)
  const rootWorkItems = React.useMemo(() => {
    return items.filter(item => !item.parentId);
  }, [items]);
  
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
                  <p><strong>Read-only view</strong> of all work items created through refinement sessions.</p>
                  <p><strong>About this view:</strong></p>
                  <ul>
                    <li><strong>Refinement-Created:</strong> All work items originate from refinement sessions</li>
                    <li><strong>Hierarchical View:</strong> Work items can be nested (epics, stories, tasks)</li>
                    <li><strong>Project Association:</strong> All items link back to projects and objectives</li>
                    <li><strong>Data Integrity:</strong> To modify items, return to their refinement session</li>
                  </ul>
                  <p>Use <strong>Hierarchy Builder</strong> to view work item type relationships.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
        subtitle={`View ${orgName}'s work items from refinement sessions`}
        actions={
          <Button onClick={() => setIsHierarchyOpen(true)} variant="secondary">
            View Hierarchy
          </Button>
        }
      />

      {/* Informational Banner */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '0 24px 16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div style={{ fontSize: '14px', color: '#1e40af' }}>
          <strong>Read-Only View:</strong> Work items are created through refinement sessions. 
          To modify a work item, return to the refinement session that created it.
        </div>
      </div>

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
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <div>
                    <svg className={styles.emptyStateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={styles.emptyStateTitle}>No work items yet</p>
                  <p className={styles.emptyStateText}>Work items will appear here once created through refinement sessions</p>
                </div>
              </div>
            ) : (
              rootWorkItems.map(item => (
                <WorkItemRow key={item.id} item={item} depth={0} highlightId={highlightId} />
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className={styles.tableFooter}>
            <div className={styles.footerStats}>
              <Badge variant="secondary">{items.length} work items</Badge>
              <span className={styles.footerDivider}>•</span>
              <span className={styles.footerText}>Last updated just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Builder Modal */}
      <HierarchyBuilder open={isHierarchyOpen} onClose={() => setIsHierarchyOpen(false)} />
    </div>
  );
}

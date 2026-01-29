import React, { useState } from 'react';
import { useProjectsStore } from '../store/projectsStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { Calendar, Users, FolderOpen, ChevronRight, ChevronDown, Target, CheckSquare } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { API_BASE_URL } from '../config';
import styles from './BacklogPage.module.css';

// Recursive Objective Row - dynamically handles any tier depth
function ObjectiveRow({ objective, allObjectives, workItems, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get child objectives
  const childObjectives = allObjectives.filter(obj => 
    obj.parentObjectiveId === objective.id
  );
  
  // Get work items for this objective (only shown if no child objectives - i.e., leaf objective)
  const objectiveWorkItems = workItems.filter(wi => 
    wi.objectiveId === objective.id
  );
  
  const hasChildren = childObjectives.length > 0;
  const hasWorkItems = objectiveWorkItems.length > 0;
  const hasContent = hasChildren || hasWorkItems;
  
  // Indentation based on depth
  const indentPixels = 24 + (depth * 24);
  
  // Badge variant based on tier (cycle through variants for visual distinction)
  const badgeVariants = ['primary', 'info', 'warning', 'secondary'];
  const badgeVariant = badgeVariants[objective.fromTier % badgeVariants.length];

  return (
    <>
      <div className={styles.objectiveRow} style={{ paddingLeft: `${indentPixels}px` }}>
        <button
          onClick={() => hasContent && setIsExpanded(!isExpanded)}
          className={`${styles.expandButton} ${!hasContent ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <div className={styles.objectiveIcon}>
          <Target size={16} />
        </div>
        
        <div className={styles.objectiveTierColumn}>
          <Badge variant={badgeVariant}>Tier {objective.fromTier}</Badge>
        </div>
        
        <div className={styles.objectiveTitle}>
          <strong>{objective.title}</strong>
        </div>
        
        <div className={styles.objectiveDescription}>
          {objective.description || 'No description'}
        </div>
        
        <div className={styles.objectiveDate}>
          {objective.targetDate ? (
            <>
              <Calendar size={12} />
              <span>{new Date(objective.targetDate).toLocaleDateString()}</span>
            </>
          ) : (
            <span style={{ color: '#9ca3af' }}>No date</span>
          )}
        </div>

        <div className={styles.objectiveMeta}>
          {hasChildren && <span>{childObjectives.length} refined objective{childObjectives.length !== 1 ? 's' : ''}</span>}
          {hasWorkItems && <span>{objectiveWorkItems.length} work item{objectiveWorkItems.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Render child objectives recursively */}
          {childObjectives.map(childObj => (
            <ObjectiveRow 
              key={childObj.id}
              objective={childObj}
              allObjectives={allObjectives}
              workItems={workItems}
              depth={depth + 1}
            />
          ))}
          
          {/* Render work items if this is a leaf objective (no children) */}
          {!hasChildren && objectiveWorkItems.map(workItem => (
            <div key={workItem.id} className={styles.workItemRow} style={{ paddingLeft: `${indentPixels + 48}px` }}>
              <CheckSquare size={14} />
              <span className={styles.workItemTitle}>{workItem.title}</span>
              <Badge variant="secondary">{workItem.status}</Badge>
              <Badge variant={workItem.priority === 'P1' ? 'danger' : workItem.priority === 'P2' ? 'warning' : 'secondary'}>
                {workItem.priority}
              </Badge>
              {workItem.estimatedEffort && (
                <span className={styles.workItemEffort}>{workItem.estimatedEffort} pts</span>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}

function ProjectRow({ project, workItemCount, owningUnit, objectives, workItems }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  // Get only top-level objectives (no parent)
  const rootObjectives = objectives.filter(obj => !obj.parentObjectiveId);
  const hasObjectives = rootObjectives.length > 0;
  
  // Count all objectives and work items recursively
  const totalObjectives = objectives.length;
  const totalWorkItems = workItems.filter(wi => 
    objectives.some(obj => obj.id === wi.objectiveId)
  ).length;

  return (
    <>
      <div className={styles.projectRow}>
        <button
          onClick={() => hasObjectives && setIsExpanded(!isExpanded)}
          className={`${styles.expandButton} ${!hasObjectives ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <div className={styles.projectIcon}>
          <FolderOpen size={20} />
        </div>
        
        <div className={styles.projectTitle}>
          {project.title}
        </div>
        
        <div className={styles.projectDescription}>
          {project.description || 'No description'}
        </div>
        
        <div className={styles.projectOwner}>
          <Users size={12} />
          <span>{owningUnit?.name || 'No owner'}</span>
        </div>
        
        <div className={styles.projectMeta}>
          <span>{rootObjectives.length} root objective{rootObjectives.length !== 1 ? 's' : ''}</span>
          {totalObjectives > rootObjectives.length && <> • <span>{totalObjectives - rootObjectives.length} refined</span></>}
          {totalWorkItems > 0 && <> • <span>{totalWorkItems} work items</span></>}
        </div>
        
        <button
          onClick={() => navigate(`/app/projects`)}
          className={styles.viewButton}
        >
          Manage
        </button>
      </div>
      
      {isExpanded && rootObjectives.map(rootObj => (
        <ObjectiveRow
          key={rootObj.id}
          objective={rootObj}
          allObjectives={objectives}
          workItems={workItems}
          depth={0}
        />
      ))}
    </>
  );
}

export default function BacklogPage() {
  const { projects, fetchProjects } = useProjectsStore();
  const { items, fetchWorkItems } = useWorkItemsStore();
  const { units } = useOrganizationStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectObjectives, setProjectObjectives] = useState({});
  
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
  
  // Fetch objectives for all projects
  React.useEffect(() => {
    const loadObjectives = async () => {
      if (projects.length === 0) return;
      
      const objectivesMap = {};
      for (const project of projects) {
        try {
          const response = await fetch(`${API_BASE_URL}/projects/${project.id}`);
          if (response.ok) {
            const projectData = await response.json();
            objectivesMap[project.id] = projectData.objectives || [];
          }
        } catch (error) {
          console.error(`Failed to fetch objectives for project ${project.id}:`, error);
          objectivesMap[project.id] = [];
        }
      }
      setProjectObjectives(objectivesMap);
    };
    loadObjectives();
  }, [projects]);
  
  // Get work item counts per project
  const projectWorkItemCounts = React.useMemo(() => {
    const counts = {};
    items.forEach(item => {
      if (item.projectId) {
        counts[item.projectId] = (counts[item.projectId] || 0) + 1;
      }
    });
    return counts;
  }, [items]);
  
  // Get root organization name
  const rootOrg = units.find(u => u.parentId === null);
  const orgName = rootOrg?.name || 'your organization';

  return (
    <div className={styles.page}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Projects
            <HelpTooltip
              title="Projects Overview"
              content={
                <div>
                  <p><strong>View all projects</strong> created in your organization.</p>
                  <p><strong>Project Information:</strong></p>
                  <ul>
                    <li><strong>Status:</strong> Current state of the project</li>
                    <li><strong>Timeline:</strong> Start and target completion dates</li>
                    <li><strong>Owner:</strong> The organizational unit responsible</li>
                    <li><strong>Work Items:</strong> Number of associated work items from refinements</li>
                  </ul>
                  <p>Projects are created and managed through the Projects page.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
        subtitle={`${orgName}'s project portfolio`}
        actions={
          <Button onClick={() => navigate('/app/projects')} variant="primary">
            Initiate Projects
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
          <strong>Project Overview:</strong> This view shows all projects and their current status. 
          Click "Manage Projects" to create or edit projects.
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.tableWrapper}>
          {/* Projects List */}
          <div className={styles.tableBody}>
            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <p className={styles.emptyStateTitle}>Loading projects...</p>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <div>
                    <svg className={styles.emptyStateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p className={styles.emptyStateTitle}>No projects yet</p>
                  <p className={styles.emptyStateText}>Create your first project to get started</p>
                  <Button onClick={() => navigate('/app/projects')} variant="primary" style={{ marginTop: '16px' }}>
                    Create Project
                  </Button>
                </div>
              </div>
            ) : (
              projects.map(project => {
                const owningUnit = units.find(u => u.id === project.id);
                const objectives = projectObjectives[project.id] || [];
                const projectWorkItems = items.filter(wi => 
                  objectives.some(obj => obj.id === wi.objectiveId)
                );
                return (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    workItemCount={projectWorkItems.length}
                    owningUnit={owningUnit}
                    objectives={objectives}
                    workItems={projectWorkItems}
                  />
                );
              })
            )}
          </div>

          {/* Footer Stats */}
          {!loading && projects.length > 0 && (
            <div className={styles.tableFooter}>
              <div className={styles.footerStats}>
                <Badge variant="primary">{projects.length} projects</Badge>
                <span className={styles.footerDivider}>•</span>
                <Badge variant="secondary">{items.length} total work items</Badge>
                <span className={styles.footerDivider}>•</span>
                <span className={styles.footerText}>Last updated just now</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

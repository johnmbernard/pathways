import React, { useState } from 'react';
import { useProjectsStore } from '../store/projectsStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { Calendar, Users, FolderOpen, ChevronRight, ChevronDown, Target } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { API_BASE_URL } from '../config';
import styles from './WorkItemsPage.module.css';

function ObjectiveRow({ objective, projectId }) {
  return (
    <div className={styles.objectiveRow}>
      <div className={styles.objectiveIcon}>
        <Target size={16} />
      </div>
      
      <div className={styles.objectiveTierColumn}>
        {objective.fromTier ? (
          <Badge variant="secondary">Tier {objective.fromTier}</Badge>
        ) : (
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>—</span>
        )}
      </div>
      
      <div className={styles.objectiveTitle}>
        {objective.title}
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
    </div>
  );
}

function ProjectRow({ project, workItemCount, owningUnit, objectives }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  // Get refined objectives (those WITH a parent, created by lower tiers)
  // If no refined objectives exist, fall back to top-level objectives
  const refinedObjectives = objectives.filter(obj => obj.parentObjectiveId);
  const displayObjectives = refinedObjectives.length > 0 
    ? refinedObjectives 
    : objectives.filter(obj => !obj.parentObjectiveId);
  const hasObjectives = displayObjectives.length > 0;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'secondary';
      case 'In Progress': return 'warning';
      case 'At Risk': return 'danger';
      case 'Completed': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className={styles.projectRow}>
        <button
          onClick={() => hasObjectives && setIsExpanded(!isExpanded)}
          className={`${styles.expandButton} ${!hasObjectives ? styles.invisible : ''}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <div className={styles.projectIcon}>
          <FolderOpen size={20} />
        </div>
        
        <div className={styles.projectTitle}>
          <h3>{project.title}</h3>
          {project.ownerTier && (
            <Badge variant="secondary">Tier {project.ownerTier}</Badge>
          )}
        </div>
        
        <div className={styles.projectDescription}>
          {project.description || 'No description'}
        </div>
        
        <div className={styles.projectStatus}>
          <Badge variant={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        
        <div className={styles.projectDates}>
          <Calendar size={14} />
          <span>{project.startDate} → {project.targetDate}</span>
        </div>
        
        <div className={styles.projectOwner}>
          <Users size={14} />
          <span>{owningUnit?.name || 'No unit'}</span>
        </div>
        
        <div className={styles.projectStats}>
          {displayObjectives.length} objectives • {workItemCount} work items
        </div>
      </div>
      
      {isExpanded && displayObjectives.map(objective => (
        <ObjectiveRow 
          key={objective.id} 
          objective={objective} 
          projectId={project.id}
        />
      ))}
    </>
  );
}

export default function WorkItemsPage() {
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
            Manage Projects
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
                const owningUnit = units.find(u => u.id === project.ownerUnit);
                const workItemCount = projectWorkItemCounts[project.id] || 0;
                const objectives = projectObjectives[project.id] || [];
                return (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    workItemCount={workItemCount}
                    owningUnit={owningUnit}
                    objectives={objectives}
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

import React, { useState } from 'react';
import { useProjectsStore } from '../store/projectsStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { Calendar, Users, FolderOpen } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import styles from './WorkItemsPage.module.css';

function ProjectRow({ project, workItemCount, owningUnit }) {
  const navigate = useNavigate();
  
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
    <div className={styles.projectRow}>
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
        {workItemCount} work items
      </div>
    </div>
  );
}

export default function WorkItemsPage() {
  const { projects, fetchProjects } = useProjectsStore();
  const { items, fetchWorkItems } = useWorkItemsStore();
  const { units } = useOrganizationStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
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
                return (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    workItemCount={workItemCount}
                    owningUnit={owningUnit}
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

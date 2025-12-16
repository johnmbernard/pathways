import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import useRefinementStore from '../store/refinementStore';
import { useProjectsStore } from '../store/projectsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useUserStore } from '../store/userStore';
import { PageHeader } from '../components/layout/Layout';
import { Badge } from '../components/ui';
import styles from './MyRefinements.module.css';

export default function MyRefinements() {
  const navigate = useNavigate();
  const sessions = useRefinementStore((state) => state.sessions);
  const fetchSessions = useRefinementStore((state) => state.fetchSessions);
  const { projects, fetchProjects } = useProjectsStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { units } = useOrganizationStore();
  
  const [filterProject, setFilterProject] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSessions(), fetchProjects()]);
    };
    loadData();
  }, [fetchSessions, fetchProjects]);
  
  const currentUserUnitId = currentUser?.organizationalUnit;
  
  // Simplified RBAC: Everyone sees all refinements for visibility and "heads up"
  // Write access (add objectives/work items) controlled in RefinementPage by assigned units
  // Approval access controlled in RefinementPage by supervising units (lower tier)
  const mySessions = useMemo(() => {
    if (!currentUserUnitId) return [];
    
    // Show ALL sessions to everyone for visibility
    let filtered = sessions.filter(s => {
      if (!s.objective?.id) return false;
      return true; // Everyone sees everything
    });
    // Apply filters
    if (filterProject !== 'all') {
      filtered = filtered.filter(s => s.projectId === filterProject);
    }
    
    if (filterTier !== 'all') {
      filtered = filtered.filter(s => s.objective.fromTier === parseInt(filterTier));
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    return filtered;
  }, [sessions, currentUserUnitId, filterProject, filterTier, filterStatus]);
  
  // Group by status
  const inProgressSessions = mySessions.filter(s => s.status === 'in-progress');
  const completedSessions = mySessions.filter(s => s.status === 'completed');
  const notStartedSessions = mySessions.filter(s => s.status === 'not-started');
  
  // Get unique values for filter dropdowns
  const availableProjects = useMemo(() => {
    const projectIds = new Set();
    sessions.forEach(s => {
      if (s.projectId) projectIds.add(s.projectId);
    });
    return Array.from(projectIds)
      .map(id => projects.find(p => p.id === id))
      .filter(Boolean);
  }, [sessions, projects]);
  
  const availableTiers = useMemo(() => {
    const tiers = new Set();
    sessions.forEach(s => {
      if (s.objective?.fromTier) tiers.add(s.objective.fromTier);
    });
    return Array.from(tiers).sort((a, b) => a - b);
  }, [sessions]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'not-started':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'escalated':
        return <Badge variant="danger">Escalated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const SessionCard = ({ session }) => {
    const project = projects.find(p => p.id === session.projectId);
    const objective = session.objective;
    
    // Count child objectives created during this refinement
    const childObjectives = project?.objectives?.filter(
      obj => obj.parentObjectiveId === session.objectiveId
    ) || [];
    
    // Determine if this is a leaf unit refinement (no subordinates) by checking assigned units
    const assignedUnits = objective?.assignedUnits?.map(a => a.unit) || [];
    const isLeafUnit = assignedUnits.some(u => {
      // Check if this unit has any subordinate units
      const hasSubordinates = units.some(unit => unit.parentId === u?.id);
      return !hasSubordinates;
    });
    
    // Check if current user's unit has completed their portion
    const myCompletion = session.unitCompletions?.find(
      uc => uc.organizationalUnitId === currentUserUnitId
    );
    
    return (
      <div 
        className={styles.sessionCard}
        onClick={() => navigate(`/refinement/${session.id}`)}
      >
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.objectiveTitle}>{objective?.title || 'General Refinement'}</h3>
            <p className={styles.projectName}>
              Project: {project?.title || 'Unknown Project'}
            </p>
          </div>
          <div className={styles.badges}>
            {getStatusBadge(session.status)}
            {myCompletion && <Badge variant="success">Your Unit Complete</Badge>}
          </div>
        </div>
        
        {objective?.description && (
          <p className={styles.description}>{objective.description}</p>
        )}
        
        <div className={styles.cardMeta}>
          {objective?.targetDate && (
            <div className={styles.metaItem}>
              <Calendar size={14} />
              <span>Target: {new Date(objective.targetDate).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className={styles.metaItem}>
            <ClipboardList size={14} />
            <span>
              {isLeafUnit 
                ? `${session.workItems?.length || 0} work items` 
                : `${childObjectives.length} objectives`}
            </span>
          </div>
          
          {session.discussionMessages?.length > 0 && (
            <div className={styles.metaItem}>
              <span>💬 {session.discussionMessages.length} comments</span>
            </div>
          )}
          
          {assignedUnits.length > 0 && (
            <div className={styles.metaItem}>
              <span>👥 {session.unitCompletions?.length || 0}/{assignedUnits.length} units complete</span>
            </div>
          )}
        </div>
        
        <div className={styles.cardFooter}>
          <span className={styles.tierBadge}>
            {isLeafUnit ? 'Team Level (Work Items)' : 'Collaborative Refinement'}
          </span>
          <span className={styles.continueLink}>
            Continue Refinement →
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={styles.page}>
      <PageHeader
        title="My Refinements"
        subtitle="Refinement sessions assigned to your organizational unit"
      />
      
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="filterProject">Project:</label>
            <select 
              id="filterProject"
              value={filterProject} 
              onChange={(e) => setFilterProject(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Projects</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="filterTier">Tier:</label>
            <select 
              id="filterTier"
              value={filterTier} 
              onChange={(e) => setFilterTier(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Tiers</option>
              {availableTiers.map(tier => (
                <option key={tier} value={tier}>
                  Tier {tier}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="filterStatus">Status:</label>
            <select 
              id="filterStatus"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          
          {(filterProject !== 'all' || filterTier !== 'all' || filterStatus !== 'all') && (
            <button 
              className={styles.clearFilters}
              onClick={() => {
                setFilterProject('all');
                setFilterTier('all');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {mySessions.length === 0 ? (
          <div className={styles.emptyState}>
            <ClipboardList size={48} className={styles.emptyIcon} />
            <h3>No refinement sessions found</h3>
            <p>
              {sessions.length === 0 
                ? "When objectives are assigned to your organizational unit, they will appear here for refinement."
                : "Try adjusting your filters to see more sessions."}
            </p>
          </div>
        ) : (
          <div className={styles.sessionsLayout}>
            {/* Not Started */}
            {notStartedSessions.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Clock size={20} />
                  <h2>Not Started ({notStartedSessions.length})</h2>
                </div>
                <div className={styles.sessionsList}>
                  {notStartedSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>
            )}
            
            {/* In Progress */}
            {inProgressSessions.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <PlayCircle size={20} />
                  <h2>In Progress ({inProgressSessions.length})</h2>
                </div>
                <div className={styles.sessionsList}>
                  {inProgressSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>
            )}
            
            {/* Completed */}
            {completedSessions.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <CheckCircle size={20} />
                  <h2>Completed ({completedSessions.length})</h2>
                </div>
                <div className={styles.sessionsList}>
                  {completedSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

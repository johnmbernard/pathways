import { useMemo, useEffect } from 'react';
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
  const { projects } = useProjectsStore();
  const currentUser = useUserStore((state) => state.currentUser);
  
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  const currentUserUnitId = currentUser?.organizationalUnit;
  
  // Filter sessions for current user's unit - check if unit is assigned to the objective
  const mySessions = useMemo(() => {
    if (!currentUserUnitId) return [];
    
    return sessions.filter(s => {
      if (!s.objective?.id) return false;
      
      // Check if current user's unit is in the objective's assigned units
      // The session.objective includes assignedUnits from the backend
      const isAssigned = s.objective.assignedUnits?.some(
        assignment => assignment.unitId === currentUserUnitId
      );
      
      return isAssigned;
    });
  }, [sessions, currentUserUnitId]);
  
  // Group by status
  const inProgressSessions = mySessions.filter(s => s.status === 'in-progress');
  const completedSessions = mySessions.filter(s => s.status === 'completed');
  const notStartedSessions = mySessions.filter(s => s.status === 'not-started');
  
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
    
    // Determine if this is a team-level refinement by checking assigned units
    const assignedUnits = objective?.assignedUnits?.map(a => a.unit) || [];
    const isTeamTier = assignedUnits.some(u => u?.tier === 3);
    
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
              {isTeamTier 
                ? `${session.workItems?.length || 0} work items` 
                : `${session.refinedObjectives?.length || 0} objectives`}
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
            {isTeamTier ? 'Team Level' : 'Collaborative Refinement'}
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
        {mySessions.length === 0 ? (
          <div className={styles.emptyState}>
            <ClipboardList size={48} className={styles.emptyIcon} />
            <h3>No refinement sessions yet</h3>
            <p>
              When objectives are assigned to your organizational unit,
              they will appear here for refinement.
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

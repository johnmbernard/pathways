import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, X, Calendar, Users, AlertTriangle } from 'lucide-react';
import useRefinementStore from '../store/refinementStore';
import { useProjectsStore } from '../store/projectsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useUserStore } from '../store/userStore';
import styles from './RefinementPage.module.css';

export default function RefinementPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const currentUser = useUserStore(state => state.currentUser);
  const getSession = useRefinementStore((state) => state.getSession);
  const sessions = useRefinementStore((state) => state.sessions);
  const fetchSessions = useRefinementStore((state) => state.fetchSessions);
  const addDiscussion = useRefinementStore((state) => state.addDiscussion);
  const addObjective = useRefinementStore((state) => state.addObjective);
  const updateObjective = useRefinementStore((state) => state.updateObjective);
  const removeObjective = useRefinementStore((state) => state.removeObjective);
  const addWorkItem = useRefinementStore((state) => state.addWorkItem);
  const updateWorkItem = useRefinementStore((state) => state.updateWorkItem);
  const removeWorkItem = useRefinementStore((state) => state.removeWorkItem);
  const completeSession = useRefinementStore((state) => state.completeSession);
  const markUnitComplete = useRefinementStore((state) => state.markUnitComplete);
  const removeUnitCompletion = useRefinementStore((state) => state.removeUnitCompletion);
  
  const getProject = useProjectsStore((state) => state.getProject);
  const markObjectiveCompletedByUnit = useProjectsStore((state) => state.markObjectiveCompletedByUnit);
  const { units, getUnitsByTier, getTierLevel } = useOrganizationStore();
  const addItem = useWorkItemsStore((state) => state.addItem);
  
  // All useState hooks must be declared before any conditional returns
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showWorkItemModal, setShowWorkItemModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [editingWorkItem, setEditingWorkItem] = useState(null);
  
  // Fetch sessions on mount to get latest data
  useEffect(() => {
    const loadSessions = async () => {
      await fetchSessions();
      setIsLoading(false);
    };
    loadSessions();
  }, [fetchSessions]);
  
  const session = getSession(sessionId);
  const project = session ? getProject(session.projectId) : null;
  const currentUserUnit = units.find(u => u.id === currentUser?.organizationalUnit);
  const actualTier = currentUserUnit?.tier || 1;
  const isTeamTier = currentUserUnit?.tier === 3;
  
  // Get available units for next tier - only subordinate units
  const nextTierUnits = useMemo(() => {
    if (isTeamTier) return [];
    const nextTier = actualTier + 1;
    if (nextTier > 3) return [];
    
    const allNextTierUnits = getUnitsByTier(nextTier);
    
    // Filter to only units that are direct children of the current user's organizational unit
    const unitId = currentUser?.organizationalUnit;
    if (!unitId) return allNextTierUnits;
    
    return allNextTierUnits.filter(unit => unit.parentId === unitId);
  }, [isTeamTier, actualTier, currentUser?.organizationalUnit, getUnitsByTier]);
  
  // Conditional returns AFTER all hooks
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Loading refinement session...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertTriangle size={48} />
          <h2>Refinement Session Not Found</h2>
          <button onClick={() => navigate('/projects')} className={styles.button}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    addDiscussion(sessionId, { text: message, type: 'comment' }, currentUser);
    setMessage('');
  };
  
  const handleSaveObjective = (objectiveData) => {
    if (editingObjective) {
      updateObjective(sessionId, editingObjective.id, objectiveData);
    } else {
      addObjective(sessionId, objectiveData, currentUser);
    }
    setShowObjectiveModal(false);
    setEditingObjective(null);
  };
  
  const handleSaveWorkItem = (workItemData) => {
    if (editingWorkItem) {
      updateWorkItem(sessionId, editingWorkItem.tempId, workItemData);
    } else {
      addWorkItem(sessionId, workItemData, currentUser);
    }
    setShowWorkItemModal(false);
    setEditingWorkItem(null);
  };
  
  const handleComplete = () => {
    if (isTeamTier) {
      // Add work items to backlog
      session.workItems.forEach(wi => {
        addItem({
          title: wi.title,
          description: wi.description,
          type: wi.type,
          priority: wi.priority,
          projectId: session.projectId,
          objectiveId: session.objectiveId || session.objective?.id,
          assignedTo: wi.assignedTo
        });
      });
    }
    
    // Mark this objective as completed by the current user's unit
    if (session.objectiveId || session.objective?.id) {
      markObjectiveCompletedByUnit(
        session.projectId,
        session.objectiveId || session.objective?.id,
        currentUser?.organizationalUnit
      );
    }
    
    completeSession(sessionId);
    navigate('/projects');
  };
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>{project?.title || 'Unknown Project'}</h1>
          <p className={styles.subtitle}>
            Your {isTeamTier ? 'Team' : `Tier ${actualTier}`}: {currentUserUnit?.name || 'Unit'}
          </p>
        </div>
        <button onClick={() => navigate('/projects')} className={styles.backButton}>
          ← Back to Projects
        </button>
      </header>
      
      <div className={styles.content}>
        {/* Assigned Objective */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            📋 Objective from {session.objective?.fromTier ? `Tier ${session.objective.fromTier}` : project?.ownerTier ? `Tier ${project.ownerTier}` : 'Leadership'}
          </h2>
          <div className={styles.objectiveCard}>
            <h3>{session.objective?.title || 'General Refinement'}</h3>
            {session.objective?.description && <p>{session.objective.description}</p>}
            {session.objective?.targetDate && (
              <div className={styles.meta}>
                <Calendar size={16} />
                <span>Target Date: {new Date(session.objective.targetDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </section>
        
        {/* Unit Completion Status */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            👥 Unit Completion Status
          </h2>
          <div className={styles.unitCompletionList}>
            {session.objective?.assignedUnits?.map(assignment => {
              const unit = assignment.unit;
              const completion = session.unitCompletions?.find(
                uc => uc.organizationalUnitId === unit.id
              );
              const isMyUnit = unit.id === currentUser?.organizationalUnit;
              
              return (
                <div key={unit.id} className={styles.unitCompletionCard}>
                  <div>
                    <strong>{unit.name}</strong>
                    {isMyUnit && <span className={styles.myUnitBadge}> (Your Unit)</span>}
                  </div>
                  {completion ? (
                    <div className={styles.completionInfo}>
                      <span className={styles.completedBadge}>✓ Complete</span>
                      <span className={styles.completedBy}>
                        by {completion.completedByUser?.name} on{' '}
                        {new Date(completion.completedAt).toLocaleDateString()}
                      </span>
                      {isMyUnit && (
                        <button
                          onClick={() => removeUnitCompletion(sessionId, unit.id)}
                          className={styles.reopenButton}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className={styles.inProgressBadge}>In Progress</span>
                      {isMyUnit && (
                        <button
                          onClick={() => markUnitComplete(sessionId, unit.id, currentUser)}
                          className={styles.completeButton}
                        >
                          Mark My Unit Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Collaboration Space */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            💬 Collaboration Space
          </h2>
          <div className={styles.discussionContainer}>
            <div className={styles.discussionList}>
              {(session.discussionMessages?.length || 0) === 0 ? (
                <p className={styles.emptyState}>No messages yet. Start the conversation!</p>
              ) : (
                session.discussionMessages.map(msg => (
                  <div key={msg.id} className={styles.message}>
                    <div className={styles.messageHeader}>
                      <strong>{msg.author?.name || msg.authorName}</strong>
                      <span className={styles.timestamp}>
                        {new Date(msg.createdAt || msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p>{msg.content || msg.message}</p>
                    {msg.type && msg.type !== 'comment' && (
                      <span className={styles.messageType}>[{msg.type}]</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className={styles.messageInput}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question or comment..."
                className={styles.input}
              />
              <button onClick={handleSendMessage} className={styles.sendButton}>
                Send
              </button>
            </div>
          </div>
        </section>
        
        {/* Refinement Output */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isTeamTier ? '✅ Break Down into Work Items' : '🎯 Your Refined Objectives for Next Tier'}
            </h2>
            <button
              onClick={() => isTeamTier ? setShowWorkItemModal(true) : setShowObjectiveModal(true)}
              className={styles.addButton}
            >
              <Plus size={16} />
              {isTeamTier ? 'Add Work Item' : 'Add Objective'}
            </button>
          </div>
          
          <div className={styles.itemsList}>
            {isTeamTier ? (
              session.workItems.length === 0 ? (
                <p className={styles.emptyState}>No work items yet. Add requirements from the objective above.</p>
              ) : (
                session.workItems.map((wi, index) => (
                  <div key={wi.tempId} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNumber}>{index + 1}.</span>
                      <h3>{wi.title}</h3>
                      <button
                        onClick={() => {
                          setEditingWorkItem(wi);
                          setShowWorkItemModal(true);
                        }}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeWorkItem(sessionId, wi.tempId)}
                        className={styles.removeButton}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className={styles.itemDescription}>{wi.description}</p>
                    <div className={styles.itemMeta}>
                      <span className={styles.badge}>{wi.type}</span>
                      <span className={styles.badge}>{wi.priority}</span>
                      {wi.createdByName && <span>Created by: {wi.createdByName}</span>}
                      {wi.assignedTo && <span>Assigned: {wi.assignedTo}</span>}
                    </div>
                  </div>
                ))
              )
            ) : (
              session.refinedObjectives.length === 0 ? (
                <p className={styles.emptyState}>No objectives yet. Define what needs to happen next.</p>
              ) : (
                session.refinedObjectives.map((obj, index) => (
                  <div key={obj.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNumber}>{index + 1}.</span>
                      <h3>{obj.title}</h3>
                      <button
                        onClick={() => {
                          setEditingObjective(obj);
                          setShowObjectiveModal(true);
                        }}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeObjective(sessionId, obj.id)}
                        className={styles.removeButton}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className={styles.itemDescription}>{obj.description}</p>
                    <div className={styles.itemMeta}>
                      {obj.createdByName && (
                        <div className={styles.metaItem}>
                          <Users size={14} />
                          Created by: {obj.createdByName}
                        </div>
                      )}
                      {obj.targetDate && (
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          Target: {new Date(obj.targetDate).toLocaleDateString()}
                        </div>
                      )}
                      {obj.assignedUnits?.length > 0 && (
                        <div className={styles.metaItem}>
                          <Users size={14} />
                          {obj.assignedUnits.length} unit(s)
                        </div>
                      )}
                      {obj.risks?.length > 0 && (
                        <div className={styles.metaItem}>
                          <AlertTriangle size={14} />
                          {obj.risks.length} risk(s)
                        </div>
                      )}
                    </div>
                    {obj.dependencies?.length > 0 && (
                      <div className={styles.dependencies}>
                        Dependencies: {obj.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </section>
        
        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={() => navigate('/projects')} className={styles.secondaryButton}>
            Save Draft
          </button>
          <button
            onClick={handleComplete}
            className={styles.primaryButton}
            disabled={isTeamTier ? session.workItems.length === 0 : session.refinedObjectives.length === 0}
          >
            {isTeamTier ? 'Complete & Add to Backlog' : 'Complete Refinement & Notify Next Tier'}
          </button>
        </div>
      </div>
      
      {/* Objective Modal */}
      {showObjectiveModal && (
        <ObjectiveModal
          objective={editingObjective}
          nextTierUnits={nextTierUnits}
          onSave={handleSaveObjective}
          onClose={() => {
            setShowObjectiveModal(false);
            setEditingObjective(null);
          }}
        />
      )}
      
      {/* Work Item Modal */}
      {showWorkItemModal && (
        <WorkItemModal
          workItem={editingWorkItem}
          onSave={handleSaveWorkItem}
          onClose={() => {
            setShowWorkItemModal(false);
            setEditingWorkItem(null);
          }}
        />
      )}
    </div>
  );
}

// Objective Modal Component
function ObjectiveModal({ objective, nextTierUnits, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: objective?.title || '',
    description: objective?.description || '',
    targetDate: objective?.targetDate || '',
    assignedUnits: objective?.assignedUnits || [],
    dependencies: objective?.dependencies || [],
    risks: objective?.risks || []
  });
  
  const [newRisk, setNewRisk] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const toggleUnit = (unitId) => {
    setFormData(prev => ({
      ...prev,
      assignedUnits: prev.assignedUnits.includes(unitId)
        ? prev.assignedUnits.filter(id => id !== unitId)
        : [...prev.assignedUnits, unitId]
    }));
  };
  
  const addRisk = () => {
    if (newRisk.trim()) {
      setFormData(prev => ({ ...prev, risks: [...prev.risks, newRisk] }));
      setNewRisk('');
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{objective ? 'Edit Objective' : 'Add Objective'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Target Date *</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Assign to Next Tier Units</label>
            <div className={styles.unitGrid}>
              {nextTierUnits.map(unit => (
                <label key={unit.id} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.assignedUnits.includes(unit.id)}
                    onChange={() => toggleUnit(unit.id)}
                  />
                  {unit.name}
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Risks</label>
            <div className={styles.riskInput}>
              <input
                type="text"
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value)}
                placeholder="Add a risk..."
                className={styles.input}
              />
              <button type="button" onClick={addRisk} className={styles.addButton}>
                Add
              </button>
            </div>
            <ul className={styles.riskList}>
              {formData.risks.map((risk, idx) => (
                <li key={idx}>
                  {risk}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      risks: prev.risks.filter((_, i) => i !== idx)
                    }))}
                    className={styles.removeButton}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton}>
              {objective ? 'Update' : 'Add'} Objective
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Work Item Modal Component
function WorkItemModal({ workItem, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: workItem?.title || '',
    description: workItem?.description || '',
    type: workItem?.type || 'Story',
    priority: workItem?.priority || 'P1',
    assignedTo: workItem?.assignedTo || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{workItem ? 'Edit Work Item' : 'Add Work Item'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={styles.select}
              >
                <option>Story</option>
                <option>Task</option>
                <option>Bug</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={styles.select}
              >
                <option>P1</option>
                <option>P2</option>
                <option>P3</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Assigned To</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Optional"
              className={styles.input}
            />
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton}>
              {workItem ? 'Update' : 'Add'} Work Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

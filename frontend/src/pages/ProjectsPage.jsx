import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/projectsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useUserStore } from '../store/userStore';
import useRefinementStore from '../store/refinementStore';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/layout/Layout';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { Plus, Calendar, DollarSign, Users, FolderOpen, AlertTriangle, Pencil, Trash2, X, PlayCircle } from 'lucide-react';
import styles from './ProjectsPage.module.css';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore(state => state.currentUser);
  const { projects, addProject, updateProject, deleteProject, fetchProjects, loading } = useProjectsStore();
  const { units, fetchUnits } = useOrganizationStore();
  const { items } = useWorkItemsStore();
  const createSession = useRefinementStore((state) => state.createSession);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch projects and units on mount
  useEffect(() => {
    fetchProjects();
    fetchUnits();
  }, [fetchProjects, fetchUnits]);
  const [editingProject, setEditingProject] = useState(null);
  const [refinementProject, setRefinementProject] = useState(null);
  const [tierFilter, setTierFilter] = useState('all');

  const allTeams = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name })),
  ], [units]);

  // Get unique tiers from organization (based on hierarchical depth)
  const { getUnitsByTier, getTierLevel } = useOrganizationStore();
  const availableTiers = useMemo(() => {
    // Get max tier depth
    const maxTier = units.reduce((max, unit) => {
      const tier = getTierLevel(unit.id);
      return Math.max(max, tier);
    }, 0);
    
    // Create array of available tiers
    return Array.from({ length: maxTier }, (_, i) => i + 1);
  }, [units, getTierLevel]);

  // Filter projects by tier
  const filteredProjects = useMemo(() => {
    if (tierFilter === 'all') return projects;
    return projects.filter(p => p.ownerTier === parseInt(tierFilter));
  }, [projects, tierFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'secondary';
      case 'In Progress': return 'warning';
      case 'At Risk': return 'danger';
      case 'Completed': return 'success';
      default: return 'secondary';
    }
  };

  const ProjectCard = ({ project }) => {
    const projectWorkItems = items.filter(item => item.projectId === project.id);
    const owningUnit = allTeams.find(team => team.id === project.ownerUnit);
    
    return (
      <div className={styles.projectCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FolderOpen size={20} className={styles.cardIcon} />
            <h3>{project.title}</h3>
            {project.ownerTier && (
              <Badge variant="secondary">Tier {project.ownerTier}</Badge>
            )}
          </div>
          <div className={styles.cardActions}>
            <Badge variant={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <button
              onClick={() => setEditingProject(project)}
              className={styles.iconButton}
              title="Edit project"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={async () => {
                if (window.confirm(`Delete project "${project.title}"?`)) {
                  try {
                    await deleteProject(project.id);
                  } catch (error) {
                    alert('Failed to delete project');
                  }
                }
              }}
              className={`${styles.iconButton} ${styles.danger}`}
              title="Delete project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className={styles.cardDescription}>{project.description}</p>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>{project.startDate} → {project.targetDate}</span>
          </div>
          {project.budget > 0 && (
            <div className={styles.metaItem}>
              <DollarSign size={14} />
              <span>${(project.budget / 1000).toFixed(0)}K</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <Users size={14} />
            <span>{owningUnit ? owningUnit.name : 'No unit'}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.workItemsCount}>
            {projectWorkItems.length} work item{projectWorkItems.length !== 1 ? 's' : ''}
          </div>
          {project.risks && project.risks.length > 0 && (
            <div className={styles.risksAlert}>
              <AlertTriangle size={14} />
              <span>{project.risks.length} risk{project.risks.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Show Start Refinement if: (1) user owns the project OR (2) user's unit is assigned to any objective */}
        {project.objectives && project.objectives.length > 0 && (() => {
          const isProjectOwner = project.ownerUnit === currentUser?.organizationalUnit;
          const hasAssignedObjectives = project.objectives.some(obj => 
            obj.assignedUnits?.some(assignment => assignment.unitId === currentUser?.organizationalUnit)
          );
          
          return (isProjectOwner || hasAssignedObjectives) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setRefinementProject(project)}
                className={styles.refinementButton}
              >
                <PlayCircle size={16} />
                {isProjectOwner ? 'Start Refinement' : 'Continue Refinement'}
              </button>
              <HelpTooltip
                title="Refinement Process"
                content={
                  <div>
                    <p>Begin a refinement session to break down objectives into actionable work.</p>
                    <p><strong>Process:</strong></p>
                    <ul>
                      <li>Select an objective to refine</li>
                      <li>Assigned teams collaborate asynchronously</li>
                      <li>Break objectives into sub-objectives or work items</li>
                      <li>Provide estimates and discuss approaches</li>
                    </ul>
                    <p>Refinements support both hierarchical (objectives → sub-objectives) and team-level (objectives → work items) breakdowns.</p>
                  </div>
                }
                size="small"
              />
            </div>
          );
        })()}
      </div>
    );
  };

  const ProjectModal = ({ project, onClose }) => {
    // Get available tiers and units from organization store
    const { units: modalUnits, getUnitsByTier, getTierLevel } = useOrganizationStore();
    
    const modalAvailableTiers = useMemo(() => {
      // Get max tier depth
      const maxTier = modalUnits.reduce((max, unit) => {
        const tier = getTierLevel(unit.id);
        return Math.max(max, tier);
      }, 0);
      
      // Create array of available tiers
      return Array.from({ length: maxTier }, (_, i) => i + 1);
    }, [modalUnits, getTierLevel]);
    
    const [formData, setFormData] = useState(project || {
      title: '',
      description: '',
      owner: '',
      ownerUnit: '',
      ownerTier: modalAvailableTiers[0] || 1,
      status: 'Planning',
      startDate: '',
      targetDate: '',
      budget: 0,
      teams: [],
      objectives: [],
      notes: '',
    });

    const [newObjective, setNewObjective] = useState({ title: '', targetDate: '', assignedUnits: [] });
    const [editingObjectiveId, setEditingObjectiveId] = useState(null);

    // Get units for current tier
    const currentTierUnits = useMemo(() => {
      return getUnitsByTier(formData.ownerTier);
    }, [formData.ownerTier, getUnitsByTier]);

    // Get units for next tier - only subordinate units
    const nextTierUnits = useMemo(() => {
      const nextTier = formData.ownerTier + 1;
      const allNextTierUnits = getUnitsByTier(nextTier);
      if (!formData.ownerUnit) return allNextTierUnits;
      return allNextTierUnits.filter(unit => unit.parentId === formData.ownerUnit);
    }, [formData.ownerTier, formData.ownerUnit, getUnitsByTier]);

    const handleAddObjective = () => {
      if (newObjective.title && newObjective.targetDate) {
        if (editingObjectiveId) {
          // Update existing objective
          setFormData({
            ...formData,
            objectives: formData.objectives.map(obj => 
              obj.id === editingObjectiveId 
                ? { ...newObjective, id: editingObjectiveId }
                : obj
            )
          });
          setEditingObjectiveId(null);
        } else {
          // Add new objective
          setFormData({
            ...formData,
            objectives: [...formData.objectives, { ...newObjective, id: `temp-${Date.now()}` }]
          });
        }
        setNewObjective({ title: '', targetDate: '', assignedUnits: [] });
      }
    };

    const handleRemoveObjective = (objId) => {
      setFormData({
        ...formData,
        objectives: formData.objectives.filter(obj => obj.id !== objId)
      });
      // If we were editing this objective, clear the edit state
      if (editingObjectiveId === objId) {
        setEditingObjectiveId(null);
        setNewObjective({ title: '', targetDate: '', assignedUnits: [] });
      }
    };

    const handleEditObjective = (obj) => {
      setEditingObjectiveId(obj.id);
      setNewObjective({
        title: obj.title,
        targetDate: obj.targetDate,
        // Extract unit IDs from assignedUnits array (which contains assignment objects with unit property)
        assignedUnits: obj.assignedUnits?.map(assignment => assignment.unitId || assignment.unit?.id || assignment) || []
      });
    };

    const handleCancelEdit = () => {
      setEditingObjectiveId(null);
      setNewObjective({ title: '', targetDate: '', assignedUnits: [] });
    };

    const toggleUnitForObjective = (unitId) => {
      setNewObjective(prev => ({
        ...prev,
        assignedUnits: prev.assignedUnits.includes(unitId)
          ? prev.assignedUnits.filter(id => id !== unitId)
          : [...prev.assignedUnits, unitId]
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        let savedProject;
        if (project) {
          savedProject = await updateProject(project.id, formData);
          
          // Save objectives for existing project
          if (formData.objectives && formData.objectives.length > 0) {
            for (const obj of formData.objectives) {
              if (obj.id && !obj.id.startsWith('temp-')) {
                // Update existing objective
                // Extract unit IDs from assignedUnits (handles both array of IDs and array of objects)
                const unitIds = obj.assignedUnits?.map(item => 
                  typeof item === 'string' ? item : (item.unitId || item.unit?.id || item.id)
                ).filter(Boolean) || [];
                
                await fetch(`${API_BASE_URL}/objectives/${obj.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: obj.title,
                    targetDate: obj.targetDate,
                    assignedUnits: unitIds,
                  }),
                });
              } else {
                // Create new objective
                // Extract unit IDs from assignedUnits (handles both array of IDs and array of objects)
                const unitIds = obj.assignedUnits?.map(item => 
                  typeof item === 'string' ? item : (item.unitId || item.unit?.id || item.id)
                ).filter(Boolean) || [];
                
                await fetch(`${API_BASE_URL}/objectives`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: obj.title,
                    targetDate: obj.targetDate,
                    projectId: project.id,
                    assignedUnits: unitIds,
                    createdBy: currentUser?.id,
                  }),
                });
              }
            }
          }
        } else {
          savedProject = await addProject({
            ...formData,
            createdBy: currentUser?.id,
          });
          
          // Save objectives for new project
          if (formData.objectives && formData.objectives.length > 0 && savedProject.id) {
            for (const obj of formData.objectives) {
              await fetch(`${API_BASE_URL}/objectives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: obj.title,
                  targetDate: obj.targetDate,
                  projectId: savedProject.id,
                  assignedUnits: obj.assignedUnits || [],
                  createdBy: currentUser?.id,
                }),
              });
            }
          }
        }
        
        // Refresh projects to get updated objectives
        await fetchProjects();
        onClose();
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project');
      }
    };

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{project ? 'Edit Project' : 'New Project'}</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={styles.input}
                required
                placeholder="e.g., Enterprise Observability Platform"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Describe the project objectives and scope..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className={styles.input}
                  placeholder="Project owner or sponsor"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Owner Tier</label>
                <select
                  value={formData.ownerTier}
                  onChange={(e) => setFormData({ ...formData, ownerTier: parseInt(e.target.value) })}
                  className={styles.select}
                >
                  {modalAvailableTiers.map(tier => (
                    <option key={tier} value={tier}>Tier {tier}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Owner Unit</label>
              <select
                value={formData.ownerUnit}
                onChange={(e) => setFormData({ ...formData, ownerUnit: e.target.value })}
                className={styles.select}
              >
                <option value="">Select unit...</option>
                {currentTierUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={styles.select}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Budget ($)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className={styles.input}
                min="0"
                step="1000"
                placeholder="0"
              />
            </div>

            {/* Objectives Builder */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Objectives for Next Tier (Tier {formData.ownerTier + 1})</label>
              
              {formData.objectives.length > 0 && (
                <div className={styles.objectivesList}>
                  {formData.objectives.map((obj, idx) => (
                    <div key={obj.id} className={styles.objectiveItem}>
                      <div>
                        <strong>{idx + 1}. {obj.title}</strong>
                        <div className={styles.objectiveMeta}>
                          Target: {new Date(obj.targetDate).toLocaleDateString()} • 
                          {obj.assignedUnits.length} unit(s) assigned
                        </div>
                      </div>
                      <div className={styles.objectiveActions}>
                        <button
                          type="button"
                          onClick={() => handleEditObjective(obj)}
                          className={styles.editButton}
                          title="Edit objective"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(obj.id)}
                          className={styles.removeButton}
                          title="Remove objective"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.objectiveBuilder}>
                {editingObjectiveId && (
                  <div className={styles.editingIndicator}>
                    ✏️ Editing objective
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelEditButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={newObjective.title}
                  onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                  className={styles.input}
                  placeholder="Objective title..."
                />
                <input
                  type="date"
                  value={newObjective.targetDate}
                  onChange={(e) => setNewObjective({ ...newObjective, targetDate: e.target.value })}
                  className={styles.input}
                />
                {nextTierUnits.length > 0 && (
                  <div className={styles.unitSelector}>
                    <label className={styles.smallLabel}>Assign to:</label>
                    <div className={styles.unitCheckboxes}>
                      {nextTierUnits.map(unit => (
                        <label key={unit.id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newObjective.assignedUnits.includes(unit.id)}
                            onChange={() => toggleUnitForObjective(unit.id)}
                          />
                          {unit.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddObjective}
                  disabled={!newObjective.title || !newObjective.targetDate}
                >
                  <Plus size={16} />
                  {editingObjectiveId ? 'Update Objective' : 'Add Objective'}
                </Button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Additional notes, constraints, or dependencies..."
              />
            </div>

            <div className={styles.modalFooter}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {project ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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
                  <p><strong>Projects</strong> are the top-level containers for organizing work in Pathways.</p>
                  <p>Each project contains:</p>
                  <ul>
                    <li><strong>Objectives:</strong> Strategic goals broken down across organizational tiers</li>
                    <li><strong>Refinement Sessions:</strong> Collaborative spaces for teams to break down objectives</li>
                    <li><strong>Work Items:</strong> Granular tasks that deliver the objectives</li>
                  </ul>
                  <p>Projects are owned by specific organizational units at a particular tier level.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
        subtitle="Manage organizational projects and initiatives"
        actions={
          <Button onClick={() => setIsCreating(true)} variant="primary">
            <Plus size={18} />
            New Project
          </Button>
        }
      />

      <div className={styles.container}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <FolderOpen className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No projects yet</h3>
            <p className={styles.emptyText}>
              Create your first project to start organizing work items and tracking progress
            </p>
            <Button onClick={() => setIsCreating(true)} variant="primary">
              <Plus size={18} />
              Create Project
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <label>Filter by Tier:</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Tiers</option>
                {availableTiers.map(tier => (
                  <option key={tier} value={tier}>Tier {tier}</option>
                ))}
              </select>
              <span className={styles.resultCount}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className={styles.projectsGrid}>
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>

      {isCreating && (
        <ProjectModal
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {refinementProject && (
        <RefinementModal
          project={refinementProject}
          onClose={() => setRefinementProject(null)}
          onStartRefinement={async (objectiveId, assignedUnits) => {
            const objective = refinementProject.objectives.find(obj => obj.id === objectiveId);
            
            if (objective && assignedUnits && assignedUnits.length > 0) {
              // Create ONE collaborative refinement session for the objective
              // All assigned units will share this session
              try {
                const sessionId = await createSession(
                  refinementProject.id,
                  objectiveId,
                  currentUser
                );
                
                // Close modal and navigate to the refinement session
                setRefinementProject(null);
                
                // Navigate to the refinement session
                if (sessionId) {
                  navigate(`/app/refinement/${sessionId}`);
                }
              } catch (error) {
                console.error('Error creating refinement session:', error);
                alert('Failed to create refinement session');
              }
            }
          }}
        />
      )}
    </div>
  );
}

// Refinement Modal Component
function RefinementModal({ project, onClose, onStartRefinement }) {
  const { units, getTierLevel } = useOrganizationStore();
  const currentUser = useUserStore(state => state.currentUser);
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Start Refinement: {project.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.refinementIntro}>
            Select an objective and organizational unit to begin the refinement process.
            This will create a refinement session where the unit can break down the objective
            into more detailed work.
          </p>

          {(() => {
            const isProjectOwner = project.ownerUnit === currentUser?.organizationalUnit;
            
            // Project owners see all objectives (to release for refinement)
            // Assigned units only see their objectives (to work on them)
            const relevantObjectives = isProjectOwner 
              ? project.objectives
              : project.objectives.filter(objective => 
                  objective.assignedUnits?.some(assignment => assignment.unitId === currentUser?.organizationalUnit)
                );
            
            if (project.objectives.length === 0) {
              return (
                <div className={styles.emptyObjectives}>
                  <AlertTriangle size={24} />
                  <p>No objectives defined for this project yet.</p>
                  <p className={styles.hint}>Edit the project to add objectives first.</p>
                </div>
              );
            }
            
            if (relevantObjectives.length === 0) {
              return (
                <div className={styles.emptyObjectives}>
                  <AlertTriangle size={24} />
                  <p>No objectives assigned to your unit.</p>
                  <p className={styles.hint}>This project's objectives are assigned to other units.</p>
                </div>
              );
            }
            
            return (
              <div className={styles.objectivesRefinementList}>
                {isProjectOwner && (
                  <div className={styles.refinementInfo}>
                    <strong>Release Objectives for Refinement</strong>
                    <p>Select objectives to release for refinement. All assigned units will receive the objective and can collaborate on breaking it down.</p>
                  </div>
                )}
                {relevantObjectives.map((objective) => {
                  // Filter assigned units to only show those at the correct tier (next tier after project owner)
                  const expectedTier = project.ownerTier + 1;
                  const assignedUnits = objective.assignedUnits
                    .map(assignment => assignment.unit)
                    .filter(unit => unit && unit.tier === expectedTier);
                  
                  // Check if objective has been released (if any sessions exist for it)
                  const sessions = useRefinementStore.getState().sessions;
                  const objectiveSessions = sessions.filter(s => 
                    s.projectId === project.id && s.objectiveId === objective.id
                  );
                  const isReleased = objectiveSessions.length > 0;
                  
                  // Calculate completion status
                  const completedUnits = assignedUnits.filter(unit => 
                    objective.completedByUnits?.includes(unit.id)
                  );
                  const completionPercentage = assignedUnits.length > 0 
                    ? Math.round((completedUnits.length / assignedUnits.length) * 100)
                    : 0;

                return (
                  <div key={objective.id} className={styles.objectiveRefinementCard}>
                    <div className={styles.objectiveHeader}>
                      <h3>{objective.title}</h3>
                      <div className={styles.objectiveMeta}>
                        {objective.targetDate && (
                          <span className={styles.targetDate}>
                            <Calendar size={14} />
                            {new Date(objective.targetDate).toLocaleDateString()}
                          </span>
                        )}
                        {isReleased && (
                          <span className={styles.releasedBadge}>
                            ✓ Released
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {objective.description && (
                      <p className={styles.objectiveDescription}>{objective.description}</p>
                    )}

                    <div className={styles.assignedUnits}>
                      <label>Assigned Units (Tier {expectedTier}):</label>
                      {assignedUnits.length === 0 ? (
                        <div>
                          <p className={styles.noUnits}>
                            {objective.assignedUnits.length > 0 
                              ? `⚠️ Units were assigned but are not at the correct tier (Tier ${expectedTier}). Please edit the project to reassign.`
                              : 'No units assigned to this objective'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className={styles.unitsChips}>
                            {assignedUnits.map(unit => {
                              const isCompleted = objective.completedByUnits?.includes(unit.id);
                              return (
                                <span 
                                  key={unit.id} 
                                  className={`${styles.unitChip} ${isCompleted ? styles.unitChipCompleted : ''}`}
                                >
                                  <Users size={12} />
                                  {unit.name}
                                  {isCompleted && <span className={styles.checkmark}>✓</span>}
                                </span>
                              );
                            })}
                          </div>
                          
                          {isReleased && (
                            <div className={styles.progressBar}>
                              <div className={styles.progressBarFill} style={{ width: `${completionPercentage}%` }} />
                              <span className={styles.progressText}>
                                {completedUnits.length} of {assignedUnits.length} completed
                              </span>
                            </div>
                          )}
                          
                          {isProjectOwner && !isReleased && (
                            <button
                              onClick={() => onStartRefinement(objective.id, assignedUnits)}
                              className={styles.releaseButton}
                            >
                              <PlayCircle size={16} />
                              Release for Refinement
                            </button>
                          )}
                          
                          {!isProjectOwner && isReleased && (
                            <button
                              onClick={() => {
                                // Find the session for this user's unit
                                const mySession = objectiveSessions.find(s => 
                                  s.organizationalUnit === currentUser?.organizationalUnit
                                );
                                if (mySession) {
                                  navigate(`/app/refinement/${mySession.id}`);
                                }
                              }}
                              className={styles.openRefinementButton}
                            >
                              Open Refinement →
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })()}
        </div>

        <div className={styles.modalFooter}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

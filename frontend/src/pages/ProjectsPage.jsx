import React, { useState, useMemo } from 'react';
import { useProjectsStore } from '../store/projectsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { PageHeader } from '../components/layout/Layout';
import { Button, Badge } from '../components/ui';
import { Plus, Calendar, DollarSign, Users, FolderOpen, AlertTriangle, Pencil, Trash2, X } from 'lucide-react';
import styles from './ProjectsPage.module.css';

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectsStore();
  const { units, flatUnits } = useOrganizationStore();
  const { items } = useWorkItemsStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [tierFilter, setTierFilter] = useState('all');

  const allTeams = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name })),
    ...flatUnits.map(u => ({ id: u.id, name: u.name }))
  ], [units, flatUnits]);

  // Get unique tiers from organization
  const availableTiers = useMemo(() => {
    const tiers = new Set(flatUnits.map(u => u.tier));
    return Array.from(tiers).sort((a, b) => a - b);
  }, [flatUnits]);

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
    const projectWorkItems = items.filter(item => project.workItems.includes(item.id));
    const projectTeams = allTeams.filter(team => project.teams.includes(team.id));
    
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
              onClick={() => {
                if (window.confirm(`Delete project "${project.title}"?`)) {
                  deleteProject(project.id);
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
            <span>{projectTeams.length} team{projectTeams.length !== 1 ? 's' : ''}</span>
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
      </div>
    );
  };

  const ProjectModal = ({ project, onClose }) => {
    const [formData, setFormData] = useState(project || {
      title: '',
      description: '',
      owner: '',
      ownerUnit: '',
      ownerTier: availableTiers[0] || 1,
      status: 'Planning',
      startDate: '',
      targetDate: '',
      budget: 0,
      teams: [],
      objectives: [],
      notes: '',
    });

    const [newObjective, setNewObjective] = useState({ title: '', targetDate: '', assignedUnits: [] });

    // Get units for next tier
    const nextTierUnits = useMemo(() => {
      const nextTier = formData.ownerTier + 1;
      return flatUnits.filter(u => u.tier === nextTier);
    }, [formData.ownerTier]);

    // Get units for current tier
    const currentTierUnits = useMemo(() => {
      return flatUnits.filter(u => u.tier === formData.ownerTier);
    }, [formData.ownerTier]);

    const handleAddObjective = () => {
      if (newObjective.title && newObjective.targetDate) {
        setFormData({
          ...formData,
          objectives: [...formData.objectives, { ...newObjective, id: `temp-${Date.now()}` }]
        });
        setNewObjective({ title: '', targetDate: '', assignedUnits: [] });
      }
    };

    const handleRemoveObjective = (objId) => {
      setFormData({
        ...formData,
        objectives: formData.objectives.filter(obj => obj.id !== objId)
      });
    };

    const toggleUnitForObjective = (unitId) => {
      setNewObjective(prev => ({
        ...prev,
        assignedUnits: prev.assignedUnits.includes(unitId)
          ? prev.assignedUnits.filter(id => id !== unitId)
          : [...prev.assignedUnits, unitId]
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (project) {
        updateProject(project.id, formData);
      } else {
        addProject(formData);
      }
      onClose();
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
                  {availableTiers.map(tier => (
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
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(obj.id)}
                        className={styles.removeButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.objectiveBuilder}>
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
                  Add Objective
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
        title="Projects"
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
    </div>
  );
}

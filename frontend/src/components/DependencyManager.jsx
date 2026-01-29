import React, { useState, useEffect } from 'react';
import { X, Plus, Link2, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Button } from './ui';
import styles from './DependencyManager.module.css';

const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start', description: 'Successor starts after predecessor finishes' },
  { value: 'SS', label: 'Start-to-Start', description: 'Successor starts when predecessor starts' },
  { value: 'FF', label: 'Finish-to-Finish', description: 'Successor finishes when predecessor finishes' },
  { value: 'SF', label: 'Start-to-Finish', description: 'Successor finishes when predecessor starts' },
];

export default function DependencyManager({ objective, allObjectives, onClose, onUpdate }) {
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDependency, setNewDependency] = useState({
    relatedObjectiveId: '',
    type: 'FS',
    direction: 'blocks', // 'blocks' = this objective is predecessor, 'depends' = this objective is successor
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDependencies();
  }, [objective.id]);

  const fetchDependencies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies/objective/${objective.id}`);
      if (response.ok) {
        const data = await response.json();
        setDependencies(data);
      }
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependency = async () => {
    if (!newDependency.relatedObjectiveId) {
      setError('Please select an objective');
      return;
    }

    setError('');
    
    try {
      const predecessorId = newDependency.direction === 'blocks' ? objective.id : newDependency.relatedObjectiveId;
      const successorId = newDependency.direction === 'blocks' ? newDependency.relatedObjectiveId : objective.id;

      const response = await fetch(`${API_BASE_URL}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predecessorId,
          successorId,
          type: newDependency.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create dependency');
        return;
      }

      await fetchDependencies();
      setIsAdding(false);
      setNewDependency({
        relatedObjectiveId: '',
        type: 'FS',
        direction: 'blocks',
      });
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error creating dependency:', error);
      setError('Failed to create dependency');
    }
  };

  const handleDeleteDependency = async (dependencyId) => {
    if (!window.confirm('Are you sure you want to remove this dependency?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDependencies();
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Error deleting dependency:', error);
    }
  };

  const getDependencyTypeLabel = (type) => {
    return DEPENDENCY_TYPES.find(t => t.value === type)?.label || type;
  };

  // Filter out current objective and objectives already in dependencies
  const availableObjectives = allObjectives.filter(obj => {
    if (obj.id === objective.id) return false;
    
    // Check if already has dependency
    const alreadyLinked = dependencies.some(dep => 
      dep.predecessorId === obj.id || dep.successorId === obj.id
    );
    
    return !alreadyLinked;
  });

  const predecessorDeps = dependencies.filter(dep => dep.successorId === objective.id);
  const successorDeps = dependencies.filter(dep => dep.predecessorId === objective.id);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3>Dependencies for</h3>
            <p className={styles.objectiveTitle}>{objective.title}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>Loading dependencies...</div>
          ) : (
            <>
              {/* Predecessors - Objectives this one depends on */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <AlertTriangle size={16} />
                  Depends On (Predecessors)
                </h4>
                {predecessorDeps.length === 0 ? (
                  <p className={styles.emptyText}>No dependencies. This objective can be started any time.</p>
                ) : (
                  <div className={styles.dependencyList}>
                    {predecessorDeps.map(dep => (
                      <div key={dep.id} className={styles.dependencyItem}>
                        <div className={styles.dependencyInfo}>
                          <span className={styles.dependencyTitle}>{dep.predecessor.title}</span>
                          <span className={styles.dependencyType}>{getDependencyTypeLabel(dep.type)}</span>
                          {dep.predecessor.projectId !== objective.projectId && (
                            <span className={styles.crossProjectBadge}>Cross-project</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDependency(dep.id)}
                          className={styles.deleteButton}
                          title="Remove dependency"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Successors - Objectives that depend on this one */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <Link2 size={16} />
                  Blocks (Successors)
                </h4>
                {successorDeps.length === 0 ? (
                  <p className={styles.emptyText}>No objectives are blocked by this one.</p>
                ) : (
                  <div className={styles.dependencyList}>
                    {successorDeps.map(dep => (
                      <div key={dep.id} className={styles.dependencyItem}>
                        <div className={styles.dependencyInfo}>
                          <span className={styles.dependencyTitle}>{dep.successor.title}</span>
                          <span className={styles.dependencyType}>{getDependencyTypeLabel(dep.type)}</span>
                          {dep.successor.projectId !== objective.projectId && (
                            <span className={styles.crossProjectBadge}>Cross-project</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDependency(dep.id)}
                          className={styles.deleteButton}
                          title="Remove dependency"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Dependency */}
              {!isAdding && availableObjectives.length > 0 && (
                <button
                  onClick={() => setIsAdding(true)}
                  className={styles.addButton}
                >
                  <Plus size={16} />
                  Add Dependency
                </button>
              )}

              {isAdding && (
                <div className={styles.addForm}>
                  <h4>Add New Dependency</h4>
                  
                  {error && (
                    <div className={styles.error}>
                      <AlertTriangle size={14} />
                      {error}
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>Direction</label>
                    <select
                      value={newDependency.direction}
                      onChange={(e) => setNewDependency({ ...newDependency, direction: e.target.value })}
                      className={styles.select}
                    >
                      <option value="depends">This objective depends on...</option>
                      <option value="blocks">This objective blocks...</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Objective</label>
                    <select
                      value={newDependency.relatedObjectiveId}
                      onChange={(e) => setNewDependency({ ...newDependency, relatedObjectiveId: e.target.value })}
                      className={styles.select}
                    >
                      <option value="">Select objective...</option>
                      {availableObjectives.map(obj => (
                        <option key={obj.id} value={obj.id}>
                          {obj.title} {obj.projectId !== objective.projectId ? '(other project)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dependency Type</label>
                    <select
                      value={newDependency.type}
                      onChange={(e) => setNewDependency({ ...newDependency, type: e.target.value })}
                      className={styles.select}
                    >
                      {DEPENDENCY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <span className={styles.typeDescription}>
                      {DEPENDENCY_TYPES.find(t => t.value === newDependency.type)?.description}
                    </span>
                  </div>

                  <div className={styles.formActions}>
                    <Button variant="secondary" onClick={() => {
                      setIsAdding(false);
                      setError('');
                    }}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddDependency}>
                      Add Dependency
                    </Button>
                  </div>
                </div>
              )}

              {availableObjectives.length === 0 && !isAdding && (
                <p className={styles.emptyText}>No more objectives available to link.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

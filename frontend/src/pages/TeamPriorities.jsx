import React, { useState, useMemo, useEffect } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { PageHeader } from '../components/layout/Layout';
import { Badge } from '../components/ui';
import { Building2, GripVertical, Calendar, TrendingUp, Clock, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { API_BASE_URL } from '../config';
import styles from './TeamPriorities.module.css';

// Sortable Item Component
function SortableWorkItem({ item, team, forecast, onPriorityChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.priorityItem}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <span className={styles.itemId}>#{item.id.slice(-8)}</span>
          <span className={styles.itemTitle}>{item.title}</span>
        </div>
        <div className={styles.itemMeta}>
          <Badge variant="primary" className={styles.typeBadge}>
            {item.type}
          </Badge>
          {item.assignedOrgUnit && (
            <span className={styles.teamBadge}>
              <Building2 size={12} />
              {team ? team.name : item.assignedOrgUnit}
            </span>
          )}
          {forecast && (
            <span className={styles.forecastBadge}>
              <Calendar size={12} />
              {forecast.estimatedDate} ({forecast.leadTimeWeeks}w)
            </span>
          )}
        </div>
      </div>
      <div className={styles.priorityControls}>
        <select
          value={item.priority}
          onChange={(e) => onPriorityChange(item.id, e.target.value)}
          className={styles.prioritySelect}
        >
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </div>
    </div>
  );
}

export default function TeamPriorities() {
  const { items, updateItem, addItem, fetchWorkItems } = useWorkItemsStore();
  const { units } = useOrganizationStore();
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teamLoad, setTeamLoad] = useState(null);
  const [forecasts, setForecasts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch work items on mount
  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  // Fetch team load and forecasts when team selected
  useEffect(() => {
    if (selectedTeam !== 'all') {
      fetchTeamData(selectedTeam);
    } else {
      setTeamLoad(null);
      setForecasts({});
    }
  }, [selectedTeam, items]);

  // Fetch team load and forecast data
  const fetchTeamData = async (teamId) => {
    setLoading(true);
    try {
      // Fetch team load
      const loadRes = await fetch(`${API_BASE_URL}/forecasts/load/${teamId}`);
      if (loadRes.ok) {
        const loadData = await loadRes.json();
        setTeamLoad(loadData);
      }

      // Fetch backlog forecasts
      const forecastRes = await fetch(`${API_BASE_URL}/forecasts/backlog/${teamId}`);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const forecastMap = {};
        forecastData.forecasts.forEach(f => {
          forecastMap[f.workItemId] = f;
        });
        setForecasts(forecastMap);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use org units for team selector
  const allTeams = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name, isFlat: false })),
  ], [units]);

  // Filter items based on selected team
  const filteredItems = useMemo(() => {
    if (selectedTeam === 'all') {
      return items.filter(item => item.status !== 'Done'); // Hide completed items
    }
    return items.filter(item => 
      item.assignedOrgUnit === selectedTeam && item.status !== 'Done'
    );
  }, [items, selectedTeam]);

  // Group items by priority with stack ranking
  const p1Items = useMemo(() => 
    filteredItems
      .filter(item => item.priority === 'P1')
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0)),
    [filteredItems]
  );

  const p2Items = useMemo(() => 
    filteredItems
      .filter(item => item.priority === 'P2')
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0)),
    [filteredItems]
  );

  const p3Items = useMemo(() => 
    filteredItems
      .filter(item => item.priority === 'P3')
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0)),
    [filteredItems]
  );

  const handlePriorityChange = (itemId, newPriority) => {
    updateItem(itemId, { priority: newPriority });
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;

    // Determine which priority bucket the item was dropped on
    const overId = over.id;
    let targetPriority = activeItem.priority;
    let targetItems = [];

    // Check if dropped on another item
    const overItem = items.find(item => item.id === overId);
    if (overItem) {
      targetPriority = overItem.priority;
      targetItems = items.filter(item => item.priority === targetPriority)
        .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0));
    } else {
      // Dropped on a droppable zone (bucket)
      targetPriority = overId; // overId is 'P1', 'P2', or 'P3'
      targetItems = items.filter(item => item.priority === targetPriority)
        .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0));
    }

    // If priority changed, update it
    if (activeItem.priority !== targetPriority) {
      // Only update the moved item with new priority and position
      await updateItem(active.id, { priority: targetPriority, stackRank: targetItems.length });
    } else if (active.id !== overId && overItem) {
      // Reordering within same priority
      const oldIndex = targetItems.findIndex(item => item.id === active.id);
      const newIndex = targetItems.findIndex(item => item.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(targetItems, oldIndex, newIndex);
        // Only update items whose stackRank actually changed
        const updates = reorderedItems
          .filter((item, index) => item.stackRank !== index)
          .map((item, index) => updateItem(item.id, { stackRank: reorderedItems.indexOf(item) }));
        
        if (updates.length > 0) {
          await Promise.all(updates);
        }
      }
    }

    // Refresh forecasts after all updates complete
    if (selectedTeam !== 'all') {
      await fetchTeamData(selectedTeam);
    }
  };

  const handleAddItem = async (formData) => {
    try {
      await addItem({
        title: formData.title,
        description: formData.description || '',
        type: formData.type || 'Story',
        priority: formData.priority || 'P3',
        status: 'Backlog',
        assignedOrgUnit: formData.teamId || selectedTeam !== 'all' ? selectedTeam : null,
      });
      setShowAddModal(false);

      // Refresh forecasts after adding item
      if (selectedTeam !== 'all') {
        await fetchTeamData(selectedTeam);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const PriorityBucket = ({ priority, title, description, items, color }) => {
    const itemIds = items.map(item => item.id);
    
    return (
      <div className={styles.bucket}>
        <div className={styles.bucketHeader} style={{ borderLeftColor: color }}>
          <div>
            <h3 className={styles.bucketTitle}>{title}</h3>
            <p className={styles.bucketDescription}>{description}</p>
          </div>
          <Badge variant={priority === 'P1' ? 'danger' : priority === 'P2' ? 'warning' : 'secondary'}>
            {items.length} items
          </Badge>
        </div>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div 
            className={styles.bucketBody}
            data-priority={priority}
          >
            {items.length === 0 ? (
              <div className={styles.emptyBucket}>
                Drop items here or no items in this priority
              </div>
            ) : (
              items.map((item) => {
                const team = allTeams.find(t => t.id === item.assignedOrgUnit);
                const forecast = forecasts[item.id];
                return (
                  <SortableWorkItem
                    key={item.id}
                    item={item}
                    team={team}
                    forecast={forecast}
                    onPriorityChange={handlePriorityChange}
                  />
                );
              })
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Team Priorities"
        subtitle="Stack rank work items and forecast completion dates"
      />

      <div className={styles.container}>
        {/* Team Selector and Add Button */}
        <div className={styles.teamSelector}>
          <label className={styles.teamLabel}>
            <Building2 size={18} />
            Team View:
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={styles.teamSelect}
          >
            <option value="all">All Teams (Organization View)</option>
            <optgroup label="Teams">
              {units.filter(u => u.tier === 3).map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </optgroup>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className={styles.addButton}
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        {/* Team Load Dashboard */}
        {teamLoad && selectedTeam !== 'all' && (
          <div className={styles.loadDashboard}>
            <h3 className={styles.dashboardTitle}>
              <TrendingUp size={20} />
              Team Capacity & Forecast
            </h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>Throughput</div>
                <div className={styles.metricValue}>
                  {teamLoad.throughput} <span className={styles.metricUnit}>items/week</span>
                </div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>P1 Load</div>
                <div className={styles.metricValue}>
                  {teamLoad.p1LoadWeeks} <span className={styles.metricUnit}>weeks</span>
                </div>
                <div className={styles.metricSubtext}>{teamLoad.queue.p1} items</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>P1 + P2 Load</div>
                <div className={styles.metricValue}>
                  {teamLoad.p2LoadWeeks} <span className={styles.metricUnit}>weeks</span>
                </div>
                <div className={styles.metricSubtext}>{teamLoad.queue.p1 + teamLoad.queue.p2} items</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricLabel}>Total Queue</div>
                <div className={styles.metricValue}>
                  {teamLoad.totalLoadWeeks} <span className={styles.metricUnit}>weeks</span>
                </div>
                <div className={styles.metricSubtext}>{teamLoad.queue.total} items</div>
              </div>
              <div className={`${styles.metric} ${styles.metricStatus}`}>
                <div className={styles.metricLabel}>Queue Health</div>
                <div className={styles.metricValue}>
                  <Badge variant={
                    teamLoad.status === 'healthy' ? 'success' :
                    teamLoad.status === 'busy' ? 'warning' : 'danger'
                  }>
                    {teamLoad.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Priority Buckets */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.bucketsGrid}>
            <PriorityBucket
              priority="P1"
              title="P1 - Must Do"
              description="Critical items that must be completed"
              items={p1Items}
              color="#dc2626"
            />
            <PriorityBucket
              priority="P2"
              title="P2 - Next Up"
              description="Important items to tackle next"
              items={p2Items}
              color="#f59e0b"
            />
            <PriorityBucket
              priority="P3"
              title="P3 - When Capacity Allows"
              description="Nice-to-have items for when time permits"
              items={p3Items}
              color="#6b7280"
            />
          </div>
          <DragOverlay>
            {activeId ? (
              <div className={styles.dragOverlay}>
                {items.find(item => item.id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
          teams={allTeams}
          defaultTeam={selectedTeam !== 'all' ? selectedTeam : null}
        />
      )}
    </div>
  );
}

// Add Item Modal Component
function AddItemModal({ onClose, onSubmit, teams, defaultTeam }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Story',
    priority: 'P3',
    teamId: defaultTeam || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Work Item</h2>
          <button onClick={onClose} className={styles.modalClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter work item title"
              required
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Story">Story</option>
                <option value="Bug">Bug</option>
                <option value="Task">Task</option>
                <option value="Epic">Epic</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="P1">P1 - Must Do</option>
                <option value="P2">P2 - Next Up</option>
                <option value="P3">P3 - When Capacity Allows</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="team">Assigned Team</label>
              <select
                id="team"
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {teams.filter(t => t.id).map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { PageHeader } from '../components/layout/Layout';
import { Badge } from '../components/ui';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Circle, 
  PlayCircle, 
  AlertCircle, 
  CheckCircle2,
  GripVertical,
  Clock
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import styles from './BoardsPage.module.css';

const COLUMNS = [
  { id: 'To-Do', title: 'To-Do', icon: Circle, color: '#64748b' },
  { id: 'Doing', title: 'Doing', icon: PlayCircle, color: '#3b82f6' },
  { id: 'Blocked', title: 'Blocked', icon: AlertCircle, color: '#f59e0b' },
  { id: 'Done', title: 'Done', icon: CheckCircle2, color: '#10b981' },
];

function SortableWorkItem({ item, teamName }) {
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

  const priorityColors = {
    1: '#ef4444',
    2: '#f59e0b',
    3: '#3b82f6',
    'P1': '#ef4444',
    'P2': '#f59e0b',
    'P3': '#3b82f6',
  };

  // Extract priority number from string like "P1" or just use number
  const priorityNum = typeof item.priority === 'string' ? item.priority.replace('P', '') : item.priority;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.workItem}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <span className={styles.itemTitle}>{item.title}</span>
          <Badge 
            color={priorityColors[item.priority]} 
            size="sm"
          >
            P{priorityNum}
          </Badge>
        </div>
        {item.description && (
          <p className={styles.itemDescription}>{item.description}</p>
        )}
        <div className={styles.itemFooter}>
          <span className={styles.teamName}>{teamName}</span>
          {item.estimatedDate && (
            <span className={styles.estimate}>
              <Clock size={14} />
              {new Date(item.estimatedDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({ column, items, teamName }) {
  const Icon = column.icon;

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader} style={{ borderColor: column.color }}>
        <Icon size={20} color={column.color} />
        <h3>{column.title}</h3>
        <Badge color={column.color} size="sm">{items.length}</Badge>
      </div>
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.columnContent}>
          {items.length === 0 ? (
            <div className={styles.emptyColumn}>
              <p>No items</p>
            </div>
          ) : (
            items.map(item => (
              <SortableWorkItem 
                key={item.id} 
                item={item} 
                teamName={teamName}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function BoardsPage() {
  const { units, fetchUnits } = useOrganizationStore();
  const { items: workItems, fetchWorkItems, updateWorkItem } = useWorkItemsStore();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [teamForecasts, setTeamForecasts] = useState({});
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get all tier 3 teams
  const teams = units.filter(u => u.tier === 3);

  useEffect(() => {
    const loadData = async () => {
      await fetchUnits();
      await fetchWorkItems();
      console.log('BoardsPage: Work items loaded:', workItems?.length);
      setLoading(false);
    };
    loadData();
  }, [fetchUnits, fetchWorkItems]);

  useEffect(() => {
    // Set default team to first team
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    // Fetch forecasts when team changes
    if (selectedTeamId) {
      fetchTeamForecasts(selectedTeamId);
    }
  }, [selectedTeamId]);

  const fetchTeamForecasts = async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forecasts/backlog/${teamId}`);
      if (response.ok) {
        const data = await response.json();
        const forecastMap = {};
        data.forecasts?.forEach(forecast => {
          forecastMap[forecast.workItemId] = forecast;
        });
        setTeamForecasts(forecastMap);
      }
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    }
  };

  // Filter work items by selected team
  const teamWorkItems = (workItems || []).filter(item => item.assignedOrgUnit === selectedTeamId);
  console.log('BoardsPage: Selected team:', selectedTeamId, 'Team items:', teamWorkItems.length);

  // Get team name
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamName = selectedTeam?.name || 'Select a team';

  // Organize items by status
  const todoItems = teamWorkItems.filter(item => {
    const isBacklog = item.status === 'Backlog' || item.status === 'Ready';
    const isP1 = item.priority === 1 || item.priority === 'P1';
    return isBacklog && isP1;
  });
  console.log('BoardsPage: P1 backlog items for team:', todoItems.length, todoItems.slice(0, 2));

  const itemsByStatus = {
    'To-Do': todoItems
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0))
      .map(item => ({
        ...item,
        estimatedDate: teamForecasts[item.id]?.estimatedDate
      })),
    'Doing': teamWorkItems
      .filter(item => item.status === 'In Progress' || item.status === 'Doing')
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0)),
    'Blocked': teamWorkItems
      .filter(item => item.status === 'Blocked')
      .sort((a, b) => (a.stackRank || 0) - (b.stackRank || 0)),
    'Done': teamWorkItems
      .filter(item => item.status === 'Done')
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || a.updatedAt);
        const dateB = new Date(b.completedAt || b.updatedAt);
        return dateB - dateA; // Most recent first
      })
      .slice(0, 20), // Limit Done column to 20 most recent
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeItem = teamWorkItems.find(item => item.id === active.id);
    if (!activeItem) {
      setActiveId(null);
      return;
    }

    // Determine which column the item was dropped in
    let newStatus = activeItem.status;
    for (const column of COLUMNS) {
      const columnItems = itemsByStatus[column.id];
      if (columnItems.some(item => item.id === over.id) || over.id === column.id) {
        // Map column ID to work item status
        if (column.id === 'To-Do') {
          newStatus = 'Backlog';
        } else if (column.id === 'Doing') {
          newStatus = 'In Progress';
        } else {
          newStatus = column.id;
        }
        break;
      }
    }

    // Update item status if it changed
    if (newStatus !== activeItem.status) {
      const updates = { status: newStatus };
      
      // If moving to Done, set completedAt
      if (newStatus === 'Done' && !activeItem.completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      
      // If moving out of Done, clear completedAt
      if (activeItem.status === 'Done' && newStatus !== 'Done') {
        updates.completedAt = null;
      }

      await updateWorkItem(activeItem.id, updates);
      
      // Refresh forecasts since completion affects throughput
      if (newStatus === 'Done' || activeItem.status === 'Done') {
        fetchTeamForecasts(selectedTeamId);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId ? teamWorkItems.find(item => item.id === activeId) : null;

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Boards"
          subtitle="Kanban board for team work items"
        />
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Boards"
        subtitle="Kanban board for team work items"
      />

      <div className={styles.controls}>
        <div className={styles.teamSelector}>
          <label htmlFor="team-select">Team:</label>
          <select
            id="team-select"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className={styles.select}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>To-Do:</strong> {itemsByStatus['To-Do'].length} P1 items
          </span>
          <span className={styles.stat}>
            <strong>In Progress:</strong> {itemsByStatus['Doing'].length + itemsByStatus['Blocked'].length}
          </span>
          <span className={styles.stat}>
            <strong>Completed:</strong> {(workItems || []).filter(i => i.assignedOrgUnit === selectedTeamId && i.status === 'Done').length}
          </span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={styles.board}>
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              column={column}
              items={itemsByStatus[column.id]}
              teamName={teamName}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className={styles.workItem} style={{ opacity: 0.8 }}>
              <div className={styles.dragHandle}>
                <GripVertical size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{activeItem.title}</span>
                  <Badge color="#3b82f6" size="sm">
                    P{activeItem.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

import { create } from 'zustand';
import { API_BASE_URL } from '../config';

export const useWorkItemsStore = create((set, get) => ({
  items: [],
  expandedItems: new Set(['1', '2']), // Track expanded state

  // Fetch work items from backend
  fetchWorkItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/work-items`);
      if (!response.ok) throw new Error('Failed to fetch work items');
      const workItems = await response.json();
      
      // Transform backend work items to match the expected format
      const transformedItems = workItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type || 'Story',
        priority: item.priority || 'P3',
        stackRank: item.stackRank || 0,
        status: item.status || 'Backlog',
        assignedOrgUnit: item.assignedOrgUnit,
        estimatedEffort: item.estimatedEffort,
        createdBy: item.createdBy,
        refinementSessionId: item.refinementSessionId,
        projectId: item.refinementSession?.project?.id,
        objectiveTitle: item.refinementSession?.objective?.title,
        parentId: null, // Work items from refinements don't have parent hierarchy
        order: 0,
        acceptanceCriteria: [],
        completedAt: item.completedAt,
      }));
      
      set({ items: transformedItems });
    } catch (error) {
      console.error('Error fetching work items:', error);
    }
  },

  // Add new work item (local only - for demo purposes)
  addItem: (item) => set((state) => {
    const id = String(Date.now());
    const parentId = item.parentId ?? null;
    const order = state.items.filter(i => i.parentId === parentId).length;
    return {
      items: [...state.items, { 
        ...item, 
        id, 
        parentId, 
        order, 
        description: item.description || '', 
        acceptanceCriteria: item.acceptanceCriteria || [],
        priority: item.priority || 'P3',
        projectId: item.projectId || null,
        assignedOrgUnit: item.teamId || item.assignedOrgUnit || null, // Map teamId to assignedOrgUnit
      }],
    };
  }),

  // Update work item
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ),
  })),

  // Delete work item
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id && item.parentId !== id),
  })),

  // Toggle expanded state
  toggleExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    return { expandedItems: newExpanded };
  }),

  // Get children of a work item
  getChildren: (parentId) => {
    return get().items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  },

  // Get root items (no parent)
  getRootItems: () => {
    return get().items
      .filter(item => item.parentId === null)
      .sort((a, b) => a.order - b.order);
  },

  // Get items by team (organizational unit)
  getItemsByTeam: (orgUnitId) => {
    return get().items.filter(item => item.assignedOrgUnit === orgUnitId);
  },

  // Get items by team and priority
  getItemsByTeamAndPriority: (orgUnitId, priority) => {
    return get().items
      .filter(item => item.assignedOrgUnit === orgUnitId && item.priority === priority)
      .sort((a, b) => a.order - b.order);
  },

  // Get all items for a priority bucket (across all teams)
  getItemsByPriority: (priority) => {
    return get().items
      .filter(item => item.priority === priority)
      .sort((a, b) => a.order - b.order);
  },
}));

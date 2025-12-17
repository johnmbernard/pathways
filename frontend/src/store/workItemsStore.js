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
        objectiveId: item.refinementSession?.objective?.id,
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

  // Add new work item (persists to backend)
  addItem: async (item) => {
    try {
      const response = await fetch(`${API_BASE_URL}/work-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.description || '',
          type: item.type || 'Story',
          priority: item.priority || 'P3',
          status: item.status || 'Backlog',
          assignedOrgUnit: item.teamId || item.assignedOrgUnit || null,
          estimatedEffort: item.estimatedEffort || null,
          // Don't send createdBy - let backend use default user
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create work item');
      }

      const createdItem = await response.json();

      // Transform and add to local state
      const transformedItem = {
        id: createdItem.id,
        title: createdItem.title,
        description: createdItem.description || '',
        type: createdItem.type || 'Story',
        priority: createdItem.priority || 'P3',
        stackRank: createdItem.stackRank || 0,
        status: createdItem.status || 'Backlog',
        assignedOrgUnit: createdItem.assignedOrgUnit,
        estimatedEffort: createdItem.estimatedEffort,
        createdBy: createdItem.createdBy,
        refinementSessionId: createdItem.refinementSessionId,
        projectId: createdItem.refinementSession?.project?.id,
        objectiveTitle: createdItem.refinementSession?.objective?.title,
        parentId: null,
        order: 0,
        acceptanceCriteria: [],
        completedAt: createdItem.completedAt,
      };

      set((state) => ({
        items: [...state.items, transformedItem],
      }));

      return transformedItem;
    } catch (error) {
      console.error('Error adding work item:', error);
      throw error;
    }
  },

  // Update work item (persists to backend)
  updateItem: async (id, updates) => {
    // Optimistically update local state first
    set((state) => ({
      items: state.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    }));

    // Persist to backend
    try {
      const response = await fetch(`${API_BASE_URL}/work-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        console.error('Failed to update work item on server');
        // Could revert optimistic update here if needed
      }
    } catch (error) {
      console.error('Error updating work item:', error);
    }
  },

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

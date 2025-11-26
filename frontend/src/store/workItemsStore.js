import { create } from 'zustand';

// Work item store with hierarchical structure
export const useWorkItemsStore = create((set, get) => ({
  items: [
    {
      id: '1',
      title: 'Example Epic',
      state: 'New',
      type: 'Epic',
      parentId: null,
      order: 0,
    },
    {
      id: '2',
      title: 'Feature 1',
      state: 'New',
      type: 'Feature',
      parentId: '1',
      order: 0,
    },
    {
      id: '3',
      title: 'User Story A',
      state: 'Committed',
      type: 'User Story',
      parentId: '2',
      order: 0,
    },
  ],
  expandedItems: new Set(['1', '2']), // Track expanded state

  // Add new work item
  addItem: (item) => set((state) => ({
    items: [...state.items, {
      ...item,
      id: `${Date.now()}`,
      order: state.items.filter(i => i.parentId === item.parentId).length,
    }],
  })),

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
}));

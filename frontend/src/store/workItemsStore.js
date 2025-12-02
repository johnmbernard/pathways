import { create } from 'zustand';

const STORAGE_KEY = 'pathways_work_items_v1';
const IDS_MIGRATED_KEY = 'pathways_work_items_ids_normalized_v1';

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: '1', title: 'Example Epic', state: 'New', type: 'Epic', parentId: null, order: 0, assignedOrgUnit: null, startDate: '', targetDate: '', description: '', acceptanceCriteria: [], priority: 'P2', projectId: 'proj-1' },
    { id: '2', title: 'Feature 1', state: 'New', type: 'Feature', parentId: '1', order: 0, assignedOrgUnit: null, startDate: '', targetDate: '', description: '', acceptanceCriteria: [], priority: 'P1', projectId: 'proj-1' },
    { id: '3', title: 'User Story A', state: 'Committed', type: 'User Story', parentId: '2', order: 0, assignedOrgUnit: null, startDate: '', targetDate: '', description: '', acceptanceCriteria: [], priority: 'P3', projectId: 'proj-1' },
  ];
}

function maybeNormalizeIds(items) {
  try {
    if (localStorage.getItem(IDS_MIGRATED_KEY) === '1') {
      return { items, nextId: computeNextId(items) };
    }
  } catch {}

  const needsMigration = items.some(it => !/^\d+$/.test(String(it.id)) || parseInt(it.id, 10) > 1000000);
  if (!needsMigration) return { items, nextId: computeNextId(items) };

  const mapping = new Map();
  const newItems = items.map((it, idx) => {
    const newId = String(idx + 1);
    mapping.set(String(it.id), newId);
    return { ...it, id: newId };
  });

  const remapped = newItems.map(it => {
    const pid = it.parentId != null ? mapping.get(String(it.parentId)) ?? null : null;
    return { ...it, parentId: pid };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remapped));
    localStorage.setItem(IDS_MIGRATED_KEY, '1');
  } catch {}

  return { items: remapped, nextId: remapped.length + 1 };
}

// Work item store with hierarchical structure
function computeNextId(items) {
  const nums = items
    .map(i => parseInt(i.id, 10))
    .filter(n => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return max + 1;
}

const initialLoad = loadItems();
const normalized = maybeNormalizeIds(initialLoad);

export const useWorkItemsStore = create((set, get) => ({
  items: normalized.items,
  nextId: normalized.nextId,
  expandedItems: new Set(['1', '2']), // Track expanded state

  // Add new work item
  addItem: (item) => set((state) => {
    const id = String(state.nextId);
    const parentId = item.parentId ?? null; // default to root if not provided
    const order = state.items.filter(i => i.parentId === parentId).length;
    return {
      items: [...state.items, { 
        ...item, 
        id, 
        parentId, 
        order, 
        description: item.description || '', 
        acceptanceCriteria: item.acceptanceCriteria || [],
        priority: item.priority || 'P3', // default to P3 if not specified
        projectId: item.projectId || null, // link to project if specified
      }],
      nextId: state.nextId + 1,
    };
  }),

  // Update work item
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ),
  })),

  // Bulk rename types and normalize to valid types list
  bulkRenameTypes: (mapping, validTypes) => set((state) => ({
    items: state.items.map(item => {
      let type = item.type;
      if (mapping && mapping[type]) {
        type = mapping[type];
      }
      if (Array.isArray(validTypes) && validTypes.length > 0 && !validTypes.includes(type)) {
        type = validTypes[0];
      }
      return { ...item, type };
    })
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

// Persist items on any change
useWorkItemsStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch {}
});

import { create } from 'zustand';

const STORAGE_KEY = 'pathways_organization_config_v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        units: data.units || [],
        flatUnits: data.flatUnits || [],
        nextId: data.nextId || 1,
        nextFlatId: data.nextFlatId || 1,
        expandedUnits: new Set(data.expandedUnits || []),
      };
    }
  } catch {}
  return {
    units: [
      { id: 'org-1', name: 'Synapse Solutions LLC', parentId: null, order: 0 },
      { id: 'org-2', name: 'Engineering', parentId: 'org-1', order: 0 },
      { id: 'org-3', name: 'Marketing', parentId: 'org-1', order: 1 },
      { id: 'org-4', name: 'Sales', parentId: 'org-1', order: 2 },
    ],
    flatUnits: [
      { id: 'flat-1', name: 'Contractors' },
      { id: 'flat-2', name: 'Consultants' },
    ],
    nextId: 5,
    nextFlatId: 3,
    expandedUnits: new Set(['org-1']),
  };
}

export const useOrganizationStore = create((set, get) => ({
  ...loadInitial(),

  // Add new organization unit
  addUnit: (unit) => set((state) => {
    const id = `org-${state.nextId}`;
    const parentId = unit.parentId ?? null;
    const order = state.units.filter(u => u.parentId === parentId).length;
    return {
      units: [...state.units, { ...unit, id, parentId, order }],
      nextId: state.nextId + 1,
    };
  }),

  // Update organization unit
  updateUnit: (id, updates) => set((state) => ({
    units: state.units.map(u => (u.id === id ? { ...u, ...updates } : u)),
  })),

  // Delete organization unit (and all children)
  deleteUnit: (id) => set((state) => {
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      state.units.forEach(u => {
        if (u.parentId && toDelete.has(u.parentId) && !toDelete.has(u.id)) {
          toDelete.add(u.id);
          changed = true;
        }
      });
    }
    return {
      units: state.units.filter(u => !toDelete.has(u.id)),
    };
  }),

  // Toggle expanded state
  toggleExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedUnits);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    return { expandedUnits: newExpanded };
  }),

  // Get children of a unit
  getChildren: (parentId) => {
    return get().units
      .filter(u => u.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  },

  // Get root units (no parent)
  getRootUnits: () => {
    return get().units
      .filter(u => u.parentId === null)
      .sort((a, b) => a.order - b.order);
  },

  // Get tier level for a unit (based on depth in tree)
  getTierLevel: (unitId) => {
    const state = get();
    let level = 1;
    let currentId = unitId;
    
    while (currentId) {
      const unit = state.units.find(u => u.id === currentId);
      if (!unit || !unit.parentId) break;
      currentId = unit.parentId;
      level++;
    }
    
    return level;
  },

  // Get all units at a specific tier level
  getUnitsByTier: (tierLevel) => {
    const state = get();
    return state.units.filter(u => state.getTierLevel(u.id) === tierLevel);
  },

  // CRUD for flat units
  addFlatUnit: (name) => set((state) => ({
    flatUnits: [...state.flatUnits, { id: `flat-${state.nextFlatId}`, name }],
    nextFlatId: state.nextFlatId + 1,
  })),
  updateFlatUnit: (id, name) => set((state) => ({
    flatUnits: state.flatUnits.map(u => (u.id === id ? { ...u, name } : u)),
  })),
  deleteFlatUnit: (id) => set((state) => ({
    flatUnits: state.flatUnits.filter(u => u.id !== id),
  })),
}));

// Persist to localStorage on any change
useOrganizationStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      units: state.units,
      flatUnits: state.flatUnits,
      nextId: state.nextId,
      nextFlatId: state.nextFlatId,
      expandedUnits: Array.from(state.expandedUnits),
    }));
  } catch {}
});

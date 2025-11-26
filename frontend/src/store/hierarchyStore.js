import { create } from 'zustand';

const STORAGE_KEY = 'pathways_hierarchy_config_v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    tiers: [
      { id: 'tier-epic', name: 'Epic' },
      { id: 'tier-feature', name: 'Feature' },
      { id: 'tier-story', name: 'User Story' },
    ],
    flatTypes: [
      { id: 'type-bug', name: 'Bug' },
    ],
  };
}

// Store for configuring hierarchy tiers and flat types
export const useHierarchyStore = create((set, get) => ({
  ...loadInitial(),

  // CRUD for tiers
  addTier: (name) => set((state) => ({
    tiers: [...state.tiers, { id: `tier-${Date.now()}`, name }],
  })),
  updateTier: (id, name) => set((state) => ({
    tiers: state.tiers.map(t => (t.id === id ? { ...t, name } : t)),
  })),
  removeTier: (id) => set((state) => ({
    tiers: state.tiers.filter(t => t.id !== id),
  })),
  moveTier: (fromIndex, toIndex) => set((state) => {
    const tiers = [...state.tiers];
    const [moved] = tiers.splice(fromIndex, 1);
    tiers.splice(toIndex, 0, moved);
    return { tiers };
  }),

  // CRUD for flat types
  addFlatType: (name) => set((state) => ({
    flatTypes: [...state.flatTypes, { id: `type-${Date.now()}`, name }],
  })),
  updateFlatType: (id, name) => set((state) => ({
    flatTypes: state.flatTypes.map(t => (t.id === id ? { ...t, name } : t)),
  })),
  removeFlatType: (id) => set((state) => ({
    flatTypes: state.flatTypes.filter(t => t.id !== id),
  })),
}));

// Persist to localStorage on any change
useHierarchyStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tiers: state.tiers, flatTypes: state.flatTypes }));
  } catch {}
});

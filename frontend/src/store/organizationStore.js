import { create } from 'zustand';
import { API_BASE_URL } from '../config';

// NOTE: This localStorage usage is intentional for UI state only
// It stores which organizational units are expanded/collapsed in the tree view
const STORAGE_KEY = 'pathways_organization_expanded';

function loadExpandedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set(['org-1']);
}

export const useOrganizationStore = create((set, get) => ({
  units: [],
  loading: false,
  error: null,
  expandedUnits: loadExpandedState(),

  // Fetch all organizational units from backend
  fetchUnits: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/organizational-units`);
      if (!response.ok) throw new Error('Failed to fetch organizational units');
      const units = await response.json();
      set({ units, loading: false });
    } catch (error) {
      console.error('Error fetching organizational units:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Add new organization unit
  addUnit: async (unit) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizational-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unit),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create unit');
      }
      
      const newUnit = await response.json();
      set((state) => ({
        units: [...state.units, newUnit],
      }));
      
      return newUnit;
    } catch (error) {
      console.error('Error creating organizational unit:', error);
      throw error;
    }
  },

  // Update organization unit
  updateUnit: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizational-units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update unit');
      }
      
      const updatedUnit = await response.json();
      set((state) => ({
        units: state.units.map(u => (u.id === id ? updatedUnit : u)),
      }));
      
      return updatedUnit;
    } catch (error) {
      console.error('Error updating organizational unit:', error);
      throw error;
    }
  },

  // Delete organization unit
  deleteUnit: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizational-units/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete unit');
      }
      
      set((state) => ({
        units: state.units.filter(u => u.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting organizational unit:', error);
      throw error;
    }
  },

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
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  // Get root units (no parent)
  getRootUnits: () => {
    return get().units
      .filter(u => u.parentId === null)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  // Get tier level for a unit (returns the tier from database)
  getTierLevel: (unitId) => {
    const unit = get().units.find(u => u.id === unitId);
    return unit?.tier || 1;
  },

  // Get all units at a specific tier level
  getUnitsByTier: (tierLevel) => {
    return get().units.filter(u => u.tier === tierLevel);
  },

  // Get unit by ID
  getUnitById: (id) => {
    return get().units.find(u => u.id === id);
  },
}));

// Persist expanded state to localStorage on change
useOrganizationStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.expandedUnits)));
  } catch {}
});

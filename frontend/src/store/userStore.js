import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../lib/apiClient';

export const useUserStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      // Login
      login: async (email, password) => {
        try {
          const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          set({
            currentUser: data.user,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message };
        }
      },

      // Logout
      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      // Get current user's organizational unit
      getUserUnit: () => {
        const { currentUser } = get();
        return currentUser?.organizationalUnit || null;
      },

      // Check if user can assign to a specific unit (must be direct child)
      canAssignToUnit: (targetUnitId, organizationStore) => {
        const { currentUser } = get();
        if (!currentUser?.organizationalUnit) return false;

        const userUnitId = currentUser.organizationalUnit;
        const targetUnit = organizationStore.getState().units.find(u => u.id === targetUnitId);
        
        if (!targetUnit) return false;

        // User can assign if target unit's parent is the user's unit
        return targetUnit.parentId === userUnitId;
      },

      // Get units user can assign to (direct children only)
      getAssignableUnits: (organizationStore) => {
        const { currentUser } = get();
        if (!currentUser?.organizationalUnit) return [];

        const userUnitId = currentUser.organizationalUnit;
        const allUnits = organizationStore.getState().units;
        
        // Return units where parentId matches user's unit
        return allUnits.filter(u => u.parentId === userUnitId);
      },

      // Update user profile
      updateUser: (updates) => {
        set(state => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
        }));
      },

      // Fetch current user from backend (refresh data)
      fetchCurrentUser: async () => {
        try {
          const { currentUser } = get();
          if (!currentUser?.id) return;

          const response = await apiFetch(`/users/${currentUser.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }

          const user = await response.json();
          set({ currentUser: user });
        } catch (error) {
          console.error('Fetch current user error:', error);
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);

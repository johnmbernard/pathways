import { create } from 'zustand';
import { API_BASE_URL } from '../config';

const useRefinementStore = create((set, get) => ({
  sessions: [],
  
  // Fetch all refinement sessions
  fetchSessions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements`);
      if (!response.ok) throw new Error('Failed to fetch refinement sessions');
      const sessions = await response.json();
      set({ sessions });
    } catch (error) {
      console.error('Error fetching refinement sessions:', error);
      throw error;
    }
  },
  
  // Create a new refinement session (collaborative - one per objective)
  createSession: async (projectId, objectiveId, currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          objectiveId,
          createdBy: currentUser?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create refinement session');
      const newSession = await response.json();
      
      // Only add to state if it's a new session (status 201)
      if (response.status === 201) {
        set((state) => ({
          sessions: [...state.sessions, newSession]
        }));
      }
      
      return newSession.id;
    } catch (error) {
      console.error('Error creating refinement session:', error);
      throw error;
    }
  },
  
  // Get session by ID
  getSession: (sessionId) => {
    return get().sessions.find(s => s.id === sessionId);
  },
  
  // Get sessions by project
  getSessionsByProject: (projectId) => {
    return get().sessions.filter(s => s.projectId === projectId);
  },
  
  // Get sessions by org unit - checks if unit is assigned to the objective
  getSessionsByUnit: (organizationalUnitId) => {
    return get().sessions.filter(s => {
      // Check if this unit is assigned to the objective
      if (!s.objective) return false;
      
      // Need to fetch objective assignments to check if unit is assigned
      // For now, return all sessions and let the component filter
      return true;
    });
  },
  
  // Mark unit as complete for a session
  markUnitComplete: async (sessionId, organizationalUnitId, currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/complete-unit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationalUnitId,
          completedBy: currentUser?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to mark unit complete');
      const completion = await response.json();
      
      // Refresh sessions to get updated completion status
      await get().fetchSessions();
      
      return completion;
    } catch (error) {
      console.error('Error marking unit complete:', error);
      throw error;
    }
  },
  
  // Remove unit completion (allow re-work)
  removeUnitCompletion: async (sessionId, organizationalUnitId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/complete-unit/${organizationalUnitId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove unit completion');
      
      // Refresh sessions to get updated completion status
      await get().fetchSessions();
    } catch (error) {
      console.error('Error removing unit completion:', error);
      throw error;
    }
  },
  
  // Add discussion message
  addDiscussion: async (sessionId, message, currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.text,
          authorId: currentUser?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add discussion message');
      const newMessage = await response.json();
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? { ...s, discussionMessages: [...(s.discussionMessages || []), newMessage] }
            : s
        )
      }));
    } catch (error) {
      console.error('Error adding discussion message:', error);
      throw error;
    }
  },
  
  // Add refined objective (creates real Objective and new refinement session for next tier)
  addObjective: async (sessionId, objective, currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/refined-objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: objective.title,
          description: objective.description || '',
          targetDate: objective.targetDate,
          assignedUnits: objective.assignedUnits || [],
          createdBy: currentUser?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add refined objective');
      const result = await response.json();
      
      // Result now contains { objective, session }
      // The new session will appear in the next fetchSessions call
      // Optionally add it to the local state immediately
      set((state) => ({
        sessions: [...state.sessions, result.session]
      }));
      
      return result.objective.id;
    } catch (error) {
      console.error('Error adding refined objective:', error);
      throw error;
    }
  },
  
  // Add work item (for team tier only)
  addWorkItem: async (sessionId, workItem, currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/work-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: workItem.title,
          description: workItem.description || '',
          type: workItem.type || 'Story',
          priority: workItem.priority || 'Medium',
          assignedOrgUnit: workItem.assignedOrgUnit || null,
          createdBy: currentUser?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add work item');
      const newWorkItem = await response.json();
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? { ...s, workItems: [...(s.workItems || []), newWorkItem] }
            : s
        )
      }));
      
      return newWorkItem.id;
    } catch (error) {
      console.error('Error adding work item:', error);
      throw error;
    }
  },
  
  // Update work item
  updateWorkItem: async (sessionId, workItemId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/work-items/${workItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update work item');
      const updatedWorkItem = await response.json();
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                workItems: (s.workItems || []).map(wi =>
                  wi.id === workItemId ? updatedWorkItem : wi
                )
              }
            : s
        )
      }));
    } catch (error) {
      console.error('Error updating work item:', error);
      throw error;
    }
  },
  
  // Remove work item
  removeWorkItem: async (sessionId, workItemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}/work-items/${workItemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove work item');
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                workItems: (s.workItems || []).filter(wi => wi.id !== workItemId)
              }
            : s
        )
      }));
    } catch (error) {
      console.error('Error removing work item:', error);
      throw error;
    }
  },
  
  // Update lead time analysis for objectives (local state only)
  updateLeadTimeAnalysis: (sessionId, objectiveId, analysis) => {
    set((state) => ({
      sessions: state.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              leadTimeAnalysis: {
                ...(s.leadTimeAnalysis || {}),
                [objectiveId]: analysis
              }
            }
          : s
      )
    }));
  },
  
  // Complete refinement session
  completeSession: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (!response.ok) throw new Error('Failed to complete refinement session');
      const updatedSession = await response.json();
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId ? updatedSession : s
        )
      }));
    } catch (error) {
      console.error('Error completing refinement session:', error);
      throw error;
    }
  },
  
  // Update session status
  updateSessionStatus: async (sessionId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update session status');
      const updatedSession = await response.json();
      
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId ? updatedSession : s
        )
      }));
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },
  
  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refinements/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete refinement session');
      
      set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId)
      }));
    } catch (error) {
      console.error('Error deleting refinement session:', error);
      throw error;
    }
  },
  
  // Clear all sessions (for testing)
  clearSessions: () => {
    set({ sessions: [] });
  }
}));

export default useRefinementStore;

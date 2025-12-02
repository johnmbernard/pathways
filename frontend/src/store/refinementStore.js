import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRefinementStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      
      // Create a new refinement session
      createSession: (projectId, tier, organizationalUnit, assignedObjective) => {
        const newSession = {
          id: `refinement_${projectId}_tier${tier}_${organizationalUnit}_${Date.now()}`,
          projectId,
          tier,
          organizationalUnit,
          assignedObjective,
          participants: [], // TODO: Get from auth/org context
          discussion: [],
          refinedObjectives: [],
          workItems: [], // Only for team tier
          status: 'in_progress', // not_started | in_progress | completed | escalated
          createdAt: new Date().toISOString(),
          completedAt: null,
          leadTimeAnalysis: {}
        };
        
        set((state) => ({
          sessions: [...state.sessions, newSession]
        }));
        
        return newSession.id;
      },
      
      // Get session by ID
      getSession: (sessionId) => {
        return get().sessions.find(s => s.id === sessionId);
      },
      
      // Get sessions by project
      getSessionsByProject: (projectId) => {
        return get().sessions.filter(s => s.projectId === projectId);
      },
      
      // Get sessions by org unit
      getSessionsByUnit: (organizationalUnit) => {
        return get().sessions.filter(s => s.organizationalUnit === organizationalUnit);
      },
      
      // Get sessions by tier
      getSessionsByTier: (tier) => {
        return get().sessions.filter(s => s.tier === tier);
      },
      
      // Add discussion message
      addDiscussion: (sessionId, message) => {
        const newMessage = {
          id: `disc_${Date.now()}`,
          author: message.author || 'Current User', // TODO: Get from auth
          timestamp: new Date().toISOString(),
          message: message.text,
          type: message.type || 'comment' // comment | question | answer
        };
        
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, discussion: [...s.discussion, newMessage] }
              : s
          )
        }));
      },
      
      // Add refined objective (for non-team tiers)
      addObjective: (sessionId, objective) => {
        const newObjective = {
          id: `obj_${sessionId}_${Date.now()}`,
          title: objective.title,
          description: objective.description || '',
          targetDate: objective.targetDate,
          assignedUnits: objective.assignedUnits || [],
          dependencies: objective.dependencies || [],
          risks: objective.risks || [],
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, refinedObjectives: [...s.refinedObjectives, newObjective] }
              : s
          )
        }));
        
        return newObjective.id;
      },
      
      // Update objective
      updateObjective: (sessionId, objectiveId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  refinedObjectives: s.refinedObjectives.map(obj =>
                    obj.id === objectiveId ? { ...obj, ...updates } : obj
                  )
                }
              : s
          )
        }));
      },
      
      // Remove objective
      removeObjective: (sessionId, objectiveId) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  refinedObjectives: s.refinedObjectives.filter(obj => obj.id !== objectiveId)
                }
              : s
          )
        }));
      },
      
      // Add work item (for team tier only)
      addWorkItem: (sessionId, workItem) => {
        const newWorkItem = {
          tempId: `wi_temp_${Date.now()}`,
          title: workItem.title,
          description: workItem.description || '',
          type: workItem.type || 'Story',
          priority: workItem.priority || 'P1',
          assignedTo: workItem.assignedTo || null,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, workItems: [...s.workItems, newWorkItem] }
              : s
          )
        }));
        
        return newWorkItem.tempId;
      },
      
      // Update work item
      updateWorkItem: (sessionId, tempId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  workItems: s.workItems.map(wi =>
                    wi.tempId === tempId ? { ...wi, ...updates } : wi
                  )
                }
              : s
          )
        }));
      },
      
      // Remove work item
      removeWorkItem: (sessionId, tempId) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  workItems: s.workItems.filter(wi => wi.tempId !== tempId)
                }
              : s
          )
        }));
      },
      
      // Update lead time analysis for objectives
      updateLeadTimeAnalysis: (sessionId, objectiveId, analysis) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  leadTimeAnalysis: {
                    ...s.leadTimeAnalysis,
                    [objectiveId]: analysis
                  }
                }
              : s
          )
        }));
      },
      
      // Complete refinement session
      completeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  status: 'completed',
                  completedAt: new Date().toISOString()
                }
              : s
          )
        }));
      },
      
      // Update session status
      updateSessionStatus: (sessionId, status) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, status } : s
          )
        }));
      },
      
      // Delete session
      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        }));
      },
      
      // Clear all sessions (for testing)
      clearSessions: () => {
        set({ sessions: [] });
      }
    }),
    {
      name: 'refinement-storage'
    }
  )
);

export default useRefinementStore;

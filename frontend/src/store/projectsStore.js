import { create } from 'zustand';
import { API_BASE_URL } from '../config';

export const useProjectsStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  // Fetch all projects from backend
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projects = await response.json();
      set({ projects, loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Add new project
  addProject: async (project) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }
      
      const newProject = await response.json();
      set((state) => ({
        projects: [...state.projects, newProject],
      }));
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }
      
      const updatedProject = await response.json();
      set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? updatedProject : project
        ),
      }));
      
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }
      
      set((state) => ({
        projects: state.projects.filter(project => project.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Get project by ID
  getProject: (id) => {
    return get().projects.find(p => p.id === id);
  },

  // Get projects by status
  getProjectsByStatus: (status) => {
    return get().projects.filter(p => p.status === status);
  },

  // Get projects by tier
  getProjectsByTier: (tier) => {
    return get().projects.filter(p => p.ownerTier === tier);
  },

  // Add objective to project
  addObjectiveToProject: (projectId, objective) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, objectives: [...project.objectives, { ...objective, id: `obj-${Date.now()}` }] }
        : project
    ),
  })),

  // Update objective in project
  updateObjectiveInProject: (projectId, objectiveId, updates) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            objectives: project.objectives.map(obj =>
              obj.id === objectiveId ? { ...obj, ...updates } : obj
            )
          }
        : project
    ),
  })),

  // Remove objective from project
  removeObjectiveFromProject: (projectId, objectiveId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, objectives: project.objectives.filter(obj => obj.id !== objectiveId) }
        : project
    ),
  })),

  // Mark objective as completed by a specific unit
  markObjectiveCompletedByUnit: (projectId, objectiveId, unitId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            objectives: project.objectives.map(obj =>
              obj.id === objectiveId
                ? {
                    ...obj,
                    completedByUnits: [...(obj.completedByUnits || []), unitId]
                  }
                : obj
            )
          }
        : project
    ),
  })),

  // Update calculated timeline
  updateCalculatedTimeline: (projectId, timeline) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, calculatedTimeline: timeline }
        : project
    ),
  })),

  // Add work item to project
  addWorkItemToProject: (projectId, workItemId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, workItems: [...project.workItems, workItemId] }
        : project
    ),
  })),

  // Remove work item from project
  removeWorkItemFromProject: (projectId, workItemId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, workItems: project.workItems.filter(id => id !== workItemId) }
        : project
    ),
  })),

  // Add team to project
  addTeamToProject: (projectId, teamId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId && !project.teams.includes(teamId)
        ? { ...project, teams: [...project.teams, teamId] }
        : project
    ),
  })),

  // Remove team from project
  removeTeamFromProject: (projectId, teamId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, teams: project.teams.filter(id => id !== teamId) }
        : project
    ),
  })),

}));

import { create } from 'zustand';

const STORAGE_KEY = 'pathways_projects_v1';

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'proj-1',
      title: 'Enterprise Observability Platform',
      description: 'Centralized logging, metrics, and APM across all applications',
      owner: 'VP Engineering',
      ownerUnit: 'engineering', // Org unit that created project
      ownerTier: 2, // Tier level for filtering
      status: 'In Progress',
      startDate: '2025-01-15',
      targetDate: '2025-06-30',
      budget: 500000,
      teams: ['org-2'], // Engineering team
      objectives: [], // Objectives defined for next tier
      workItems: [], // IDs of work items assigned to this project
      risks: [],
      notes: '',
      createdDate: '2024-12-01',
      calculatedTimeline: null, // Auto-calculated from lead time engine
    },
  ];
}

export const useProjectsStore = create((set, get) => ({
  projects: loadProjects(),
  nextId: 2,

  // Add new project
  addProject: (project) => set((state) => {
    const id = `proj-${state.nextId}`;
    return {
      projects: [...state.projects, {
        ...project,
        id,
        ownerUnit: project.ownerUnit || '',
        ownerTier: project.ownerTier || 1,
        objectives: project.objectives || [],
        workItems: project.workItems || [],
        teams: project.teams || [],
        risks: project.risks || [],
        calculatedTimeline: project.calculatedTimeline || null,
        createdDate: new Date().toISOString().split('T')[0],
      }],
      nextId: state.nextId + 1,
    };
  }),

  // Update project
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    ),
  })),

  // Delete project
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(project => project.id !== id),
  })),

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

  // Add risk to project
  addRisk: (projectId, risk) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, risks: [...project.risks, { ...risk, id: Date.now() }] }
        : project
    ),
  })),

  // Remove risk from project
  removeRisk: (projectId, riskId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === projectId
        ? { ...project, risks: project.risks.filter(r => r.id !== riskId) }
        : project
    ),
  })),
}));

// Persist projects on any change
useProjectsStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  } catch {}
});

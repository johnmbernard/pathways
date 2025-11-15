import { create } from "zustand";

export const useProjectStore = create((set) => ({
  // Current step (0-4 for 5 steps)
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),

  // Project data
  projectName: "",
  projectDescription: "",
  projectPurpose: "",
  targetAudience: "",
  selectedTeams: [],
  estimatedBudget: null,
  plannedStartDate: null,
  targetCompletionDate: null,

  // Scope features for foundation wizard
  scopeFeatures: [], // array of { id, title, description, acceptanceCriteria, isMVP, priority, createdAt, updatedAt }

  // Scope feature actions
  addFeature: (feature) =>
    set((state) => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const newFeature = {
        id,
        title: feature.title || "Untitled",
        description: feature.description || "",
        acceptanceCriteria: feature.acceptanceCriteria || "",
        isMVP: !!feature.isMVP,
        priority: state.scopeFeatures.length, // append to end
        estimateDays: typeof feature.estimateDays === 'number' ? feature.estimateDays : 1,
        dependencies: feature.dependencies || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { scopeFeatures: [...state.scopeFeatures, newFeature] };
    }),

  updateFeature: (id, updates) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      ),
    })),

  deleteFeature: (id) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.filter((f) => f.id !== id),
    })),

  moveFeature: (id, direction) =>
    // direction: 'up' or 'down'
    set((state) => {
      const arr = [...state.scopeFeatures];
      const idx = arr.findIndex((f) => f.id === id);
      if (idx === -1) return {};
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return {};
      const tmp = arr[swapIdx];
      arr[swapIdx] = { ...arr[idx], priority: swapIdx };
      arr[idx] = { ...tmp, priority: idx };
      return { scopeFeatures: arr };
    }),

  toggleFeatureMVP: (id) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) =>
        f.id === id ? { ...f, isMVP: !f.isMVP, updatedAt: new Date().toISOString() } : f
      ),
    })),

  setFeatureAcceptanceCriteria: (id, criteria) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) =>
        f.id === id ? { ...f, acceptanceCriteria: criteria, updatedAt: new Date().toISOString() } : f
      ),
    })),

  // Feature dependency methods for critical path
  addFeatureDependency: (featureId, targetId, type = "FS") =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) =>
        f.id === featureId
          ? {
              ...f,
              dependencies: [...(f.dependencies || []), { targetId, type }],
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    })),

  removeFeatureDependency: (featureId, targetId) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) =>
        f.id === featureId
          ? { ...f, dependencies: (f.dependencies || []).filter((d) => d.targetId !== targetId), updatedAt: new Date().toISOString() }
          : f
      ),
    })),

  setFeatureDependencies: (featureId, deps) =>
    set((state) => ({
      scopeFeatures: state.scopeFeatures.map((f) => (f.id === featureId ? { ...f, dependencies: deps, updatedAt: new Date().toISOString() } : f)),
    })),

  setScopeFeatures: (features) => set({ scopeFeatures: features }),

  // Work items for schedule (WBS / activities)
  workItems: [], // array of { id, title, featureId, parentId, description, estimateDays, startDate, endDate, assignees, dependencies, status, isMVP, createdAt, updatedAt }

  addWorkItem: (item) =>
    set((state) => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const now = new Date().toISOString();
      const newItem = {
        id,
        title: item.title || "New Work Item",
        featureId: item.featureId || null,
        parentId: item.parentId || null,
        description: item.description || "",
        estimateDays: typeof item.estimateDays === "number" ? item.estimateDays : (item.estimate || 1),
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        assignees: item.assignees || [],
        dependencies: item.dependencies || [],
        status: item.status || "backlog",
        isMVP: !!item.isMVP,
        createdAt: now,
        updatedAt: now,
      };
      return { workItems: [...state.workItems, newItem] };
    }),

  updateWorkItem: (id, updates) =>
    set((state) => ({
      workItems: state.workItems.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)),
    })),

  deleteWorkItem: (id) =>
    set((state) => ({ workItems: state.workItems.filter((w) => w.id !== id) })),

  setWorkItems: (items) => set({ workItems: items }),

  // Simple auto-scheduler: sequentially schedules given work item ids (or MVP items if none provided)
  autoScheduleSimple: (options = {}) =>
    set((state) => {
      const { anchorDate } = options;
      const anchor = anchorDate ? new Date(anchorDate) : state.plannedStartDate ? new Date(state.plannedStartDate) : new Date();
      const items = options.ids && options.ids.length > 0
        ? state.workItems.filter((w) => options.ids.includes(w.id))
        : state.workItems.filter((w) => w.isMVP);

      let cursor = new Date(anchor);
      const updated = state.workItems.map((w) => {
        if (!items.find((it) => it.id === w.id)) return w;
        const start = new Date(cursor);
        const days = Math.max(1, Math.round(w.estimateDays || 1));
        const end = new Date(start);
        end.setDate(end.getDate() + days - 1);
        // advance cursor
        cursor = new Date(end);
        cursor.setDate(cursor.getDate() + 1);
        return { ...w, startDate: start.toISOString(), endDate: end.toISOString(), status: "planned", updatedAt: new Date().toISOString() };
      });

      return { workItems: updated };
    }),

  // Setters for each field
  setProjectName: (name) => set({ projectName: name }),
  setProjectDescription: (description) => set({ projectDescription: description }),
  setProjectPurpose: (purpose) => set({ projectPurpose: purpose }),
  setTargetAudience: (audience) => set({ targetAudience: audience }),
  setSelectedTeams: (teams) => set({ selectedTeams: teams }),
  setEstimatedBudget: (budget) => set({ estimatedBudget: budget }),
  setPlannedStartDate: (date) => set({ plannedStartDate: date }),
  setTargetCompletionDate: (date) => set({ targetCompletionDate: date }),

  // Reset project
  resetProject: () =>
    set({
      currentStep: 0,
      projectName: "",
      projectDescription: "",
      projectPurpose: "",
      targetAudience: "",
      selectedTeams: [],
      estimatedBudget: null,
      plannedStartDate: null,
      targetCompletionDate: null,
    }),

  // Get full project object
  getProjectData: () => (state) => ({
    name: state.projectName,
    description: state.projectDescription,
    purpose: state.projectPurpose,
    targetAudience: state.targetAudience,
    selectedTeams: state.selectedTeams,
    budget: state.estimatedBudget,
    timeline: {
      startDate: state.plannedStartDate,
      completionDate: state.targetCompletionDate,
    },
    scope: state.scopeFeatures,
    schedule: state.workItems,
  }),
}));

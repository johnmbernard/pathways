import { create } from "zustand";

export const useOrgStore = create((set) => ({
  // Wizard step (0–3)
  step: 0,
  setStep: (step) => set({ step }),

  // Organization data
  orgName: "",
  orgBranches: [],   // array of branches/sub-branches
  orgDetails: {},    // place for future metadata

  // Setters
  setOrgName: (name) => set({ orgName: name }),

  addBranch: (branchName) =>
    set((state) => ({
      orgBranches: [
        ...state.orgBranches,
        { id: crypto.randomUUID(), name: branchName, children: [] }
      ]
    })),

  // Add sub-branch to specific parent
  addChildBranch: (parentId, name) =>
    set((state) => {    
      const addToTree = (nodes) =>
        nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [
                ...node.children,
                { id: crypto.randomUUID(), name, children: [] }
              ]
            };
          }
          return { ...node, children: addToTree(node.children) };
        });

      return { orgBranches: addToTree(state.orgBranches) };
    }),

  // Delete any branch
  deleteBranch: (branchId) =>
    set((state) => {
      const removeFromTree = (nodes) =>
        nodes
          .filter((n) => n.id !== branchId)
          .map((n) => ({ ...n, children: removeFromTree(n.children) }));

      return { orgBranches: removeFromTree(state.orgBranches) };
    }),

  // Reset entire org
  resetOrg: () =>
    set({
      step: 0,
      orgName: "",
      orgBranches: [],
      orgDetails: {}
    }),
}));


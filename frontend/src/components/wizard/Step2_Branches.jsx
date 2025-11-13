import { useState } from "react";
import { useOrgStore } from "../../store/orgStore";
import WizardShell from "../WizardShell";

export default function Step2_Branches() {
  const orgName = useOrgStore((s) => s.orgName);
  const branches = useOrgStore((s) => s.orgBranches);
  const addBranch = useOrgStore((s) => s.addBranch);
  const addChild = useOrgStore((s) => s.addChildBranch);
  const deleteBranch = useOrgStore((s) => s.deleteBranch);
  const setStep = useOrgStore((s) => s.setStep);

  const [value, setValue] = useState("");
  const [activeParent, setActiveParent] = useState(null);

  const handleAdd = () => {
    if (!value.trim()) return;

    if (activeParent) {
      addChild(activeParent, value.trim());
    } else {
      addBranch(value.trim());
    }

    setValue("");
    setActiveParent(null);
  };

  const cancel = () => {
    setValue("");
    setActiveParent(null);
  };

  // Recursive tree renderer
  const renderTree = (nodes, depth = 0) =>
    nodes.map((node) => (
      <div key={node.id} className="ml-4 mt-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-700">
            {"— ".repeat(depth)}
            {node.name}
          </span>

          <button
            className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            onClick={() => setActiveParent(node.id)}
          >
            + Add Sub-Branch
          </button>

          <button
            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
            onClick={() => deleteBranch(node.id)}
          >
            Delete
          </button>
        </div>

        {/* Render children */}
        {node.children && node.children.length > 0 && (
          <div className="ml-4">{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));

  return (
    <WizardShell>
      <div className="bg-white shadow-md rounded-xl p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Build Your Organizational Structure
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Add branches and sub-branches to form your hierarchy.
        </p>

        {/* Org name display */}
        <div className="text-gray-800 font-medium mb-4">
          <span className="text-blue-600 font-semibold">{orgName}</span>{" "}
          <span className="text-gray-400 text-sm">(Top Level)</span>
        </div>

        {/* Branch input */}
        <div className="flex gap-3 items-center mb-6">
          <input
            type="text"
            placeholder={
              activeParent ? "Enter sub-branch name..." : "Enter branch name..."
            }
            className="flex-1 px-4 py-2 border rounded-lg"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleAdd}
          >
            Add
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={cancel}
          >
            Cancel
          </button>
        </div>

        {/* Display branches */}
        <div className="mt-6">
          {branches.length === 0 ? (
            <p className="text-gray-400 italic">No branches added yet.</p>
          ) : (
            renderTree(branches)
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            className="px-5 py-2 bg-gray-200 rounded-lg"
            onClick={() => setStep(0)}
          >
            ← Back
          </button>

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setStep(2)}
          >
            Continue →
          </button>
        </div>
      </div>
    </WizardShell>
  );
}

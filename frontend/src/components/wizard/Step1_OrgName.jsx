import { useOrgStore } from "../../store/orgStore";
import { useState } from "react";
import WizardShell from "../WizardShell";

export default function Step1_OrgName() {
  const setStep = useOrgStore((s) => s.setStep);
  const setOrgName = useOrgStore((s) => s.setOrgName);

  const [value, setValue] = useState("");

  const next = () => {
    if (value.trim().length === 0) return;
    setOrgName(value.trim());
    setStep(1);
  };

  return (
    <WizardShell>
      <div className="bg-white shadow-md rounded-xl p-8">
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">
            Organization Name *
          </span>
          <input
            type="text"
            placeholder="e.g., Synapse Solutions LLC"
            className="mt-2 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>

        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-5 py-2 bg-gray-200 rounded-lg"
            onClick={() => {}}
            disabled
          >
            Back
          </button>

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={next}
          >
            Continue →
          </button>
        </div>
      </div>
    </WizardShell>
  );
}

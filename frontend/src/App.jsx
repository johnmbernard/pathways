import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Step1 from "./pages/OrganizationWizard/Step1";
import Step2 from "./pages/OrganizationWizard/Step2";
import InitiationStep1 from "./pages/InitiationWizard/Step1";
import InitiationStep2 from "./pages/InitiationWizard/Step2";
import InitiationStep3 from "./pages/InitiationWizard/Step3";
import InitiationStep4 from "./pages/InitiationWizard/Step4";
import InitiationStep5 from "./pages/InitiationWizard/Step5";
import ScopeWhiteboard from "./pages/Foundation/ScopeWhiteboard";
import MVPSelection from "./pages/Foundation/MVPSelection";
import ScheduleWizard from "./pages/Foundation/Schedule";

import "./styles/globals.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/organization/create" element={<Step1 />} />
        <Route path="/organization/create/step2" element={<Step2 />} />
        <Route path="/projects/create" element={<InitiationStep1 />} />
        <Route path="/projects/create/step2" element={<InitiationStep2 />} />
        <Route path="/projects/create/step3" element={<InitiationStep3 />} />
        <Route path="/projects/create/step4" element={<InitiationStep4 />} />
        <Route path="/projects/create/step5" element={<InitiationStep5 />} />
        <Route path="/projects/foundation/scope" element={<ScopeWhiteboard />} />
        <Route path="/projects/foundation/mvp" element={<MVPSelection />} />
        <Route path="/projects/foundation/schedule" element={<ScheduleWizard />} />
        <Route path="/projects/hub" element={<Projects />} />
      </Routes>
    </BrowserRouter>
  );
}

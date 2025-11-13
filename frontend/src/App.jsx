import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Step1 from "./pages/OrganizationWizard/Step1";
import Step2 from "./pages/OrganizationWizard/Step2";

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
      </Routes>
    </BrowserRouter>
  );
}

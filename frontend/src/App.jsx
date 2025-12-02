import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WorkItemsPage from './pages/WorkItemsPage'
import OrganizationBuilder from './pages/OrganizationBuilder'
import ProjectsPage from './pages/ProjectsPage'
import RefinementPage from './pages/RefinementPage'
import RoadmapPage from './pages/RoadmapPage'
import TeamPriorities from './pages/TeamPriorities'
import NavBar from './components/NavBar'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  const [hierarchyOpen, setHierarchyOpen] = React.useState(false);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50">
          <NavBar onOpenHierarchy={() => setHierarchyOpen(true)} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<WorkItemsPage hierarchyOpen={hierarchyOpen} setHierarchyOpen={setHierarchyOpen} />} />
              <Route path="/organization" element={<OrganizationBuilder />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/refinement/:sessionId" element={<RefinementPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/team/priorities" element={<TeamPriorities />} />
              <Route path="/team/boards" element={<div className="p-6">Boards view coming soon...</div>} />
              <Route path="/team/analysis" element={<div className="p-6">Analysis view coming soon...</div>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

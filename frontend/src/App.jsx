import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WorkItemsPage from './pages/WorkItemsPage'
import OrganizationBuilder from './pages/OrganizationBuilder'
import ProjectsPage from './pages/ProjectsPage'
import RefinementPage from './pages/RefinementPage'
import MyRefinements from './pages/MyRefinements'
import RoadmapPage from './pages/RoadmapPage'
import TeamPriorities from './pages/TeamPriorities'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { useUserStore } from './store/userStore'

function App() {
  const [hierarchyOpen, setHierarchyOpen] = React.useState(false);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div className="flex min-h-screen bg-gray-50">
            <NavBar onOpenHierarchy={() => setHierarchyOpen(true)} />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<ProtectedRoute><WorkItemsPage hierarchyOpen={hierarchyOpen} setHierarchyOpen={setHierarchyOpen} /></ProtectedRoute>} />
                <Route path="/organization" element={<ProtectedRoute><OrganizationBuilder /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/refinement/:sessionId" element={<ProtectedRoute><RefinementPage /></ProtectedRoute>} />
                <Route path="/my-refinements" element={<ProtectedRoute><MyRefinements /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
                <Route path="/team/priorities" element={<ProtectedRoute><TeamPriorities /></ProtectedRoute>} />
                <Route path="/team/boards" element={<ProtectedRoute><div className="p-6">Boards view coming soon...</div></ProtectedRoute>} />
                <Route path="/team/analysis" element={<ProtectedRoute><div className="p-6">Analysis view coming soon...</div></ProtectedRoute>} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

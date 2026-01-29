import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BacklogPage from './pages/BacklogPage'
import OrganizationBuilder from './pages/OrganizationBuilder'
import ProjectInitiation from './pages/ProjectInitiation'
import RefinementPage from './pages/RefinementPage'
import MyRefinements from './pages/MyRefinements'
import RoadmapPage from './pages/RoadmapPage'
import TeamPriorities from './pages/TeamPriorities'
import BoardsPage from './pages/BoardsPage'
import AnalysisPage from './pages/AnalysisPage'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import MarketingPage from './pages/MarketingPage'
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
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MarketingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          {isAuthenticated ? (
            <>
              <Route path="/app/*" element={
                <div className="flex min-h-screen bg-gray-50">
                  <NavBar onOpenHierarchy={() => setHierarchyOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<ProtectedRoute><BacklogPage hierarchyOpen={hierarchyOpen} setHierarchyOpen={setHierarchyOpen} /></ProtectedRoute>} />
                      <Route path="/organization" element={<ProtectedRoute><OrganizationBuilder /></ProtectedRoute>} />
                      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                      <Route path="/projects" element={<ProtectedRoute><ProjectInitiation /></ProtectedRoute>} />
                      <Route path="/refinement/:sessionId" element={<ProtectedRoute><RefinementPage /></ProtectedRoute>} />
                      <Route path="/my-refinements" element={<ProtectedRoute><MyRefinements /></ProtectedRoute>} />
                      <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
                      <Route path="/team/priorities" element={<ProtectedRoute><TeamPriorities /></ProtectedRoute>} />
                      <Route path="/team/boards" element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
                      <Route path="/team/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
                    </Routes>
                  </main>
                </div>
              } />
            </>
          ) : (
            <Route path="/app/*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import WorkItemsPage from './pages/WorkItemsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Simple Navigation */}
        <nav className="bg-gray-800 text-white px-6 py-3 flex items-center gap-6">
          <h1 className="font-semibold text-lg">Pathways</h1>
          <Link to="/" className="hover:text-gray-300">Work Items</Link>
          <Link to="/board" className="hover:text-gray-300">Board</Link>
        </nav>

        <Routes>
          <Route path="/" element={<WorkItemsPage />} />
          <Route path="/board" element={<div className="p-6">Board view coming soon...</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

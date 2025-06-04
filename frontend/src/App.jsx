import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/api'

// Components
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clusters from './components/Clusters'
import Workloads from './components/Workloads'
import Deployments from './components/Deployments'
import Monitoring from './components/Monitoring'
import CostAnalysis from './components/CostAnalysis'
import Users from './components/Users'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="workloads" element={<Workloads />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="costs" element={<CostAnalysis />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 
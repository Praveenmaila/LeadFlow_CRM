import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import TeamPage from './pages/Team'
import ReportsPage from './pages/Reports'
import UsersPage from './pages/Users'
import LeadDetailPage from './pages/LeadDetail'
import CapturePage from './pages/Capture'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/capture" element={<CapturePage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SALES_REP']}><TeamPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App

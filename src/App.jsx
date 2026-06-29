import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import ExamSetup from './components/ExamSetup'
import ExamInterface from './components/ExamInterface'
import MonitoringDashboard from './components/MonitoringDashboard'
import ExamResult from './pages/ExamResult'
import ExamHistory from './pages/ExamHistory'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    auth.getCurrentUser().then(({ user }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/exam-setup/:examId" element={
            <ProtectedRoute user={user}>
              <ExamSetup user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/exam/:sessionId" element={
            <ProtectedRoute user={user}>
              <ExamInterface user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/exam-result/:sessionId" element={
            <ProtectedRoute user={user}>
              <ExamResult user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute user={user}>
              <ExamHistory user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <Profile user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

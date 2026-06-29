import React from 'react'
import { Navigate } from 'react-router-dom'
import { db } from '../lib/supabase'

function ProtectedRoute ({ children, user, requiredRole = null }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    // Check if user has required role
    const checkUserRole = async () => {
      const { data: userData } = await db.getUser(user.id)
      if (!userData || userData.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />
      }
    }
    checkUserRole()
  }

  return children
}

export default ProtectedRoute

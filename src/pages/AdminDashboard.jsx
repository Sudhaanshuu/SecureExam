import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/supabase'
import './AdminDashboard.css'

function AdminDashboard ({ user }) {
  const [exams, setExams] = useState([])
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAdminData()
  }, [user])

  const loadAdminData = async () => {
    if (!user) return

    try {
      // Load exams
      const { data: examsData } = await db.getExams()
      setExams(examsData || [])

      // Load users (admin only)
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .limit(10)
      setUsers(usersData || [])

      // Load recent sessions
      const { data: sessionsData } = await supabase
        .from('exam_sessions')
        .select('*, users(*), exams(*)')
        .order('created_at', { ascending: false })
        .limit(10)
      setSessions(sessionsData || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalExams: exams.length,
    activeExams: exams.filter(e => e.is_active).length,
    totalUsers: users.length,
    recentSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="logo">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="logo-text">SecureAdmin</span>
          </div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/admin" className="nav-link active">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Manage exams, users, and monitor sessions</p>
          </div>

          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => setActiveTab('exams')}
            >
              Exams
            </button>
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalExams}</h3>
                    <p>Total Exams</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.activeExams}</h3>
                    <p>Active Exams</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.completedSessions}</h3>
                    <p>Completed Sessions</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {sessions.slice(0, 5).map(session => (
                    <div key={session.id} className="activity-item">
                      <span className="activity-icon">
                        {session.status === 'completed' ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                          </svg>
                        )}
                      </span>
                      <div className="activity-details">
                        <span className="activity-user">
                          {session.users?.full_name || session.users?.email}
                        </span>
                        <span className="activity-exam">
                          {session.exams?.title || 'Unknown Exam'}
                        </span>
                      </div>
                      <span className="activity-time">
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>Manage Exams</h3>
                <button className="btn btn-primary">Create New Exam</button>
              </div>
              <div className="exams-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => (
                      <tr key={exam.id}>
                        <td>{exam.title}</td>
                        <td>{exam.duration_minutes} min</td>
                        <td>{exam.total_questions}</td>
                        <td>
                          <span className={`status-badge ${exam.is_active ? 'active' : 'inactive'}`}>
                            {exam.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-small">Edit</button>
                          <button className="btn btn-small btn-danger">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>User Management</h3>
              </div>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.full_name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-small">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>Exam Sessions</h3>
              </div>
              <div className="sessions-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Exam</th>
                      <th>Status</th>
                      <th>Start Time</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(session => (
                      <tr key={session.id}>
                        <td>{session.users?.email || 'N/A'}</td>
                        <td>{session.exams?.title || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${session.status}`}>
                            {session.status}
                          </span>
                        </td>
                        <td>{new Date(session.start_time).toLocaleString()}</td>
                        <td>
                          {session.end_time 
                            ? `${Math.round((new Date(session.end_time) - new Date(session.start_time)) / 60000)}m`
                            : 'In progress'
                          }
                        </td>
                        <td>
                          <button className="btn btn-small">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

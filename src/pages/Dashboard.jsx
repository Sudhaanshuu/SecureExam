import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/supabase'
import './Dashboard.css'

function Dashboard ({ user }) {
  const [userData, setUserData] = useState(null)
  const [exams, setExams] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Load user data
      const { data: userProfile } = await db.getUser(user.id)
      setUserData(userProfile)

      // Load available exams
      const { data: availableExams } = await db.getExams()
      setExams(availableExams || [])

      // Load recent results
      const { data: results } = await db.getUserResults(user.id)
      setRecentResults(results?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/')
  }

  const startExam = (examId) => {
    navigate(`/exam-setup/${examId}`)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="logo">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="logo-text">SecureExam</span>
          </div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            {userData?.role === 'admin' && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
            <button onClick={handleLogout} className="nav-link btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {userData?.full_name || user?.email?.split('@')[0]}!</h1>
          <p>View your exam history and start new assessments</p>
        </div>

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
              <h3>{recentResults.length}</h3>
              <p>Exams Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{recentResults.filter(r => r.passed).length}</h3>
              <p>Passed</p>
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
              <h3>{recentResults.length > 0 ? Math.round(recentResults.reduce((acc, r) => acc + r.score_percentage, 0) / recentResults.length) : 0}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{recentResults.reduce((acc, r) => acc + r.time_taken_seconds, 0) / 60 || 0}m</h3>
              <p>Total Time</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="section-card">
            <div className="section-header">
              <h2>Available Exams</h2>
              <Link to="/history" className="view-all">View All →</Link>
            </div>
            <div className="exams-list">
              {exams.length === 0 ? (
                <div className="empty-state">
                  <p>No exams available at the moment</p>
                </div>
              ) : (
                exams.map(exam => (
                  <div key={exam.id} className="exam-card">
                    <div className="exam-info">
                      <h3>{exam.title}</h3>
                      <p>{exam.description}</p>
                      <div className="exam-meta">
                        <span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {exam.duration_minutes} min
                        </span>
                        <span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          {exam.total_questions} questions
                        </span>
                        <span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                          </svg>
                          {exam.passing_score}% to pass
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => startExam(exam.id)}
                    >
                      Start Exam
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Recent Results</h2>
              <Link to="/history" className="view-all">View All →</Link>
            </div>
            <div className="results-list">
              {recentResults.length === 0 ? (
                <div className="empty-state">
                  <p>No exam results yet. Start your first exam!</p>
                </div>
              ) : (
                recentResults.map(result => (
                  <div key={result.id} className="result-card">
                    <div className="result-info">
                      <h3>{result.exams?.title || 'Unknown Exam'}</h3>
                      <p>{new Date(result.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="result-score">
                      <span className={`score-badge ${result.passed ? 'passed' : 'failed'}`}>
                        {result.score_percentage}%
                      </span>
                      <span className="score-label">{result.passed ? 'Passed' : 'Failed'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/history" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>View History</h3>
              <p>See all your past exam results</p>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>Edit Profile</h3>
              <p>Update your personal information</p>
            </Link>
            <div className="action-card" onClick={() => alert('Help documentation coming soon!')}>
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3>Help Center</h3>
              <p>Documentation and support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

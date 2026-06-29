import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/supabase'
import './ExamResult.css'

function ExamResult ({ user }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResultData()
  }, [sessionId, user])

  const loadResultData = async () => {
    if (!sessionId || !user) return

    try {
      // Load exam result
      const { data: resultData } = await db.getExamResult(sessionId)
      setResult(resultData)

      // Load session alerts
      const { data: alertsData } = await db.getSessionAlerts(sessionId)
      setAlerts(alertsData || [])
    } catch (error) {
      console.error('Error loading result data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="error-page">
        <h2>Result not found</h2>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="exam-result-page">
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
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="result-content">
        <div className="result-container">
          <div className="result-header">
            <h1>Exam Results</h1>
            <p>{result.exams?.title || 'Unknown Exam'}</p>
          </div>

          <div className={`score-card ${result.passed ? 'passed' : 'failed'}`}>
            <div className="score-circle">
              <span className="score-number">{result.score_percentage}%</span>
              <span className="score-label">{result.passed ? 'PASSED' : 'FAILED'}</span>
            </div>
            <div className="score-details">
              <div className="score-detail">
                <span className="detail-label">Correct Answers</span>
                <span className="detail-value">{result.correct_answers}/{result.total_questions}</span>
              </div>
              <div className="score-detail">
                <span className="detail-label">Time Taken</span>
                <span className="detail-value">{formatTime(result.time_taken_seconds)}</span>
              </div>
              <div className="score-detail">
                <span className="detail-label">Passing Score</span>
                <span className="detail-value">{result.exams?.passing_score || 60}%</span>
              </div>
            </div>
          </div>

          <div className="result-sections">
            <div className="section-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Performance Metrics
              </h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                  </span>
                  <div className="metric-info">
                    <span className="metric-value">{result.tab_switch_count}</span>
                    <span className="metric-label">Tab Switches</span>
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </span>
                  <div className="metric-info">
                    <span className="metric-value">{result.total_alerts}</span>
                    <span className="metric-label">Total Alerts</span>
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </span>
                  <div className="metric-info">
                    <span className="metric-value">{result.high_severity_alerts}</span>
                    <span className="metric-label">High Severity</span>
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </span>
                  <div className="metric-info">
                    <span className={`metric-value suspicion-${result.suspicion_level}`}>
                      {result.suspicion_level}
                    </span>
                    <span className="metric-label">Suspicion Level</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Alert Summary
              </h3>
              {alerts.length === 0 ? (
                <div className="no-alerts">
                  <span className="no-alerts-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <p>No alerts recorded during this exam</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.severity}`}>
                      <span className="alert-time">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                      <span className="alert-message">{alert.message}</span>
                      <span className={`alert-severity ${alert.severity}`}>
                        {alert.severity === 'high' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        ) : alert.severity === 'medium' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97706">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Exam Information
              </h3>
              <div className="exam-info">
                <div className="info-row">
                  <span className="info-label">Exam Title</span>
                  <span className="info-value">{result.exams?.title || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Completed On</span>
                  <span className="info-value">
                    {new Date(result.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Duration</span>
                  <span className="info-value">{result.exams?.duration_minutes || 'N/A'} minutes</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Questions</span>
                  <span className="info-value">{result.total_questions}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
            <Link to="/history" className="btn btn-secondary">
              View History
            </Link>
            <button 
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamResult

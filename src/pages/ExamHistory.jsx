import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/supabase'
import './ExamHistory.css'

function ExamHistory ({ user }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    if (!user) return

    try {
      const { data } = await db.getUserResults(user.id)
      setResults(data || [])
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true
    if (filter === 'passed') return result.passed
    if (filter === 'failed') return !result.passed
    return true
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
        <p>Loading history...</p>
      </div>
    )
  }

  return (
    <div className="history-page">
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
            <Link to="/history" className="nav-link active">History</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="history-content">
        <div className="history-container">
          <div className="history-header">
            <h1>Exam History</h1>
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({results.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'passed' ? 'active' : ''}`}
                onClick={() => setFilter('passed')}
              >
                Passed ({results.filter(r => r.passed).length})
              </button>
              <button 
                className={`filter-tab ${filter === 'failed' ? 'active' : ''}`}
                onClick={() => setFilter('failed')}
              >
                Failed ({results.filter(r => !r.passed).length})
              </button>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>No exam results found</h3>
              <p>Start taking exams to see your history here</p>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {filteredResults.map(result => (
                <div key={result.id} className="history-card">
                  <div className="history-info">
                    <div className="history-title">
                      <h3>{result.exams?.title || 'Unknown Exam'}</h3>
                      <span className={`status-badge ${result.passed ? 'passed' : 'failed'}`}>
                        {result.passed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        )}
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span className="meta-item">
                        <span className="meta-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </span>
                        {formatDate(result.created_at)}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </span>
                        {formatTime(result.time_taken_seconds)}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                          </svg>
                        </span>
                        {result.correct_answers}/{result.total_questions} correct
                      </span>
                    </div>
                  </div>
                  
                  <div className="history-score">
                    <div className="score-circle">
                      <span className="score-number">{result.score_percentage}%</span>
                    </div>
                    <div className="score-details">
                      <div className="score-detail">
                        <span className="detail-label">Score</span>
                        <span className={`detail-value ${result.passed ? 'good' : 'bad'}`}>
                          {result.score_percentage}%
                        </span>
                      </div>
                      <div className="score-detail">
                        <span className="detail-label">Alerts</span>
                        <span className="detail-value">{result.total_alerts}</span>
                      </div>
                      <div className="score-detail">
                        <span className="detail-label">Suspicion</span>
                        <span className={`detail-value suspicion-${result.suspicion_level}`}>
                          {result.suspicion_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/exam-result/${result.session_id}`}
                    className="btn btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="history-summary">
              <h3>Overall Statistics</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-number">{results.length}</span>
                  <span className="stat-label">Total Exams</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-number">{results.filter(r => r.passed).length}</span>
                  <span className="stat-label">Passed</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-number">
                    {results.length > 0 
                      ? Math.round(results.reduce((acc, r) => acc + r.score_percentage, 0) / results.length)
                      : 0}%
                  </span>
                  <span className="stat-label">Average Score</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-number">
                    {Math.round(results.reduce((acc, r) => acc + r.time_taken_seconds, 0) / 60)}m
                  </span>
                  <span className="stat-label">Total Time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamHistory

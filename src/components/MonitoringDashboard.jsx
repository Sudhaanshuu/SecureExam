import React, { useState, useEffect } from 'react'
import LaptopCamera from './LaptopCamera'
import IPCamera from './IPCamera'
import './MonitoringDashboard.css'

function MonitoringDashboard ({ ipCameraConnected, cameraMode = 'ip' }) {
  const [alerts, setAlerts] = useState([])
  const [suspicionLevel, setSuspicionLevel] = useState('Low')
  const [examStartTime] = useState(new Date())

  const addAlert = (message) => {
    const newAlert = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
      severity: message.includes('cheating') || message.includes('Multiple') ? 'high' : 'medium'
    }
    setAlerts(prev => [...prev.slice(-9), newAlert])
    
    // Update suspicion level based on alerts
    const highSeverityCount = alerts.filter(a => a.severity === 'high').length
    if (highSeverityCount >= 3) {
      setSuspicionLevel('High')
    } else if (highSeverityCount >= 1 || alerts.length >= 5) {
      setSuspicionLevel('Medium')
    }
  }

  const getExamDuration = () => {
    const now = new Date()
    const diff = Math.floor((now - examStartTime) / 1000)
    const mins = Math.floor(diff / 60)
    const secs = diff % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const durationInterval = setInterval(() => {
      // Force re-render for timer
    }, 1000)
    return () => clearInterval(durationInterval)
  }, [])

  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Monitoring Dashboard
        </h2>
        <div className="exam-timer">
          <span className="timer-label">Exam Duration:</span>
          <span className="timer-value">{getExamDuration()}</span>
        </div>
      </div>

      <div className="camera-feeds">
        <LaptopCamera onAlert={addAlert} />
        <IPCamera onAlert={addAlert} onConnectionChange={() => {}} />
      </div>

      <div className="alerts-section">
        <div className="alerts-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Real-time Alerts
          </h3>
          <div className={`suspicion-badge ${suspicionLevel.toLowerCase()}`}>
            Suspicion: {suspicionLevel}
          </div>
        </div>
        
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <div className="no-alerts-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <p>No suspicious activity detected</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <span className="alert-time">{alert.time}</span>
                <span className="alert-message">{alert.message}</span>
                <span className={`alert-severity ${alert.severity}`}>
                  {alert.severity === 'high' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="monitoring-summary">
        <div className="summary-card">
          <h4>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Session Statistics
          </h4>
          <div className="stats-grid">
            <div className="summary-stat">
              <span className="stat-value">{alerts.length}</span>
              <span className="stat-label">Total Alerts</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{alerts.filter(a => a.severity === 'high').length}</span>
              <span className="stat-label">High Severity</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{ipCameraConnected ? 'Active' : 'Inactive'}</span>
              <span className="stat-label">IP Camera Monitor</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">Active</span>
              <span className="stat-label">Laptop Monitor</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h4>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            Detection Rules Active
          </h4>
          <ul className="rules-list">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Face detection & tracking
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Multiple person detection
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Attention monitoring
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Tab switching detection
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              IP camera monitoring
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Audio level monitoring
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MonitoringDashboard

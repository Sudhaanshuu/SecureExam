import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import IPCamera from './IPCamera'
import './ExamSetup.css'

function ExamSetup({ user }) {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState('')
  const [ipCameraConnected, setIpCameraConnected] = useState(false)

  useEffect(() => {
    // Generate unique session ID
    const id = Math.random().toString(36).substring(2, 15)
    setSessionId(id)
  }, [])

  const handleStartClick = () => {
    if (!ipCameraConnected) {
      alert('Please connect your IP camera first')
      return
    }
    // Navigate to exam with camera mode in state
    navigate(`/exam/${sessionId}`, { 
      state: {
        config: {
          sessionId,
          duration: 60,
          questionCount: 10,
          cameraMode: 'ip'
        },
        ipCameraConnected: ipCameraConnected
      }
    })
  }

  const handleIpCameraConnection = (connected) => {
    setIpCameraConnected(connected)
  }

  return (
    <div className="exam-setup">
      <div className="setup-container">
        <h1>Anti-Cheat Exam Environment</h1>
        <p className="subtitle">Dual Monitoring System - Laptop + IP Camera</p>

        <div className="setup-grid">
          <div className="setup-card ip-camera-card">
            <h2>Step 1: Connect IP Camera</h2>
            <IPCamera 
              onAlert={() => {}}
              onConnectionChange={handleIpCameraConnection}
            />
          </div>

          <div className="setup-card">
            <h2>Step 2: System Requirements</h2>
            <ul className="requirements">
              <li>✓ Webcam enabled on laptop</li>
              <li>✓ IP camera accessible on network</li>
              <li>✓ Stable internet connection</li>
              <li>✓ Browser permissions granted</li>
              <li>✓ Quiet, well-lit environment</li>
            </ul>
          </div>

          <div className="setup-card">
            <h2>Step 3: Start Exam</h2>
            <div className="exam-info">
              <p><strong>Duration:</strong> 60 minutes</p>
              <p><strong>Questions:</strong> 10</p>
              <p><strong>Monitoring:</strong> Dual camera active</p>
              <p><strong>Camera Mode:</strong> IP Camera</p>
            </div>
            <button 
              className="start-btn"
              onClick={handleStartClick}
              disabled={!ipCameraConnected}
            >
              Start Exam
            </button>
          </div>
        </div>

        <div className="security-notice">
          <h3>⚠️ Security Notice</h3>
          <p>Your exam session will be monitored for suspicious activities including:</p>
          <ul>
            <li>Face detection and tracking</li>
            <li>Attention monitoring</li>
            <li>Multiple person detection</li>
            <li>External device detection</li>
            <li>Tab switching attempts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExamSetup

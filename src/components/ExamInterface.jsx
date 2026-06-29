import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MonitoringDashboard from './MonitoringDashboard'
import './ExamInterface.css'

function ExamInterface ({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const config = location.state?.config || { duration: 60, questionCount: 10, cameraMode: 'ip' }
  const ipCameraConnected = location.state?.ipCameraConnected || false
  const cameraMode = config.cameraMode || 'ip'
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(config.duration * 60)
  const [warnings, setWarnings] = useState([])
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const questions = [
    {
      id: 1,
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct: 1
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correct: 1
    },
    {
      id: 3,
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
      correct: 0
    },
    {
      id: 4,
      question: 'Which CSS property is used to change text color?',
      options: ['text-color', 'font-color', 'color', 'text-style'],
      correct: 2
    },
    {
      id: 5,
      question: 'What is the output of 2 + "2" in JavaScript?',
      options: ['4', '"22"', 'NaN', 'Error'],
      correct: 1
    },
    {
      id: 6,
      question: 'Which method is used to add an element to the end of an array?',
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correct: 0
    },
    {
      id: 7,
      question: 'What is the purpose of the useState hook in React?',
      options: ['To manage component state', 'To handle side effects', 'To create context', 'To optimize performance'],
      correct: 0
    },
    {
      id: 8,
      question: 'Which HTTP method is typically used to update data?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correct: 2
    },
    {
      id: 9,
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Programming Integration', 'Application Process Integration', 'Automated Programming Interface'],
      correct: 0
    },
    {
      id: 10,
      question: 'Which database is known for being document-oriented?',
      options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
      correct: 2
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1)
        addWarning('Tab switch detected')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const addWarning = (message) => {
    setWarnings(prev => [...prev, { message, time: new Date().toLocaleTimeString() }])
  }

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    setShowSubmitModal(true)
  }

  const confirmSubmit = () => {
    const correct = Object.keys(answers).reduce((acc, qId) => {
      const question = questions.find(q => q.id === parseInt(qId))
      if (question && answers[qId] === question.correct) {
        return acc + 1
      }
      return acc
    }, 0)
    
    // Calculate suspicion level based on warnings
    const highSeverityCount = warnings.filter(w => w.severity === 'high').length
    let suspicionLevel = 'low'
    if (highSeverityCount >= 3) {
      suspicionLevel = 'high'
    } else if (highSeverityCount >= 1 || warnings.length >= 5) {
      suspicionLevel = 'medium'
    }

    // In production, save to Supabase here
    // For now, navigate to results page with data
    const resultData = {
      score_percentage: Math.round((correct / questions.length) * 100),
      correct_answers: correct,
      total_questions: questions.length,
      passed: Math.round((correct / questions.length) * 100) >= 60,
      time_taken_seconds: (config.duration * 60) - timeRemaining,
      tab_switch_count: tabSwitchCount,
      total_alerts: warnings.length,
      high_severity_alerts: highSeverityCount,
      suspicion_level: suspicionLevel
    }
    
    // Navigate to results page (in production, save to DB first)
    navigate('/exam-result/demo-session-id', { state: resultData })
  }

  const handleExitExam = () => {
    setShowExitModal(true)
  }

  const confirmExit = () => {
    // Navigate back to dashboard
    navigate('/dashboard')
  }

  const handleTimeUp = () => {
    setShowSubmitModal(true)
  }

  useEffect(() => {
    if (timeRemaining === 0) {
      handleTimeUp()
    }
  }, [timeRemaining])

  return (
    <div className="exam-interface">
      <div className="exam-header">
        <div className="timer">
          <span className="timer-icon">⏱️</span>
          <span className={`timer-text ${timeRemaining < 300 ? 'urgent' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="header-actions">
          <div className="status-indicators">
            <span className={`status ${ipCameraConnected ? 'active' : 'inactive'}`}>
              � IP Camera: {ipCameraConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className={`status active`}>
              💻 Laptop: Active
            </span>
          </div>
          <button 
            className="exit-btn"
            onClick={handleExitExam}
          >
            Exit Exam
          </button>
        </div>
      </div>

      <div className="exam-content">
        <div className="question-card">
          <h2 className="question-text">
            {questions[currentQuestion].question}
          </h2>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${answers[questions[currentQuestion].id] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(questions[currentQuestion].id, index)}
              >
                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="exam-footer">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          <div className="question-nav">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-dot ${currentQuestion === index ? 'active' : ''} ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            className="nav-btn"
            onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>

      <MonitoringDashboard ipCameraConnected={ipCameraConnected} cameraMode={cameraMode} />

      {warnings.length > 0 && (
        <div className="warnings-panel">
          <h3>⚠️ Warnings ({warnings.length})</h3>
          <ul>
            {warnings.slice(-5).map((warning, index) => (
              <li key={index}>
                <span className="warning-time">{warning.time}</span>
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Exit Exam?</h2>
            <p>Are you sure you want to exit this exam? Your progress will be lost.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmExit}
              >
                Exit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Exam?</h2>
            <p>Are you sure you want to submit your exam? You cannot change your answers after submission.</p>
            <div className="submit-summary">
              <div className="summary-item">
                <span>Questions Answered:</span>
                <span>{Object.keys(answers).length}/{questions.length}</span>
              </div>
              <div className="summary-item">
                <span>Time Remaining:</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <div className="summary-item">
                <span>Warnings:</span>
                <span>{warnings.length}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSubmitModal(false)}
              >
                Continue Exam
              </button>
              <button 
                className="btn btn-primary"
                onClick={confirmSubmit}
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamInterface

import React, { useEffect, useRef, useState } from 'react'
import './LaptopCamera.css'

function LaptopCamera ({ onAlert }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [multipleFaces, setMultipleFaces] = useState(false)
  const [noFaceCount, setNoFaceCount] = useState(0)
  const [attentionScore, setAttentionScore] = useState(100)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)

  useEffect(() => {
    loadFaceApiModels()
    return () => {
      stopCamera()
    }
  }, [])

  const loadFaceApiModels = async () => {
    try {
      // Load face-api.js from public directory
      const script = document.createElement('script')
      script.src = '/face-api.min.js'
      script.async = true
      script.onload = async () => {
        try {
          // Load models from public/models directory
          await window.faceapi.nets.tinyFaceDetector.loadFromUri('/models')
          await window.faceapi.nets.faceLandmark68Net.loadFromUri('/models')
          await window.faceapi.nets.faceExpressionNet.loadFromUri('/models')
          
          setModelsLoaded(true)
          startCamera()
        } catch (error) {
          console.error('Error loading face-api models:', error)
          setLoadingError('Failed to load face detection models')
          onAlert?.('Face detection models failed to load')
        }
      }
      script.onerror = () => {
        console.error('Failed to load face-api.js')
        setLoadingError('Failed to load face-api library')
        onAlert?.('Face detection library failed to load')
      }
      document.head.appendChild(script)
    } catch (error) {
      console.error('Error loading face-api:', error)
      setLoadingError('Failed to initialize face detection')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsMonitoring(true)
          startFaceDetection()
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      onAlert?.('Camera access denied. Please enable camera permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsMonitoring(false)
  }

  const startFaceDetection = () => {
    if (!videoRef.current || !window.faceapi) return

    const detectionInterval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        clearInterval(detectionInterval)
        return
      }

      try {
        const detections = await window.faceapi.detectAllFaces(
          videoRef.current,
          new window.faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions()

        const canvas = canvasRef.current
        const video = videoRef.current
        
        if (canvas && video) {
          const displaySize = { width: video.videoWidth, height: video.videoHeight }
          window.faceapi.matchDimensions(canvas, displaySize)
          
          const resizedDetections = window.faceapi.resizeResults(detections, displaySize)
          
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Draw detections
          window.faceapi.draw.drawDetections(canvas, resizedDetections)
          window.faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
          window.faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

          // Update state based on detections
          const hasFace = detections.length > 0
          setFaceDetected(hasFace)
          setMultipleFaces(detections.length > 1)

          if (!hasFace) {
            setNoFaceCount(prev => {
              const newCount = prev + 1
              if (newCount > 5) {
                onAlert?.('No face detected for extended period')
              }
              return newCount
            })
          } else {
            setNoFaceCount(0)
          }

          if (detections.length > 1) {
            onAlert?.('Multiple faces detected - possible cheating')
          }

          // Calculate attention score based on expressions
          if (hasFace && detections[0].expressions) {
            const expressions = detections[0].expressions
            const happy = expressions.happy || 0
            const neutral = expressions.neutral || 0
            const focused = neutral + happy
            const newAttention = Math.min(100, Math.floor(focused * 100))
            setAttentionScore(newAttention)
          }
        }
      } catch (error) {
        console.error('Error during face detection:', error)
      }
    }, 500) // Run every 500ms for better performance

    return () => clearInterval(detectionInterval)
  }

  return (
    <div className="laptop-camera">
      <div className="camera-header">
        <h3>💻 Laptop Camera</h3>
        <div className={`status-indicator ${isMonitoring ? 'active' : 'inactive'}`}>
          {loadingError ? '○ Error' : !modelsLoaded ? '○ Loading' : isMonitoring ? '● Live' : '○ Offline'}
        </div>
      </div>
      
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} className="overlay-canvas" />
        
        {loadingError && (
          <div className="camera-placeholder error">
            <div className="placeholder-icon">⚠️</div>
            <p>{loadingError}</p>
            <p className="placeholder-sub">Face detection unavailable</p>
          </div>
        )}
        
        {!modelsLoaded && !loadingError && (
          <div className="camera-placeholder">
            <div className="placeholder-icon loading">🔄</div>
            <p>Loading face detection models...</p>
          </div>
        )}
        
        {modelsLoaded && !isMonitoring && !loadingError && (
          <div className="camera-placeholder">
            <div className="placeholder-icon">📷</div>
            <p>Initializing camera...</p>
          </div>
        )}
      </div>

      <div className="monitoring-stats">
        <div className="stat">
          <span className="stat-label">Face Status:</span>
          <span className={`stat-value ${faceDetected ? 'good' : 'bad'}`}>
            {faceDetected ? '✓ Detected' : '✗ Not Detected'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Multiple Faces:</span>
          <span className={`stat-value ${multipleFaces ? 'bad' : 'good'}`}>
            {multipleFaces ? '⚠️ Yes' : '✓ No'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Attention Score:</span>
          <span className={`stat-value ${attentionScore > 80 ? 'good' : attentionScore > 50 ? 'warning' : 'bad'}`}>
            {attentionScore}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">No Face Count:</span>
          <span className={`stat-value ${noFaceCount > 5 ? 'bad' : 'good'}`}>
            {noFaceCount}s
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Model Status:</span>
          <span className={`stat-value ${modelsLoaded ? 'good' : 'bad'}`}>
            {modelsLoaded ? '✓ Loaded' : '✗ Loading'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LaptopCamera

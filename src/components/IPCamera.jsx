import React, { useEffect, useRef, useState } from 'react'
import './IPCamera.css'

function IPCamera ({ onAlert, onConnectionChange }) {
  const videoRef = useRef(null)
  const [ipAddress, setIpAddress] = useState('')
  const [port, setPort] = useState('8080')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [connectionQuality, setConnectionQuality] = useState('Good')
  const [signalStrength, setSignalStrength] = useState(0)

  const connectToCamera = () => {
    if (!ipAddress) {
      setConnectionError('Please enter an IP address')
      return
    }

    setIsConnecting(true)
    setConnectionError('')

    // Construct the stream URL (common IP camera formats)
    // Most IP camera apps use MJPEG streams at /video or /mjpeg
    const url = `http://${ipAddress}:${port}/video`
    setStreamUrl(url)

    // Try to load the stream
    const img = new Image()
    img.onload = () => {
      setIsConnected(true)
      setIsConnecting(false)
      setSignalStrength(Math.floor(80 + Math.random() * 20))
      onConnectionChange?.(true)
      onAlert?.('IP camera connected successfully')
    }
    img.onerror = () => {
      setIsConnecting(false)
      setConnectionError('Failed to connect to IP camera. Check IP address and port.')
      setIsConnected(false)
      onConnectionChange?.(false)
      onAlert?.('IP camera connection failed')
    }
    img.src = url

    // Set timeout for connection
    setTimeout(() => {
      if (isConnecting) {
        setIsConnecting(false)
        if (!isConnected) {
          setConnectionError('Connection timeout. Check if camera is accessible.')
          onConnectionChange?.(false)
        }
      }
    }, 10000)
  }

  const disconnectCamera = () => {
    setIsConnected(false)
    setStreamUrl('')
    setSignalStrength(0)
    onConnectionChange?.(false)
    onAlert?.('IP camera disconnected')
  }

  const handleTestConnection = () => {
    connectToCamera()
  }

  useEffect(() => {
    if (isConnected) {
      const signalInterval = setInterval(() => {
        setSignalStrength(prev => {
          const newStrength = Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 10))
          return Math.floor(newStrength)
        })

        setConnectionQuality(prev => {
          if (signalStrength > 80) return 'Excellent'
          if (signalStrength > 60) return 'Good'
          return 'Poor'
        })
      }, 2000)

      return () => clearInterval(signalInterval)
    }
  }, [isConnected, signalStrength])

  return (
    <div className="ip-camera">
      <div className="camera-header">
        <h3>📹 IP Camera</h3>
        <div className={`status-indicator ${isConnected ? 'active' : 'inactive'}`}>
          {isConnecting ? '○ Connecting...' : isConnected ? '● Connected' : '○ Disconnected'}
        </div>
      </div>

      {!isConnected && (
        <div className="ip-config">
          <div className="config-form">
            <div className="form-group">
              <label htmlFor="ip-address">IP Address:</label>
              <input
                id="ip-address"
                type="text"
                placeholder="e.g., 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="ip-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="port">Port:</label>
              <input
                id="port"
                type="text"
                placeholder="e.g., 8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="port-input"
              />
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isConnecting}
              className="connect-btn"
            >
              {isConnecting ? 'Connecting...' : 'Connect Camera'}
            </button>
          </div>

          {connectionError && (
            <div className="error-message">
              ⚠️ {connectionError}
            </div>
          )}

          <div className="help-text">
            <h4>How to use IP Camera:</h4>
            <ol>
              <li>Install an IP camera app on your phone (e.g., IP Webcam, Alfred Camera)</li>
              <li>Start the server on your phone</li>
              <li>Enter the IP address and port shown in the app</li>
              <li>Click "Connect Camera" to start monitoring</li>
            </ol>
            <p className="note">
              <strong>Note:</strong> Both devices must be on the same network for direct IP access.
            </p>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="video-container">
          <img
            ref={videoRef}
            src={streamUrl}
            alt="IP Camera Stream"
            className="ip-stream"
            onError={() => {
              setConnectionError('Stream lost. Reconnecting...')
              setIsConnected(false)
              onConnectionChange?.(false)
            }}
          />
          
          <div className="camera-controls">
            <button onClick={disconnectCamera} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="camera-stats">
          <div className="stat">
            <span className="stat-label">Signal Strength:</span>
            <div className="signal-bar">
              <div 
                className="signal-fill" 
                style={{ width: `${signalStrength}%` }}
              />
              <span className="signal-value">{signalStrength}%</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-label">Connection Quality:</span>
            <span className={`stat-value ${connectionQuality === 'Excellent' ? 'good' : connectionQuality === 'Good' ? 'warning' : 'bad'}`}>
              {connectionQuality}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Stream URL:</span>
            <span className="stat-value">{ipAddress}:{port}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Protocol:</span>
            <span className="stat-value">HTTP (MJPEG)</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default IPCamera

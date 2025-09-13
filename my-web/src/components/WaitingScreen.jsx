import { useState, useEffect, useRef } from 'react';

export default function WaitingScreen({ activeUsers, waitingTime, onCancel, localVideoRef }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="waiting-screen">
      <div className="waiting-layout">
        {/* Left side - Main content */}
        <div className="waiting-main">
          <div className="waiting-container">
            {/* Animated Logo */}
            <div className="waiting-logo">
              <div className="logo-circle">
                <div className="logo-icon">🎓</div>
              </div>
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
            </div>

            {/* Main Content */}
            <div className="waiting-content">
              <h2>Finding your perfect match{dots}</h2>
              <p>We're connecting you with another student from your college</p>
              
              {/* Stats */}
              <div className="waiting-stats">
                <div className="stat-item">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-number">{activeUsers}</div>
                    <div className="stat-label">Active Students</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <div className="stat-number">{formatTime(waitingTime)}</div>
                    <div className="stat-label">Waiting Time</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="progress-text">Searching for matches...</div>
              </div>

              {/* Tips */}
              <div className="waiting-tips">
                <h3>💡 While you wait:</h3>
                <ul>
                  <li>Make sure your camera and microphone are working</li>
                  <li>Find a quiet, well-lit place to chat</li>
                  <li>Be ready to meet new people from your college!</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="waiting-actions">
              <button className="waiting-btn secondary" onClick={onCancel}>
                Cancel Search
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Opponent details and Video preview */}
        <div className="waiting-video-preview">
          <div className="preview-container">
            {/* Opponent Details Section */}
            <div className="opponent-details">
              <div className="opponent-header">
                <h3>Your Next Match</h3>
                <div className="match-status">
                  <div className="status-dot"></div>
                  <span>Searching...</span>
                </div>
              </div>
              
              <div className="opponent-card">
                <div className="opponent-avatar">
                  <div className="avatar-placeholder">
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="avatar-ring"></div>
                </div>
                
                <div className="opponent-info">
                  <div className="opponent-name">
                    <span className="name-placeholder">Finding match...</span>
                  </div>
                  <div className="opponent-college">
                    <span className="college-icon">🏫</span>
                    <span className="college-text">College details loading...</span>
                  </div>
                  <div className="opponent-bio">
                    <p>We're searching for the perfect student to connect you with!</p>
                  </div>
                </div>
                
                <div className="opponent-stats">
                  <div className="stat-badge">
                    <span className="stat-icon">🎯</span>
                    <span>Smart Match</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-icon">🔒</span>
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Preview Section */}
            <div className="video-preview-container">
              <div className="video-preview-header">
                <h3>Your Video Preview</h3>
                <div className="video-status">
                  <div className="status-indicator"></div>
                  <span>Camera Active</span>
                </div>
              </div>
              <div className="video-preview-wrapper">
                <video 
                  ref={localVideoRef} 
                  className="video-preview" 
                  autoPlay 
                  playsInline 
                  muted
                />
                <div className="video-overlay">
                  <div className="video-controls">
                    <button className="video-control-btn" title="Camera is on">
                      📹
                    </button>
                    <button className="video-control-btn" title="Microphone is on">
                      🎤
                    </button>
                  </div>
                </div>
              </div>
              <div className="video-preview-footer">
                <p>This is how you'll appear to others</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

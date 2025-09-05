import { useState, useEffect } from 'react'
import './LandingPage.css'

const LandingPage = ({ onEnter }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="landing-page">
      <div 
        className="mouse-glow"
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100
        }}
      />
      
      <div className="landing-content">
        <div className="logo-section">
          <div className="main-logo">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1 className="app-title">STORIUM</h1>
          <p className="app-tagline">Secure. Simple. Shared.</p>
        </div>

        <button className="enter-btn" onClick={onEnter}>
          ENTER STORIUM
        </button>

        <div className="credits">
          Created by <span className="creator">Lies_Of_Code</span>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
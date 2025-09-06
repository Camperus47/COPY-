// Importing React hooks and CSS file
import { useState, useEffect } from 'react'
import './LandingPage.css'
import SplineScene from './SplineScene'

// LandingPage component takes a prop 'onEnter' (function triggered on button click)
const LandingPage = ({ onEnter }) => {
  // State to store current mouse position (x, y coordinates)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // useEffect hook runs once when component mounts
  useEffect(() => {
    // Function to update mouse position whenever mouse moves
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // Add event listener to track mouse movement
    document.addEventListener('mousemove', handleMouseMove)
    
    // Cleanup function to remove listener when component unmounts
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>  
     <SplineScene />
    <div className="landing-page"> {/* Main container */}

      {/* Glow effect div that follows mouse */}
      <div 
        className="mouse-glow"
        style={{
          left: mousePosition.x - 100, // position glow horizontally relative to mouse
          top: mousePosition.y - 100   // position glow vertically relative to mouse
        }}
      />
      
      <div className="landing-content"> {/* Main content container */}

        {/* Logo and branding section */}
        <div className="logo-section">
          <div className="main-logo">
            {/* SVG logo icon */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1 className="app-title">STORIUM</h1> {/* App name */}
          <p className="app-tagline" >Secure. Simple. Shared.</p> {/* Tagline */}
        </div>

        {/* Enter button that triggers 'onEnter' function */}
        <button className="enter-btn" onClick={onEnter}>
          ENTER STORIUM
        </button>
        
        {/* Footer credits */}
        <div className="credits">
          Created by <span className="creator">Lies_Of_Code</span>
        </div>
      </div>
       
    </div>
   
  </>
  )
}

// Exporting the component so it can be used in other files
export default LandingPage

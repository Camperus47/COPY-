import React, { useEffect, useRef } from 'react'

const ArrowAnimation = ({ direction }) => {
  const arrowRef = useRef(null)

  useEffect(() => {
    const arrow = arrowRef.current
    if (!arrow) return

    // Set initial position based on direction
    if (direction === 'right') {
      arrow.style.left = '-100px'
      arrow.style.transform = 'translateY(-50%) rotate(0deg)'
    } else {
      arrow.style.right = '-100px'
      arrow.style.transform = 'translateY(-50%) rotate(180deg)'
    }

    // Trigger animation
    setTimeout(() => {
      if (direction === 'right') {
        arrow.style.left = 'calc(100vw + 100px)'
      } else {
        arrow.style.right = 'calc(100vw + 100px)'
      }
    }, 100)
  }, [direction])

  return (
    <div 
      ref={arrowRef}
      className="arrow-animation"
      style={{
        position: 'fixed',
        top: '50%',
        zIndex: 10000,
        pointerEvents: 'none',
        transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))'
      }}
    >
      <svg 
        width="80" 
        height="40" 
        viewBox="0 0 80 40" 
        fill="none"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))'
        }}
      >
        {/* Arrow body */}
        <rect 
          x="5" 
          y="16" 
          width="50" 
          height="8" 
          fill="url(#arrowGradient)"
          rx="4"
        />
        
        {/* Arrow head */}
        <polygon 
          points="55,8 75,20 55,32" 
          fill="url(#arrowGradient)"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
        
        {/* Glow effect */}
        <rect 
          x="5" 
          y="16" 
          width="50" 
          height="8" 
          fill="none"
          stroke="rgba(255, 215, 0, 0.5)"
          strokeWidth="2"
          rx="4"
        />
        <polygon 
          points="55,8 75,20 55,32" 
          fill="none"
          stroke="rgba(255, 215, 0, 0.5)"
          strokeWidth="2"
        />
      </svg>
      
      {/* Trailing particles */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '-20px',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.8), transparent)',
          animation: 'trailPulse 0.5s ease-in-out infinite alternate'
        }}
      />
      
      <style jsx>{`
        @keyframes trailPulse {
          0% { opacity: 0.3; transform: translateY(-50%) scaleX(0.5); }
          100% { opacity: 1; transform: translateY(-50%) scaleX(1); }
        }
      `}</style>
    </div>
  )
}

export default ArrowAnimation
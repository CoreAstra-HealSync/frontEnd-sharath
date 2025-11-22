import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { container: 32, text: '1rem' },
    medium: { container: 48, text: '1.5rem' },
    large: { container: 64, text: '2rem' }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: showText ? '0.75rem' : '0'
    }}>
      <svg 
        width={currentSize.container} 
        height={currentSize.container} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background circle with gradient */}
        <circle cx="32" cy="32" r="32" fill="url(#logoGradient)"/>
        
        {/* Medical cross */}
        <g filter="url(#logoShadow)">
          {/* Vertical bar */}
          <rect x="27" y="16" width="10" height="32" rx="3" fill="white" opacity="0.95"/>
          {/* Horizontal bar */}
          <rect x="16" y="27" width="32" height="10" rx="3" fill="white" opacity="0.95"/>
          
          {/* Center circle */}
          <circle cx="32" cy="32" r="6" fill="white"/>
          
          {/* Heartbeat line */}
          <path 
            d="M 20 32 L 23 32 L 25 28 L 27 36 L 29 32 L 44 32" 
            stroke="#03045e" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
        </g>
        
        {/* Pulse dots */}
        <circle cx="32" cy="20" r="2" fill="#00b4d8" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="32" cy="44" r="2" fill="#00b4d8" opacity="0.8">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#03045e', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0077b6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00b4d8', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {showText && (
        <span style={{
          fontSize: currentSize.text,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          HealSync
        </span>
      )}
    </div>
  );
};

export default Logo;

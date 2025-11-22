import React from 'react';
import { Hospital } from '../types';

interface TacticalMapProps {
  hospitals: Hospital[];
}

const TacticalMap: React.FC<TacticalMapProps> = ({ hospitals }) => {
  // Status Colors for Map
  // Critical: Soft Red #D67A7A, Warning: Mustard #E6B368, Good: Sage #7EAA7E
  const getStatusColor = (hospital: Hospital) => {
    if (!hospital.isOnline) return '#6b7280'; // Grey for offline

    let lowestDays = 100;
    
    hospital.departments.forEach(dept => {
      dept.inventory.forEach(item => {
        const days = item.quantity / (item.dailyUsageRate || 1);
        if (days < lowestDays) lowestDays = days;
      });
    });

    if (lowestDays < 2) return '#D67A7A'; // Danger
    if (lowestDays < 5) return '#E6B368'; // Warning
    return '#7EAA7E'; // Sage
  };

  const getStatusLabel = (hospital: Hospital) => {
      if (!hospital.isOnline) return 'OFFLINE';
      let criticalItems: string[] = [];
      hospital.departments.forEach(d => {
          d.inventory.forEach(i => {
              if ((i.quantity / i.dailyUsageRate) < 2) criticalItems.push(i.name);
          })
      });
      if (criticalItems.length > 0) return `CRITICAL: ${criticalItems.join(', ')}`;
      return 'OPERATIONAL';
  }

  return (
    <div className="w-full h-[500px] bg-[#1C1917] rounded-3xl overflow-hidden relative group shadow-inner border border-natural-800">
      <div className="absolute top-6 left-6 text-xs text-natural-500 font-mono tracking-[0.2em] z-10 opacity-70">TACTICAL MAP // GAZA STRIP</div>
      
      <svg className="w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
        <defs>
           <pattern id="water" width="20" height="20" patternUnits="userSpaceOnUse">
               <path d="M0 10 Q 5 5 10 10 T 20 10" fill="none" stroke="#3b82f6" strokeOpacity="0.1" strokeWidth="1"/>
           </pattern>
           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
           </filter>
        </defs>

        {/* Mediterranean Sea (Left Side) */}
        <rect x="0" y="0" width="600" height="800" fill="#1C1917" />
        <path d="M0 0 L 300 0 L 300 800 L 0 800 Z" fill="url(#water)" opacity="0.3" />
        
        {/* Map Container Group - Centered roughly */}
        <g transform="translate(50, 20)">
            
            {/* Gaza Strip Outline */}
            {/* Approximate shape: North is top, coastline curves out to left */}
            <path 
                d="M 380 50 L 440 60 L 420 750 L 280 720 Q 300 400 380 50 Z" 
                fill="#292524" 
                stroke="#453D33" 
                strokeWidth="2"
                className="drop-shadow-2xl"
            />

            {/* Borders */}
            {/* Egypt Border (South) */}
            <path d="M 280 720 L 420 750" fill="none" stroke="#D67A7A" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
            
            {/* Israel Border (North/East) */}
            <path d="M 380 50 L 440 60 L 420 750" fill="none" stroke="#E6B368" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />

            {/* Main Road (Salah al-Din) */}
            <path d="M 400 80 Q 380 400 350 700" fill="none" stroke="#57534e" strokeWidth="3" strokeOpacity="0.4" />

            {/* City Labels */}
            <text x="410" y="100" fill="#57534e" fontSize="10" fontFamily="monospace" opacity="0.6">NORTH GAZA</text>
            <text x="390" y="250" fill="#57534e" fontSize="10" fontFamily="monospace" opacity="0.6">GAZA CITY</text>
            <text x="360" y="450" fill="#57534e" fontSize="10" fontFamily="monospace" opacity="0.6">DEIR AL-BALAH</text>
            <text x="340" y="600" fill="#57534e" fontSize="10" fontFamily="monospace" opacity="0.6">KHAN YOUNIS</text>
            <text x="330" y="700" fill="#57534e" fontSize="10" fontFamily="monospace" opacity="0.6">RAFAH</text>

            {/* Nodes */}
            {hospitals.map((hospital) => (
            <g key={hospital.id} transform={`translate(${hospital.coordinates.x}, ${hospital.coordinates.y})`} className="cursor-pointer hover:opacity-100 transition-all group/node">
                
                {/* Status Pulse */}
                {getStatusColor(hospital) === '#D67A7A' && (
                <circle r="30" fill="#D67A7A" opacity="0.2">
                    <animate attributeName="r" values="10;50" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0" dur="2s" repeatCount="indefinite" />
                </circle>
                )}
                
                {/* Hospital Dot */}
                <circle r="8" fill={getStatusColor(hospital)} stroke="#1C1917" strokeWidth="2" filter="url(#glow)" className="transition-all duration-300 group-hover/node:r-10"/>
                
                {/* Tooltip on Hover */}
                <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect x="15" y="-20" width="160" height="50" rx="4" fill="#1C1917" stroke="#57534e" strokeWidth="1" fillOpacity="0.9" />
                    <text x="25" y="-5" fill="#E3DCCF" fontSize="10" fontWeight="bold">{hospital.name.toUpperCase()}</text>
                    <text x="25" y="15" fill={getStatusColor(hospital)} fontSize="9" fontWeight="bold">{getStatusLabel(hospital)}</text>
                </g>
            </g>
            ))}
        </g>
      </svg>
    </div>
  );
};

export default TacticalMap;
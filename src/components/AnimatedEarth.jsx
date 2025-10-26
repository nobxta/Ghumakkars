import React from 'react';
import './AnimatedEarth.css';

const AnimatedEarth = () => {
  return (
    <div className="earth-wrapper">
      <div id="earth-cont">
        {/* Grid points for the globe */}
        {Array.from({ length: 73 }, (_, i) => (
          <div key={`point-${i}`} className="point" />
        ))}
        
        {/* Continents */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={`continent-${i}`} className={`continent c${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedEarth;


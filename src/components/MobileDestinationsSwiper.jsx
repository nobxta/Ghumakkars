import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard, Mousewheel, A11y } from 'swiper/modules';
import { createMobileDestinationsSwiper, mobileSwiperUtils } from '../utils/mobileSwiperConfig';

// Import the mobile-optimized CSS
import '../styles/mobile-swiper.css';

const MobileDestinationsSwiper = ({ destinations = [] }) => {
  const swiperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(mobileSwiperUtils.isMobile());
    
    // Optimize images
    mobileSwiperUtils.optimizeImages();
    
    // Handle orientation change
    const handleOrientationChange = () => {
      if (swiperRef.current) {
        mobileSwiperUtils.handleOrientationChange(swiperRef.current);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Simulate loading completion
    setTimeout(() => setIsLoading(false), 1000);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const swiperConfig = createMobileDestinationsSwiper();

  const handleSlideClick = (destination) => {
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Handle slide click (e.g., navigate to destination details)
    console.log('Clicked destination:', destination);
  };

  if (isLoading) {
    return (
      <div className="destinations-swiper">
        <div className="swiper-wrapper">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="destination-slide loading-slide">
              <div className="destination-card">
                <div className="destination-image-container">
                  <div className="destination-image loading-placeholder"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="destinations-swiper-container">
      <Swiper
        ref={swiperRef}
        modules={[EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard, Mousewheel, A11y]}
        {...swiperConfig}
        className="destinations-swiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          mobileSwiperUtils.addTouchFeedback(swiper);
        }}
      >
        {destinations.map((destination, index) => (
          <SwiperSlide key={destination.id || index} className="destination-slide">
            <div 
              className="destination-card"
              onClick={() => handleSlideClick(destination)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSlideClick(destination);
                }
              }}
              aria-label={`View details for ${destination.title}`}
            >
              <div className="destination-image-container">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="destination-image"
                  loading="lazy"
                  onLoad={() => {
                    // Remove loading state when image loads
                    const slide = document.querySelector(`[data-swiper-slide-index="${index}"]`);
                    if (slide) {
                      slide.classList.add('loaded');
                    }
                  }}
                />
                <div className="destination-overlay">
                  <div className="destination-content">
                    <h3 className="destination-title">{destination.title}</h3>
                    <p className="destination-description">{destination.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Navigation buttons */}
        <div className="swiper-button-next"></div>
        <div className="swiper-button-prev"></div>
        
        {/* Pagination */}
        <div className="swiper-pagination"></div>
      </Swiper>
      
      {/* Mobile-specific instructions */}
      {isMobile && (
        <div className="mobile-instructions">
          <p>Swipe to explore destinations</p>
        </div>
      )}
    </div>
  );
};

export default MobileDestinationsSwiper;

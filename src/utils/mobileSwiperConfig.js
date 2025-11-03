// Enhanced Mobile Swiper Configuration for Destinations
export const createMobileDestinationsSwiper = () => {
  return {
    // Basic configuration
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 200,
      modifier: 1,
      slideShadows: true,
    },
    
    // Mobile-optimized settings
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    
    // Touch and gesture settings
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    allowTouchMove: true,
    threshold: 5,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    
    // Responsive breakpoints
    breakpoints: {
      320: {
        slidesPerView: 1.2,
        spaceBetween: 10,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
      },
      480: {
        slidesPerView: 1.5,
        spaceBetween: 15,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 1,
          slideShadows: true,
        },
      },
      768: {
        slidesPerView: 2.2,
        spaceBetween: 20,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true,
        },
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 25,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 300,
          modifier: 1,
          slideShadows: true,
        },
      },
    },
    
    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    
    // Pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    
    // Keyboard control
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    
    // Mouse wheel control
    mousewheel: {
      invert: false,
      forceToAxis: true,
      sensitivity: 1,
    },
    
    // Events
    on: {
      init: function() {
        console.log('Destinations Swiper initialized');
        this.updateSlidesClasses();
      },
      
      slideChange: function() {
        // Add smooth transition class
        this.el.classList.add('swiper-transitioning');
        setTimeout(() => {
          this.el.classList.remove('swiper-transitioning');
        }, 300);
      },
      
      touchStart: function() {
        // Pause autoplay on touch
        this.autoplay.stop();
      },
      
      touchEnd: function() {
        // Resume autoplay after touch
        setTimeout(() => {
          this.autoplay.start();
        }, 2000);
      },
      
      resize: function() {
        // Recalculate on resize
        this.update();
      },
    },
    
    // Performance optimizations
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    preloadImages: false,
    lazy: {
      loadPrevNext: true,
      loadPrevNextAmount: 2,
    },
    
    // Accessibility
    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous destination',
      nextSlideMessage: 'Next destination',
      firstSlideMessage: 'This is the first destination',
      lastSlideMessage: 'This is the last destination',
    },
  };
};

// Utility functions for mobile swiper
export const mobileSwiperUtils = {
  // Detect if device is mobile
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Get optimal slide width for current screen
  getOptimalSlideWidth: () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) return 200;
    if (screenWidth < 768) return 240;
    if (screenWidth < 1024) return 280;
    return 320;
  },
  
  // Handle orientation change
  handleOrientationChange: (swiper) => {
    setTimeout(() => {
      swiper.update();
      swiper.updateSlidesClasses();
    }, 100);
  },
  
  // Add touch feedback
  addTouchFeedback: (swiper) => {
    const slides = swiper.slides;
    
    slides.forEach(slide => {
      slide.addEventListener('touchstart', () => {
        slide.style.transform = 'scale(0.98)';
      });
      
      slide.addEventListener('touchend', () => {
        slide.style.transform = '';
      });
    });
  },
  
  // Optimize images for mobile
  optimizeImages: () => {
    const images = document.querySelectorAll('.destination-image');
    images.forEach(img => {
      // Add loading attribute for better performance
      img.setAttribute('loading', 'lazy');
      
      // Add error handling
      img.addEventListener('error', () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDIwMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBMMTIwIDEwMEg4MEwxMDAgODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
      });
    });
  },
};

// CSS-in-JS styles for dynamic adjustments
export const getDynamicStyles = (isMobile) => ({
  swiperContainer: {
    padding: isMobile ? '15px 0 30px 0' : '20px 0 40px 0',
    overflow: 'visible',
  },
  slide: {
    width: isMobile ? '240px' : '280px',
    height: isMobile ? '180px' : '200px',
    marginRight: isMobile ? '15px' : '20px',
    borderRadius: isMobile ? '16px' : '20px',
  },
  title: {
    fontSize: isMobile ? '20px' : '24px',
    marginBottom: isMobile ? '6px' : '8px',
  },
  description: {
    fontSize: isMobile ? '13px' : '14px',
  },
});

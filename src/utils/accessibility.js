/**
 * Accessibility utilities for improved UX
 */

// Focus management
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  return () => element.removeEventListener('keydown', handleTabKey);
};

// Announce to screen readers
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard navigation helper
export const handleKeyboardNav = (event, actions) => {
  const { key } = event;
  const action = actions[key];
  
  if (action) {
    event.preventDefault();
    action();
  }
};

// Skip to content link
export const createSkipLink = () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

// Color contrast checker (simple version)
export const checkContrast = (foreground, background) => {
  // Simplified contrast ratio calculation
  // For production, use a proper library like 'wcag-contrast'
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const ratio = (getLuminance(foreground) + 0.05) / (getLuminance(background) + 0.05);
  return ratio >= 4.5; // WCAG AA standard for normal text
};

// Debounce for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Detect reduced motion preference
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Detect dark mode preference
export const prefersDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default {
  trapFocus,
  announceToScreenReader,
  handleKeyboardNav,
  createSkipLink,
  checkContrast,
  debounce,
  throttle,
  prefersReducedMotion,
  prefersDarkMode
};


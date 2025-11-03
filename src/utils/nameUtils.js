/**
 * Utility functions for user name display
 */

/**
 * Get user's full display name
 * @param {Object} user - User object
 * @returns {string} - Full name (firstName + lastName) or fallback to name
 */
export const getUserFullName = (user) => {
  if (!user) return '';
  
  // Use firstName + lastName if available
  if (user.firstName) {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.join(' ').trim();
  }
  
  // Fallback to name field
  return user.name || '';
};

/**
 * Get user's first name only
 * @param {Object} user - User object
 * @returns {string} - First name or first word of name
 */
export const getUserFirstName = (user) => {
  if (!user) return '';
  
  if (user.firstName) {
    return user.firstName;
  }
  
  // Fallback: get first word from name
  return user.name?.split(' ')[0] || '';
};

/**
 * Get display initial (first letter of first name or name)
 * @param {Object} user - User object
 * @returns {string} - Single character initial
 */
export const getUserInitial = (user) => {
  if (!user) return 'U';
  
  const firstName = user.firstName || user.name?.split(' ')[0];
  return firstName?.charAt(0)?.toUpperCase() || 'U';
};


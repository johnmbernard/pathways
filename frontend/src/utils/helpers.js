import clsx from 'clsx';

/**
 * Combine class names conditionally
 * Wrapper around clsx for consistent usage
 */
export function cn(...classes) {
  return clsx(...classes);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function for performance
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  cn,
  truncate,
  debounce,
  generateId,
};

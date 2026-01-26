import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import styles from './HelpTooltip.module.css';

/**
 * HelpTooltip - A reusable help icon with tooltip/popup
 * 
 * @param {string} title - Title of the help popup
 * @param {string|React.Node} content - Content/description in the help popup
 * @param {string} size - Size of the icon: 'small' (14px), 'medium' (18px), 'large' (24px)
 * @param {string} placement - Where to show the popup: 'top', 'bottom', 'left', 'right'
 */
export function HelpTooltip({ 
  title, 
  content, 
  size = 'medium',
  placement = 'bottom'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  const iconSizes = {
    small: 14,
    medium: 18,
    large: 24
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={styles.helpContainer}>
      <button
        ref={iconRef}
        className={styles.helpIcon}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Help"
        type="button"
      >
        <HelpCircle size={iconSizes[size]} />
      </button>
      
      {isOpen && (
        <div 
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[placement]}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.tooltipHeader}>
            {title && <h4 className={styles.tooltipTitle}>{title}</h4>}
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          <div className={styles.tooltipContent}>
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        </div>
      )}
    </div>
  );
}

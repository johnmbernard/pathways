import React from 'react';
import { Calendar } from 'lucide-react';
import { normalizeDate } from '../utils/dateUtils';
import styles from './DateInputs.module.css';

export default function DateInputs({ startDate, targetDate, onChange, className }) {
  return (
    <div className={`${styles.dateInputs} ${className || ''}`}>
      <Calendar size={14} className={styles.icon} />
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onChange({ startDate: normalizeDate(e.target.value) })}
        className={styles.dateInput}
        title="Start date"
      />
      <span className={styles.arrow}>→</span>
      <input
        type="date"
        value={targetDate || ''}
        onChange={(e) => onChange({ targetDate: normalizeDate(e.target.value) })}
        className={styles.dateInput}
        title="Target date"
      />
    </div>
  );
}

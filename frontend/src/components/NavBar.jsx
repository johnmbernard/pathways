import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, List, Building2, Map, ListChecks, Kanban, BarChart3 } from 'lucide-react';
import styles from './NavBar.module.css';

export default function NavBar({ onOpenHierarchy }) {
  const loc = useLocation();
  const [orgPlanningExpanded, setOrgPlanningExpanded] = React.useState(true);
  const [teamPlanningExpanded, setTeamPlanningExpanded] = React.useState(true);
  const isActive = (path) => loc.pathname === path;
  
  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>Pathways</h1>
      </div>

      {/* Navigation Sections */}
      <nav className={styles.nav}>
        {/* Organizational Planning Section */}
        <div className={styles.section}>
          <button
            onClick={() => setOrgPlanningExpanded(!orgPlanningExpanded)}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTitle}>Organizational Planning</span>
            <span className={styles.sectionIcon}>
              {orgPlanningExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </button>
          
          {orgPlanningExpanded && (
            <div className={styles.sectionContent}>
              <Link
                to="/organization"
                className={`${styles.navItem} ${isActive('/organization') ? styles.active : ''}`}
              >
                <Building2 className={styles.navItemIcon} size={18} />
                Organization
              </Link>
              <Link
                to="/"
                className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
              >
                <List className={styles.navItemIcon} size={18} />
                Backlog
              </Link>
              <Link
                to="/roadmap"
                className={`${styles.navItem} ${isActive('/roadmap') ? styles.active : ''}`}
              >
                <Map className={styles.navItemIcon} size={18} />
                Roadmap
              </Link>
            </div>
          )}
        </div>

        {/* Team Planning Section */}
        <div className={styles.section}>
          <button
            onClick={() => setTeamPlanningExpanded(!teamPlanningExpanded)}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTitle}>Team Planning</span>
            <span className={styles.sectionIcon}>
              {teamPlanningExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </button>
          
          {teamPlanningExpanded && (
            <div className={styles.sectionContent}>
              <Link
                to="/team/priorities"
                className={`${styles.navItem} ${isActive('/team/priorities') ? styles.active : ''}`}
              >
                <ListChecks className={styles.navItemIcon} size={18} />
                Priorities
              </Link>
              <Link
                to="/team/boards"
                className={`${styles.navItem} ${isActive('/team/boards') ? styles.active : ''}`}
              >
                <Kanban className={styles.navItemIcon} size={18} />
                Boards
              </Link>
              <Link
                to="/team/analysis"
                className={`${styles.navItem} ${isActive('/team/analysis') ? styles.active : ''}`}
              >
                <BarChart3 className={styles.navItemIcon} size={18} />
                Analysis
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>v1.0.0</p>
      </div>
    </aside>
  );
}

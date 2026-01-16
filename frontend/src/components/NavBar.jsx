import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, List, Building2, Map, ListChecks, Kanban, BarChart3, FolderKanban, ClipboardList, LogOut, User, Users, Settings } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useOrganizationStore } from '../store/organizationStore';
import styles from './NavBar.module.css';

export default function NavBar({ onOpenHierarchy }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [orgPlanningExpanded, setOrgPlanningExpanded] = React.useState(true);
  const [teamPlanningExpanded, setTeamPlanningExpanded] = React.useState(true);
  const [settingsExpanded, setSettingsExpanded] = React.useState(true);
  const isActive = (path) => loc.pathname === path;
  
  const currentUser = useUserStore(state => state.currentUser);
  const logout = useUserStore(state => state.logout);
  const units = useOrganizationStore(state => state.units);
  
  const userUnit = units.find(u => u.id === currentUser?.organizationalUnit);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>Pathways</h1>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{currentUser.name}</div>
            <div className={styles.userUnit}>{userUnit?.name || 'No Unit'}</div>
          </div>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

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
                to="/app/organization"
                className={`${styles.navItem} ${isActive('/app/organization') ? styles.active : ''}`}
              >
                <Building2 className={styles.navItemIcon} size={18} />
                Organization
              </Link>
              <Link
                to="/app"
                className={`${styles.navItem} ${isActive('/app') || isActive('/app/') ? styles.active : ''}`}
              >
                <List className={styles.navItemIcon} size={18} />
                Backlog
              </Link>
              <Link
                to="/app/projects"
                className={`${styles.navItem} ${isActive('/app/projects') ? styles.active : ''}`}
              >
                <FolderKanban className={styles.navItemIcon} size={18} />
                Projects
              </Link>
              <Link
                to="/app/my-refinements"
                className={`${styles.navItem} ${isActive('/app/my-refinements') ? styles.active : ''}`}
              >
                <ClipboardList className={styles.navItemIcon} size={18} />
                My Refinements
              </Link>
              <Link
                to="/app/roadmap"
                className={`${styles.navItem} ${isActive('/app/roadmap') ? styles.active : ''}`}
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
                to="/app/team/priorities"
                className={`${styles.navItem} ${isActive('/app/team/priorities') ? styles.active : ''}`}
              >
                <ListChecks className={styles.navItemIcon} size={18} />
                Priorities
              </Link>
              <Link
                to="/app/team/boards"
                className={`${styles.navItem} ${isActive('/app/team/boards') ? styles.active : ''}`}
              >
                <Kanban className={styles.navItemIcon} size={18} />
                Boards
              </Link>
              <Link
                to="/app/team/analysis"
                className={`${styles.navItem} ${isActive('/app/team/analysis') ? styles.active : ''}`}
              >
                <BarChart3 className={styles.navItemIcon} size={18} />
                Analysis
              </Link>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className={styles.section}>
          <button
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTitle}>Settings</span>
            <span className={styles.sectionIcon}>
              {settingsExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </button>
          
          {settingsExpanded && (
            <div className={styles.sectionContent}>
              <Link
                to="/app/users"
                className={`${styles.navItem} ${isActive('/app/users') ? styles.active : ''}`}
              >
                <Users className={styles.navItemIcon} size={18} />
                Users
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

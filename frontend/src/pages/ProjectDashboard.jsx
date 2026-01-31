import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/projectsStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { AlertCircle, Calendar, Users, Target, TrendingUp, ArrowLeft, Network, Clock, BarChart3 } from 'lucide-react';
import { Button, Badge, HelpTooltip } from '../components/ui';
import { PageHeader } from '../components/layout/Layout';
import { formatDate } from '../utils/dateUtils';
import { API_BASE_URL } from '../config';
import styles from './ProjectDashboard.module.css';

export function ProjectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, objectives, fetchProjects, fetchObjectives } = useProjectsStore();
  const { workItems, fetchWorkItems } = useWorkItemsStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dependencies, setDependencies] = useState([]);
  const [forecast, setForecast] = useState(null);
  
  const project = projects.find(p => p.id === projectId);
  const projectObjectives = objectives.filter(obj => obj.projectId === projectId);
  const projectWorkItems = workItems.filter(wi => wi.projectId === projectId);
  
  useEffect(() => {
    loadProjectData();
  }, [projectId]);
  
  async function loadProjectData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchProjects(),
        fetchObjectives(),
        fetchWorkItems(),
        loadDependencies(),
        loadForecast()
      ]);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadDependencies() {
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies`);
      if (!response.ok) throw new Error('Failed to fetch dependencies');
      const data = await response.json();
      
      // Filter dependencies for this project's objectives
      const objectiveIds = projectObjectives.map(obj => obj.id);
      const projectDeps = data.filter(dep => 
        objectiveIds.includes(dep.predecessorId) || objectiveIds.includes(dep.successorId)
      );
      setDependencies(projectDeps);
    } catch (error) {
      console.error('Failed to load dependencies:', error);
    }
  }
  
  async function loadForecast() {
    try {
      const response = await fetch(`${API_BASE_URL}/forecasts/project/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch forecast');
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Failed to load forecast:', error);
    }
  }
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading project...</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Project not found</div>
      </div>
    );
  }
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'dependencies', label: 'Dependencies', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users }
  ];
  
  return (
    <div className={styles.container}>
      <PageHeader
        title={project.title}
        description={project.description}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/roadmap')}
            icon={ArrowLeft}
          >
            Back to Roadmap
          </Button>
        }
      />
      
      <div className={styles.content}>
        {/* Project Status Bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <Calendar size={16} />
            <div>
              <div className={styles.statusLabel}>Target Date</div>
              <div className={styles.statusValue}>
                {project.targetDate ? formatDate(project.targetDate, 'MMM dd, yyyy') : 'Not set'}
              </div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <Target size={16} />
            <div>
              <div className={styles.statusLabel}>Objectives</div>
              <div className={styles.statusValue}>{projectObjectives.length}</div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <BarChart3 size={16} />
            <div>
              <div className={styles.statusLabel}>Work Items</div>
              <div className={styles.statusValue}>{projectWorkItems.length}</div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <TrendingUp size={16} />
            <div>
              <div className={styles.statusLabel}>Status</div>
              <div className={styles.statusValue}>
                <Badge 
                  variant={
                    project.status === 'Completed' ? 'success' :
                    project.status === 'Active' ? 'primary' :
                    project.status === 'Planning' ? 'warning' : 'secondary'
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
          
          {project.budget && (
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>Budget</div>
              <div className={styles.statusValue}>
                ${project.budget.toLocaleString()}
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <OverviewTab
              project={project}
              objectives={projectObjectives}
              workItems={projectWorkItems}
              forecast={forecast}
            />
          )}
          
          {activeTab === 'dependencies' && (
            <DependenciesTab
              project={project}
              objectives={projectObjectives}
              dependencies={dependencies}
            />
          )}
          
          {activeTab === 'timeline' && (
            <TimelineTab
              project={project}
              objectives={projectObjectives}
              workItems={projectWorkItems}
              forecast={forecast}
            />
          )}
          
          {activeTab === 'team' && (
            <TeamTab
              project={project}
              objectives={projectObjectives}
              workItems={projectWorkItems}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW TAB
// ============================================
function OverviewTab({ project, objectives, workItems, forecast }) {
  // Calculate completion stats
  const completedObjectives = objectives.filter(obj => obj.status === 'Completed').length;
  const completedWorkItems = workItems.filter(wi => wi.status === 'Done').length;
  
  const objectiveCompletion = objectives.length > 0 
    ? Math.round((completedObjectives / objectives.length) * 100) 
    : 0;
  const workItemCompletion = workItems.length > 0
    ? Math.round((completedWorkItems / workItems.length) * 100)
    : 0;
  
  // Group objectives by tier
  const objectivesByTier = objectives.reduce((acc, obj) => {
    acc[obj.fromTier] = (acc[obj.fromTier] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className={styles.overviewTab}>
      <div className={styles.overviewGrid}>
        {/* Completion Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Completion Status</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Objectives</span>
                <span className={styles.progressPercent}>{objectiveCompletion}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${objectiveCompletion}%` }}
                />
              </div>
              <div className={styles.progressStats}>
                {completedObjectives} of {objectives.length} completed
              </div>
            </div>
            
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Work Items</span>
                <span className={styles.progressPercent}>{workItemCompletion}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${workItemCompletion}%` }}
                />
              </div>
              <div className={styles.progressStats}>
                {completedWorkItems} of {workItems.length} done
              </div>
            </div>
          </div>
        </div>
        
        {/* Forecast Card */}
        {forecast && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Forecast</h3>
              <HelpTooltip content="AI-powered completion prediction based on team velocity and work remaining" />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.forecastItem}>
                <div className={styles.forecastLabel}>Estimated Completion</div>
                <div className={styles.forecastValue}>
                  {forecast.estimatedDate 
                    ? formatDate(forecast.estimatedDate, 'MMM dd, yyyy')
                    : 'Calculating...'
                  }
                </div>
              </div>
              
              {forecast.confidence && (
                <div className={styles.forecastItem}>
                  <div className={styles.forecastLabel}>Confidence</div>
                  <div className={styles.forecastValue}>
                    <Badge variant={
                      forecast.confidence >= 80 ? 'success' :
                      forecast.confidence >= 60 ? 'warning' : 'danger'
                    }>
                      {forecast.confidence}%
                    </Badge>
                  </div>
                </div>
              )}
              
              {forecast.alerts && forecast.alerts.length > 0 && (
                <div className={styles.alertsSection}>
                  <div className={styles.alertsLabel}>
                    <AlertCircle size={14} />
                    Alerts
                  </div>
                  {forecast.alerts.map((alert, idx) => (
                    <div key={idx} className={styles.alert}>
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Objectives Breakdown Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Objectives by Tier</h3>
          </div>
          <div className={styles.cardBody}>
            {Object.entries(objectivesByTier)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([tier, count]) => (
                <div key={tier} className={styles.tierRow}>
                  <Badge variant="secondary">Tier {tier}</Badge>
                  <span className={styles.tierCount}>{count} objectives</span>
                </div>
              ))}
          </div>
        </div>
        
        {/* Recent Activity Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Recent Activity</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.activityList}>
              {workItems
                .filter(wi => wi.completedAt)
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, 5)
                .map(wi => (
                  <div key={wi.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>✓</div>
                    <div>
                      <div className={styles.activityTitle}>{wi.title}</div>
                      <div className={styles.activityDate}>
                        Completed {formatDate(wi.completedAt, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                ))}
              
              {workItems.filter(wi => wi.completedAt).length === 0 && (
                <div className={styles.emptyState}>No completed work items yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DEPENDENCIES TAB
// ============================================
function DependenciesTab({ project, objectives, dependencies }) {
  return (
    <div className={styles.dependenciesTab}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Dependency Network</h3>
          <HelpTooltip content="Visual representation of dependencies between objectives in this project" />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.placeholder}>
            <Network size={48} className={styles.placeholderIcon} />
            <p>Dependency network visualization coming soon</p>
            <p className={styles.placeholderSubtext}>
              Will show objectives as nodes with dependency arrows
            </p>
          </div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Dependencies List ({dependencies.length})</h3>
        </div>
        <div className={styles.cardBody}>
          {dependencies.length > 0 ? (
            <div className={styles.dependenciesList}>
              {dependencies.map(dep => {
                const predecessor = objectives.find(obj => obj.id === dep.predecessorId);
                const successor = objectives.find(obj => obj.id === dep.successorId);
                
                return (
                  <div key={dep.id} className={styles.dependencyItem}>
                    <div className={styles.dependencyType}>
                      <Badge variant="secondary" size="sm">{dep.type}</Badge>
                    </div>
                    <div className={styles.dependencyFlow}>
                      <div className={styles.dependencyNode}>
                        {predecessor?.title || 'Unknown'}
                      </div>
                      <div className={styles.dependencyArrow}>→</div>
                      <div className={styles.dependencyNode}>
                        {successor?.title || 'Unknown'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>No dependencies defined for this project</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TIMELINE TAB
// ============================================
function TimelineTab({ project, objectives, workItems, forecast }) {
  return (
    <div className={styles.timelineTab}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Project Timeline</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.placeholder}>
            <Calendar size={48} className={styles.placeholderIcon} />
            <p>Detailed timeline view coming soon</p>
            <p className={styles.placeholderSubtext}>
              Will show Gantt chart with objectives and work items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEAM TAB
// ============================================
function TeamTab({ project, objectives, workItems }) {
  return (
    <div className={styles.teamTab}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Team Assignments</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.placeholder}>
            <Users size={48} className={styles.placeholderIcon} />
            <p>Team capacity and assignments coming soon</p>
            <p className={styles.placeholderSubtext}>
              Will show organizational units, capacity, and workload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;

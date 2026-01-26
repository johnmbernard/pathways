import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/projectsStore';
import { AlertCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Button, HelpTooltip } from '../components/ui';
import { PageHeader } from '../components/layout/Layout';
import { formatDate } from '../utils/dateUtils';
import { API_BASE_URL } from '../config';
import styles from './RoadmapPage.module.css';

function parseYmd(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / ms);
}

function formatHeaderDate(dt) {
  return formatDate(dt, 'MM/dd');
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectsStore();
  const [forecasts, setForecasts] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  // Load projects and forecasts
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProjects();
      setLoading(false);
    };
    loadData();
  }, [fetchProjects]);

  // Load forecasts for each project
  React.useEffect(() => {
    const loadForecasts = async () => {
      const forecastData = {};
      for (const project of projects) {
        try {
          const response = await fetch(`${API_BASE_URL}/forecasts/project/${project.id}`);
          if (response.ok) {
            forecastData[project.id] = await response.json();
          }
        } catch (error) {
          console.error(`Failed to load forecast for project ${project.id}:`, error);
        }
      }
      setForecasts(forecastData);
    };

    if (projects.length > 0) {
      loadForecasts();
    }
  }, [projects]);

  // Determine timeline range from all projects
  const allDates = [];
  const today = new Date();
  
  projects.forEach(project => {
    if (project.targetDate) {
      allDates.push(parseYmd(project.targetDate));
    }
    const forecast = forecasts[project.id];
    if (forecast?.estimatedDate) {
      allDates.push(parseYmd(forecast.estimatedDate));
    }
  });
  
  let minDate, maxDate;
  if (allDates.length) {
    minDate = new Date(Math.min(today.getTime(), ...allDates.map(d => d.getTime())));
    maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  } else {
    minDate = new Date(today.setHours(0, 0, 0, 0));
    maxDate = new Date(minDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
  }
  
  // Ensure at least 30 days visible
  if (daysBetween(minDate, maxDate) < 30) {
    maxDate = new Date(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const weekWidth = 50; // px per week
  const totalDays = Math.max(1, daysBetween(minDate, maxDate) + 1);
  const totalWeeks = Math.ceil(totalDays / 7);
  const timelineWidth = totalWeeks * weekWidth;

  // Calculate status for each project
  const getProjectStatus = (project) => {
    const forecast = forecasts[project.id];
    if (!forecast) return { status: 'unknown', variance: null };
    
    if (!project.targetDate) {
      return { status: 'no_target', variance: null };
    }
    
    const targetDate = parseYmd(project.targetDate);
    const estimatedDate = parseYmd(forecast.estimatedDate);
    
    if (!targetDate || !estimatedDate) {
      return { status: 'unknown', variance: null };
    }
    
    const varianceDays = daysBetween(targetDate, estimatedDate);
    
    if (varianceDays <= 0) {
      return { status: 'on_track', variance: varianceDays };
    } else if (varianceDays <= 7) {
      return { status: 'at_risk', variance: varianceDays };
    } else {
      return { status: 'critical', variance: varianceDays };
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader title="Roadmap" subtitle="Project timelines with lead time forecasting" />
        <div className={styles.loading}>
          <div className={styles.loadingText}>Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Roadmap
            <HelpTooltip
              title="Project Roadmap"
              content={
                <div>
                  <p><strong>Visual timeline</strong> of all projects showing target dates and forecasted completion.</p>
                  <p><strong>Features:</strong></p>
                  <ul>
                    <li><strong>Target Dates (Blue):</strong> Leadership-defined project deadlines</li>
                    <li><strong>Forecasted Dates (Purple):</strong> Data-driven predictions based on historical lead times</li>
                    <li><strong>Status Indicators:</strong> Green (on track), Yellow (at risk), Red (delayed)</li>
                  </ul>
                  <p>Forecasts use your organization's actual historical data to predict realistic completion times.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
        subtitle="Project timelines with lead time forecasting"
        actions={
          <Button onClick={() => navigate('/app/projects')} variant="secondary">
            Manage Projects
          </Button>
        }
      />

      <div className={styles.container}>
        {/* Legend */}
        <div className={styles.legendCard}>
          <h3 className={styles.legendTitle}>Legend</h3>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBar} ${styles.legendBarBlue}`} />
              <span className={styles.legendText}>Target Date (Leadership)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBar} ${styles.legendBarPurple}`} />
              <span className={styles.legendText}>Calculated Forecast (Lead Time)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendDotGreen}`} />
              <span className={styles.legendText}>On Track</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendDotYellow}`} />
              <span className={styles.legendText}>At Risk (1-7 days late)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendDotRed}`} />
              <span className={styles.legendText}>Critical (&gt;7 days late)</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No projects found</p>
            <Button onClick={() => navigate('/app/projects')}>
              Create a Project
            </Button>
          </div>
        ) : (
          <>
            {projects.map(project => {
              const forecast = forecasts[project.id];
              const projectStatus = getProjectStatus(project);
              const targetDate = project.targetDate ? parseYmd(project.targetDate) : null;
              const estimatedDate = forecast?.estimatedDate ? parseYmd(forecast.estimatedDate) : null;
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              
              // Calculate positions on timeline
              const todayOffset = daysBetween(minDate, todayDate);
              const todayWeek = Math.floor(todayOffset / 7);
              const todayPos = todayWeek * weekWidth;
              
              const targetOffset = targetDate ? daysBetween(minDate, targetDate) : null;
              const targetWeek = targetOffset !== null ? Math.floor(targetOffset / 7) : null;
              const targetPos = targetWeek !== null ? targetWeek * weekWidth : null;
              
              const estimatedOffset = estimatedDate ? daysBetween(minDate, estimatedDate) : null;
              const estimatedWeek = estimatedOffset !== null ? Math.floor(estimatedOffset / 7) : null;
              const estimatedPos = estimatedWeek !== null ? estimatedWeek * weekWidth : null;
              
              return (
                <div key={project.id} className={styles.projectCard}>
                  {/* Project Header */}
                  <div className={styles.projectHeader}>
                    <div className={styles.projectHeaderContent}>
                      <div className={styles.projectHeaderLeft}>
                        <div className={styles.projectTitleRow}>
                          <h3 className={styles.projectTitle}>{project.title}</h3>
                          {projectStatus.status !== 'unknown' && projectStatus.status !== 'no_target' && (
                            <div className={`${styles.statusDot} ${
                              projectStatus.status === 'on_track' ? styles.statusDotGreen :
                              projectStatus.status === 'at_risk' ? styles.statusDotYellow :
                              styles.statusDotRed
                            }`} />
                          )}
                        </div>
                        {project.description && (
                          <p className={styles.projectDescription}>{project.description}</p>
                        )}
                      </div>
                      
                      <div className={styles.projectMetrics}>
                        {project.targetDate && (
                          <div className={styles.metricBox}>
                            <Calendar size={16} className={styles.metricIcon} style={{ color: '#3b82f6' }} />
                            <div className={styles.metricContent}>
                              <div className={styles.metricLabel}>Target</div>
                              <div className={styles.metricValue}>{formatDate(project.targetDate, 'MMM dd, yyyy')}</div>
                            </div>
                          </div>
                        )}
                        
                        {forecast?.estimatedDate && (
                          <div className={styles.metricBox}>
                            <TrendingUp size={16} className={styles.metricIcon} style={{ color: '#8b5cf6' }} />
                            <div className={styles.metricContent}>
                              <div className={styles.metricLabel}>Forecast</div>
                              <div className={styles.metricValue}>{formatDate(forecast.estimatedDate, 'MMM dd, yyyy')}</div>
                            </div>
                          </div>
                        )}
                        
                        {forecast?.leadTimeWeeks !== undefined && (
                          <div className={styles.metricBox}>
                            <Clock size={16} className={styles.metricIcon} style={{ color: '#9ca3af' }} />
                            <div className={styles.metricContent}>
                              <div className={styles.metricLabel}>Lead Time</div>
                              <div className={styles.metricValue}>{forecast.leadTimeWeeks} weeks</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Message */}
                    {projectStatus.status === 'at_risk' && (
                      <div className={`${styles.statusMessage} ${styles.statusMessageWarning}`}>
                        <AlertCircle size={16} className={styles.statusMessageIcon} style={{ color: '#d97706' }} />
                        <div className={styles.statusMessageText}>
                          Forecast is <strong>{Math.abs(projectStatus.variance)} days late</strong>. Consider reducing scope or increasing capacity.
                        </div>
                      </div>
                    )}
                    
                    {projectStatus.status === 'critical' && (
                      <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>
                        <AlertCircle size={16} className={styles.statusMessageIcon} style={{ color: '#dc2626' }} />
                        <div className={styles.statusMessageText}>
                          Forecast is <strong>{Math.abs(projectStatus.variance)} days late</strong>. Immediate action required.
                        </div>
                      </div>
                    )}
                    
                    {projectStatus.status === 'on_track' && (
                      <div className={`${styles.statusMessage} ${styles.statusMessageSuccess}`}>
                        <div className={`${styles.statusDot} ${styles.statusDotGreen}`} style={{ marginTop: '0.125rem' }} />
                        <div className={styles.statusMessageText}>
                          On track to complete on or before target date.
                        </div>
                      </div>
                    )}
                    
                    {projectStatus.status === 'no_target' && (
                      <div className={`${styles.statusMessage} ${styles.statusMessageNeutral}`}>
                        <Calendar size={16} className={styles.statusMessageIcon} style={{ color: '#9ca3af' }} />
                        <div className={styles.statusMessageText}>
                          No target date set. Forecast completion: <strong>{forecast?.estimatedDate ? formatDate(forecast.estimatedDate, 'MMM dd, yyyy') : 'N/A'}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timeline Visualization */}
                  <div className={styles.timelineSection}>
                    <div className={styles.timelineContainer}>
                      {/* Timeline background */}
                      <div className={styles.timelineGrid} style={{ width: timelineWidth }}>
                        {Array.from({ length: totalWeeks }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`${styles.timelineColumn} ${i % 4 === 0 ? styles.timelineColumnMonth : ''}`}
                            style={{ width: weekWidth }}
                          >
                            {i % 4 === 0 && (
                              <div className={styles.timelineLabel}>
                                {formatHeaderDate(new Date(minDate.getTime() + i * 7 * 24 * 60 * 60 * 1000))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Today marker */}
                      <div 
                        className={styles.todayMarker}
                        style={{ left: todayPos }}
                        title="Today"
                      >
                        <div className={styles.todayDot} />
                      </div>
                      
                      {/* Target date bar */}
                      {targetPos !== null && (
                        <div
                          className={`${styles.timelineBar} ${styles.timelineBarTarget}`}
                          style={{ 
                            left: Math.max(todayPos, 0), 
                            width: Math.max(weekWidth, targetPos - Math.max(todayPos, 0)),
                            top: 24,
                            height: 10
                          }}
                          title={`Target: ${formatDate(project.targetDate, 'MMM dd, yyyy')}`}
                        />
                      )}
                      
                      {/* Forecast bar */}
                      {estimatedPos !== null && (
                        <div
                          className={`${styles.timelineBar} ${styles.timelineBarForecast}`}
                          style={{ 
                            left: Math.max(todayPos, 0), 
                            width: Math.max(weekWidth, estimatedPos - Math.max(todayPos, 0)),
                            top: 40,
                            height: 10
                          }}
                          title={`Forecast: ${formatDate(forecast?.estimatedDate, 'MMM dd, yyyy')}`}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Alerts & Objectives Summary */}
                  {forecast?.objectiveForecasts && forecast.objectiveForecasts.length > 0 && (
                    <div className={styles.objectivesSection}>
                      {(() => {
                        // Collect all alerts across objectives
                        const allAlerts = forecast.objectiveForecasts.flatMap(obj => 
                          (obj.alerts || []).map(alert => ({ ...alert, objectiveTitle: obj.objectiveTitle }))
                        );
                        const hasAlerts = allAlerts.length > 0;
                        
                        return (
                          <>
                            <h4 className={styles.objectivesTitle}>
                              {hasAlerts ? `Alerts (${allAlerts.length})` : `Objectives (${forecast.objectiveForecasts.length})`}
                            </h4>
                            
                            {hasAlerts ? (
                              <div className={styles.objectivesList}>
                                {allAlerts.slice(0, 4).map((alert, idx) => (
                                  <div 
                                    key={`${alert.workItemId || alert.type}-${idx}`} 
                                    className={styles.alertItem}
                                    data-severity={alert.severity}
                                    onClick={() => {
                                      if (alert.workItemId) {
                                        // Navigate to backlog with work item highlighted
                                        navigate(`/?highlight=${alert.workItemId}`);
                                      }
                                    }}
                                    style={{ cursor: alert.workItemId ? 'pointer' : 'default' }}
                                  >
                                    <div className={styles.alertIcon}>
                                      {alert.type === 'blocked' ? '🚧' : alert.type === 'stuck' ? '⚠️' : '📅'}
                                    </div>
                                    <div className={styles.alertContent}>
                                      <div className={styles.alertTitle}>{alert.message}</div>
                                      <div className={styles.alertMeta}>
                                        {alert.objectiveTitle}
                                        {alert.workItemId && <span className={styles.clickHint}> • Click to view</span>}
                                      </div>
                                    </div>
                                    <div className={styles.alertBadge} data-severity={alert.severity}>
                                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                                    </div>
                                  </div>
                                ))}
                                {allAlerts.length > 4 && (
                                  <div className={styles.objectivesMore}>
                                    +{allAlerts.length - 4} more alerts
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={styles.objectivesList}>
                                {forecast.objectiveForecasts.slice(0, 3).map((obj) => (
                                  <div key={obj.objectiveId} className={styles.objectiveItem}>
                                    <span className={styles.objectiveName}>{obj.objectiveTitle}</span>
                                    <span className={styles.objectiveWeeks}>{obj.leadTimeWeeks} weeks</span>
                                  </div>
                                ))}
                                {forecast.objectiveForecasts.length > 3 && (
                                  <div className={styles.objectivesMore}>
                                    +{forecast.objectiveForecasts.length - 3} more objectives
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

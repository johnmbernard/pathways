import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/projectsStore';
import { useWorkItemsStore } from '../store/workItemsStore';
import { AlertCircle, Calendar, TrendingUp, Clock, ChevronRight, ChevronDown, FolderOpen, Target, CheckSquare } from 'lucide-react';
import { Button, Badge, HelpTooltip } from '../components/ui';
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
  return formatDate(dt, 'MMM yyyy');
}

// Work Item Row Component
function WorkItemRow({ workItem, minDate, maxDate, timelineWidth, totalWeeks, weekWidth, depth = 2 }) {
  const targetDate = workItem.targetDate ? parseYmd(workItem.targetDate) : null;
  const startDate = workItem.createdAt ? new Date(workItem.createdAt) : new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const indentPixels = 24 + (depth * 24);
  
  let barLeft = 0, barWidth = 0;
  
  if (targetDate) {
    const startOffset = daysBetween(minDate, startDate);
    const endOffset = daysBetween(minDate, targetDate);
    const startWeek = Math.max(0, Math.floor(startOffset / 7));
    const endWeek = Math.floor(endOffset / 7);
    
    barLeft = startWeek * weekWidth;
    barWidth = Math.max(weekWidth, (endWeek - startWeek) * weekWidth);
  }
  
  const statusColors = {
    'To Do': '#94a3b8',
    'In Progress': '#3b82f6',
    'Done': '#10b981',
    'Blocked': '#ef4444'
  };
  
  return (
    <div className={styles.ganttRow}>
      <div className={styles.ganttLeft} style={{ paddingLeft: `${indentPixels}px` }}>
        <div className={styles.ganttItemIcon}>
          <CheckSquare size={14} />
        </div>
        <div className={styles.ganttItemTitle}>{workItem.title}</div>
        <div className={styles.ganttItemMeta}>
          <Badge variant="secondary" size="sm">{workItem.status}</Badge>
          {workItem.priority && (
            <Badge 
              variant={workItem.priority === 'P1' ? 'danger' : workItem.priority === 'P2' ? 'warning' : 'secondary'}
              size="sm"
            >
              {workItem.priority}
            </Badge>
          )}
          {workItem.estimatedEffort && (
            <span className={styles.effortBadge}>{workItem.estimatedEffort} pts</span>
          )}
        </div>
      </div>
      
      <div className={styles.ganttRight}>
        <div className={styles.ganttTimeline} style={{ width: timelineWidth }}>
          {targetDate && (
            <div
              className={styles.ganttBar}
              style={{
                left: barLeft,
                width: barWidth,
                backgroundColor: statusColors[workItem.status] || '#94a3b8'
              }}
              title={`${workItem.title} - Due: ${formatDate(workItem.targetDate, 'MMM dd, yyyy')}`}
            >
              <span className={styles.ganttBarLabel}>{workItem.title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Objective Row Component
function ObjectiveRow({ objective, allObjectives, workItems, minDate, maxDate, timelineWidth, totalWeeks, weekWidth, forecast, depth = 1 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const childObjectives = allObjectives.filter(obj => obj.parentObjectiveId === objective.id);
  const objectiveWorkItems = workItems.filter(wi => wi.objectiveId === objective.id);
  
  const hasChildren = childObjectives.length > 0;
  const hasWorkItems = objectiveWorkItems.length > 0 && !hasChildren;
  const hasContent = hasChildren || hasWorkItems;
  
  const indentPixels = 24 + (depth * 24);
  
  // Calculate date range for this objective
  const targetDate = objective.targetDate ? parseYmd(objective.targetDate) : null;
  const startDate = objective.createdAt ? new Date(objective.createdAt) : new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Get forecast for this specific objective
  const objForecast = forecast?.objectiveForecasts?.find(of => of.objectiveId === objective.id);
  const forecastDate = objForecast?.estimatedDate ? parseYmd(objForecast.estimatedDate) : null;
  const forecastStartDate = objForecast?.consolidatedStart ? parseYmd(objForecast.consolidatedStart) : null;
  const forecastFinishDate = objForecast?.consolidatedFinish ? parseYmd(objForecast.consolidatedFinish) : null;
  
  // Debug logging
  if (objForecast) {
    console.log(`Objective: ${objective.title}`, {
      consolidatedStart: objForecast.consolidatedStart,
      consolidatedFinish: objForecast.consolidatedFinish,
      forecastStartDate,
      forecastFinishDate
    });
  }
  
  let targetBarLeft = 0, targetBarWidth = 0;
  let forecastBarLeft = 0, forecastBarWidth = 0;
  
  if (targetDate) {
    const startOffset = daysBetween(minDate, startDate);
    const endOffset = daysBetween(minDate, targetDate);
    const startWeek = Math.max(0, Math.floor(startOffset / 7));
    const endWeek = Math.floor(endOffset / 7);
    
    targetBarLeft = startWeek * weekWidth;
    targetBarWidth = Math.max(weekWidth, (endWeek - startWeek) * weekWidth);
  }
  
  // Use consolidatedStart and consolidatedFinish from forecast for accurate positioning
  if (forecastStartDate && forecastFinishDate) {
    const startOffset = daysBetween(minDate, forecastStartDate);
    const endOffset = daysBetween(minDate, forecastFinishDate);
    const startWeek = Math.max(0, Math.floor(startOffset / 7));
    const endWeek = Math.floor(endOffset / 7);
    
    forecastBarLeft = startWeek * weekWidth;
    forecastBarWidth = Math.max(weekWidth, (endWeek - startWeek) * weekWidth);
  }
  
  const badgeVariants = ['primary', 'info', 'warning', 'secondary'];
  const badgeVariant = badgeVariants[objective.fromTier % badgeVariants.length];
  
  // Check for alerts
  const hasAlerts = objForecast?.alerts && objForecast.alerts.length > 0;
  
  return (
    <>
      <div className={styles.ganttRow}>
        <div className={styles.ganttLeft} style={{ paddingLeft: `${indentPixels}px` }}>
          <button
            onClick={() => hasContent && setIsExpanded(!isExpanded)}
            className={`${styles.expandButton} ${!hasContent ? styles.invisible : ''}`}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          <div className={styles.ganttItemIcon}>
            <Target size={16} />
          </div>
          
          <div className={styles.ganttItemTitle}>
            <strong>{objective.title}</strong>
            {hasAlerts && <AlertCircle size={14} className={styles.alertIcon} />}
          </div>
          
          <div className={styles.ganttItemMeta}>
            <Badge variant={badgeVariant} size="sm">Tier {objective.fromTier}</Badge>
            {hasChildren && <span className={styles.metaText}>{childObjectives.length} refined</span>}
            {hasWorkItems && <span className={styles.metaText}>{objectiveWorkItems.length} items</span>}
            {objForecast?.leadTimeWeeks && (
              <span className={styles.metaText}>{objForecast.leadTimeWeeks}w lead time</span>
            )}
          </div>
        </div>
        
        <div className={styles.ganttRight}>
          <div className={styles.ganttTimeline} style={{ width: timelineWidth }}>
            {targetDate && (
              <div
                className={`${styles.ganttBar} ${styles.ganttBarTarget}`}
                style={{
                  left: targetBarLeft,
                  width: targetBarWidth,
                  height: 12,
                  opacity: 0.9
                }}
                title={`Target: ${formatDate(objective.targetDate, 'MMM dd, yyyy')}`}
              >
                <span className={styles.ganttBarLabel}>{objective.title}</span>
              </div>
            )}
            {(forecastStartDate && forecastFinishDate) && (
              <div
                className={`${styles.ganttBar} ${styles.ganttBarForecast}`}
                style={{
                  left: forecastBarLeft,
                  width: forecastBarWidth,
                  height: 8,
                  marginTop: 14,
                  opacity: 0.8
                }}
                title={`Forecast: ${formatDate(objForecast.consolidatedStart, 'MMM dd, yyyy')} - ${formatDate(objForecast.consolidatedFinish, 'MMM dd, yyyy')}`}
              />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {childObjectives.map(childObj => (
            <ObjectiveRow
              key={childObj.id}
              objective={childObj}
              allObjectives={allObjectives}
              workItems={workItems}
              minDate={minDate}
              maxDate={maxDate}
              timelineWidth={timelineWidth}
              totalWeeks={totalWeeks}
              weekWidth={weekWidth}
              forecast={forecast}
              depth={depth + 1}
            />
          ))}
          
          {!hasChildren && objectiveWorkItems.map(workItem => (
            <WorkItemRow
              key={workItem.id}
              workItem={workItem}
              minDate={minDate}
              maxDate={maxDate}
              timelineWidth={timelineWidth}
              totalWeeks={totalWeeks}
              weekWidth={weekWidth}
              depth={depth + 1}
            />
          ))}
        </>
      )}
    </>
  );
}

// Project Row Component
function ProjectRow({ project, objectives, workItems, minDate, maxDate, timelineWidth, totalWeeks, weekWidth, forecast }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const rootObjectives = objectives.filter(obj => !obj.parentObjectiveId);
  const hasObjectives = rootObjectives.length > 0;
  
  // Calculate project date range
  const targetDate = project.targetDate ? parseYmd(project.targetDate) : null;
  const startDate = project.startDate ? parseYmd(project.startDate) : (project.createdAt ? new Date(project.createdAt) : new Date());
  startDate.setHours(0, 0, 0, 0);
  
  const forecastDate = forecast?.estimatedDate ? parseYmd(forecast.estimatedDate) : null;
  
  let targetBarLeft = 0, targetBarWidth = 0;
  let forecastBarLeft = 0, forecastBarWidth = 0;
  
  if (targetDate) {
    const startOffset = daysBetween(minDate, startDate);
    const endOffset = daysBetween(minDate, targetDate);
    const startWeek = Math.max(0, Math.floor(startOffset / 7));
    const endWeek = Math.floor(endOffset / 7);
    
    targetBarLeft = startWeek * weekWidth;
    targetBarWidth = Math.max(weekWidth * 2, (endWeek - startWeek) * weekWidth);
  }
  
  if (forecastDate) {
    const startOffset = daysBetween(minDate, startDate);
    const endOffset = daysBetween(minDate, forecastDate);
    const startWeek = Math.max(0, Math.floor(startOffset / 7));
    const endWeek = Math.floor(endOffset / 7);
    
    forecastBarLeft = startWeek * weekWidth;
    forecastBarWidth = Math.max(weekWidth * 2, (endWeek - startWeek) * weekWidth);
  }
  
  // Calculate status
  const getStatus = () => {
    if (!forecast || !targetDate || !forecastDate) return 'unknown';
    
    const varianceDays = daysBetween(targetDate, forecastDate);
    if (varianceDays <= 0) return 'on_track';
    if (varianceDays <= 7) return 'at_risk';
    return 'critical';
  };
  
  const status = getStatus();
  
  // Count alerts
  const allAlerts = forecast?.objectiveForecasts?.flatMap(of => of.alerts || []) || [];
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical').length;
  
  return (
    <>
      <div className={styles.ganttRow} data-type="project">
        <div className={styles.ganttLeft}>
          <button
            onClick={() => hasObjectives && setIsExpanded(!isExpanded)}
            className={`${styles.expandButton} ${!hasObjectives ? styles.invisible : ''}`}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <div className={styles.ganttItemIcon}>
            <FolderOpen size={20} />
          </div>
          
          <div className={styles.ganttItemTitle}>
            <strong>{project.title}</strong>
            {status !== 'unknown' && (
              <div className={`${styles.statusDot} ${
                status === 'on_track' ? styles.statusDotGreen :
                status === 'at_risk' ? styles.statusDotYellow :
                styles.statusDotRed
              }`} />
            )}
          </div>
          
          <div className={styles.ganttItemMeta}>
            {rootObjectives.length > 0 && (
              <span className={styles.metaText}>{objectives.length} objectives</span>
            )}
            {workItems.length > 0 && (
              <span className={styles.metaText}>{workItems.length} work items</span>
            )}
            {criticalAlerts > 0 && (
              <Badge variant="danger" size="sm">{criticalAlerts} alerts</Badge>
            )}
            {forecast?.leadTimeWeeks && (
              <span className={styles.metaText}>{forecast.leadTimeWeeks}w lead time</span>
            )}
          </div>
        </div>
        
        <div className={styles.ganttRight}>
          <div className={styles.ganttTimeline} style={{ width: timelineWidth }}>
            {targetDate && (
              <div
                className={`${styles.ganttBar} ${styles.ganttBarTarget}`}
                style={{
                  left: targetBarLeft,
                  width: targetBarWidth,
                  height: 16
                }}
                title={`Target: ${formatDate(project.targetDate, 'MMM dd, yyyy')}`}
              >
                <span className={styles.ganttBarLabel}>{project.title}</span>
              </div>
            )}
            {forecastDate && (
              <div
                className={`${styles.ganttBar} ${styles.ganttBarForecast}`}
                style={{
                  left: forecastBarLeft,
                  width: forecastBarWidth,
                  height: 12,
                  marginTop: 18
                }}
                title={`Forecast: ${formatDate(forecast.estimatedDate, 'MMM dd, yyyy')}`}
              />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && rootObjectives.map(rootObj => (
        <ObjectiveRow
          key={rootObj.id}
          objective={rootObj}
          allObjectives={objectives}
          workItems={workItems}
          minDate={minDate}
          maxDate={maxDate}
          timelineWidth={timelineWidth}
          totalWeeks={totalWeeks}
          weekWidth={weekWidth}
          forecast={forecast}
          depth={1}
        />
      ))}
    </>
  );
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectsStore();
  const { items: workItems, fetchWorkItems } = useWorkItemsStore();
  const [forecasts, setForecasts] = React.useState({});
  const [projectObjectives, setProjectObjectives] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  // Load projects and work items
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchWorkItems()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchProjects, fetchWorkItems]);

  // Load objectives for all projects
  React.useEffect(() => {
    const loadObjectives = async () => {
      if (projects.length === 0) return;
      
      const objectivesMap = {};
      for (const project of projects) {
        try {
          const response = await fetch(`${API_BASE_URL}/projects/${project.id}`);
          if (response.ok) {
            const projectData = await response.json();
            objectivesMap[project.id] = projectData.objectives || [];
          }
        } catch (error) {
          console.error(`Failed to fetch objectives for project ${project.id}:`, error);
          objectivesMap[project.id] = [];
        }
      }
      setProjectObjectives(objectivesMap);
    };
    loadObjectives();
  }, [projects]);

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

  // Determine timeline range from all projects, objectives, and work items
  const allDates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  projects.forEach(project => {
    if (project.targetDate) {
      allDates.push(parseYmd(project.targetDate));
    }
    const forecast = forecasts[project.id];
    if (forecast?.estimatedDate) {
      allDates.push(parseYmd(forecast.estimatedDate));
    }
    
    // Add objective dates
    const objectives = projectObjectives[project.id] || [];
    objectives.forEach(obj => {
      if (obj.targetDate) {
        allDates.push(parseYmd(obj.targetDate));
      }
    });
  });
  
  // Add work item dates
  workItems.forEach(item => {
    if (item.targetDate) {
      allDates.push(parseYmd(item.targetDate));
    }
  });
  
  let minDate, maxDate;
  if (allDates.length) {
    minDate = new Date(Math.min(today.getTime(), ...allDates.map(d => d.getTime())));
    maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  } else {
    minDate = new Date(today.getTime());
    maxDate = new Date(minDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
  }
  
  // Ensure at least 60 days visible
  if (daysBetween(minDate, maxDate) < 60) {
    maxDate = new Date(minDate.getTime() + 60 * 24 * 60 * 60 * 1000);
  }
  
  // Add padding
  minDate = new Date(minDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before
  maxDate = new Date(maxDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks after

  const weekWidth = 60; // px per week
  const totalDays = Math.max(1, daysBetween(minDate, maxDate) + 1);
  const totalWeeks = Math.ceil(totalDays / 7);
  const timelineWidth = totalWeeks * weekWidth;

  // Generate month labels for timeline header
  const monthLabels = [];
  let currentDate = new Date(minDate);
  let lastMonth = -1;
  
  for (let week = 0; week < totalWeeks; week++) {
    const weekDate = new Date(currentDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const month = weekDate.getMonth();
    const year = weekDate.getFullYear();
    
    if (month !== lastMonth) {
      monthLabels.push({
        week,
        label: formatHeaderDate(weekDate),
        position: week * weekWidth
      });
      lastMonth = month;
    }
  }

  // Calculate today's position
  const todayOffset = daysBetween(minDate, today);
  const todayWeek = Math.floor(todayOffset / 7);
  const todayPos = todayWeek * weekWidth;

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader title="Roadmap" subtitle="Project timelines with lead time forecasting" />
        <div className={styles.loading}>
          <div className={styles.loadingText}>Loading roadmap...</div>
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
              title="Gantt-Style Roadmap"
              content={
                <div>
                  <p><strong>Comprehensive timeline view</strong> of all projects, objectives, and work items.</p>
                  <p><strong>Features:</strong></p>
                  <ul>
                    <li><strong>Blue Bars:</strong> Target dates (leadership-defined deadlines)</li>
                    <li><strong>Purple Bars:</strong> Forecasted dates (data-driven predictions)</li>
                    <li><strong>Hierarchical View:</strong> Expand projects to see objectives and work items</li>
                    <li><strong>Status Indicators:</strong> Green (on track), Yellow (at risk), Red (critical)</li>
                    <li><strong>Alert Badges:</strong> Shows critical issues requiring attention</li>
                  </ul>
                  <p>Click expand/collapse arrows to view detailed breakdowns of each project.</p>
                </div>
              }
              size="medium"
            />
          </div>
        }
        subtitle="Project timelines with lead time forecasting"
        actions={
          <Button onClick={() => navigate('/app/projects')} variant="secondary">
            Initiate Projects
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

        {/* Gantt Chart */}
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No projects found</p>
            <Button onClick={() => navigate('/app/projects')}>
              Initiate a Project
            </Button>
          </div>
        ) : (
          <div className={styles.ganttContainer}>
            {/* Scrollable wrapper for both header and body */}
            <div className={styles.ganttScrollWrapper}>
              {/* Timeline Header */}
              <div className={styles.ganttHeader}>
                <div className={styles.ganttLeft}>
                  <strong>Projects & Objectives</strong>
                </div>
                <div className={styles.ganttRight}>
                  <div className={styles.ganttTimelineHeader} style={{ width: timelineWidth }}>
                    {/* Month labels */}
                    {monthLabels.map((label, idx) => (
                      <div
                        key={idx}
                        className={styles.monthLabel}
                        style={{ left: label.position }}
                      >
                        {label.label}
                      </div>
                    ))}
                    
                    {/* Week date labels */}
                    {Array.from({ length: totalWeeks }).map((_, week) => {
                      const weekDate = new Date(minDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
                      const month = weekDate.getMonth() + 1;
                      const day = weekDate.getDate();
                      const dateLabel = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
                      
                      return (
                        <div
                          key={`date-${week}`}
                          className={styles.weekDateLabel}
                          style={{ left: week * weekWidth }}
                          title={weekDate.toLocaleDateString()}
                        >
                          {dateLabel}
                        </div>
                      );
                    })}
                    
                    {/* Week grid lines */}
                    {Array.from({ length: totalWeeks }).map((_, week) => {
                      const isMonthStart = week % 4 === 0;
                      
                      return (
                        <div
                          key={`line-${week}`}
                          className={`${styles.weekLine} ${isMonthStart ? styles.weekLineMonth : ''}`}
                          style={{ left: week * weekWidth }}
                        />
                      );
                    })}
                    
                    {/* Today marker */}
                    {todayOffset >= 0 && todayOffset <= totalDays && (
                      <div
                        className={styles.todayLine}
                        style={{ left: todayPos }}
                      >
                        <div className={styles.todayLabel}>Today</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gantt Body */}
              <div className={styles.ganttBodyContent}>
                {projects.map(project => {
                const objectives = projectObjectives[project.id] || [];
                const projectWorkItems = workItems.filter(wi =>
                  objectives.some(obj => obj.id === wi.objectiveId)
                );
                const forecast = forecasts[project.id];
                
                return (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    objectives={objectives}
                    workItems={projectWorkItems}
                    minDate={minDate}
                    maxDate={maxDate}
                    timelineWidth={timelineWidth}
                    totalWeeks={totalWeeks}
                    weekWidth={weekWidth}
                    forecast={forecast}
                  />
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

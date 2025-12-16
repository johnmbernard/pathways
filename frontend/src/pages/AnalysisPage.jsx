import React, { useState, useEffect } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { PageHeader } from '../components/layout/Layout';
import { Badge } from '../components/ui';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  AlertCircle,
  BarChart3,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import styles from './AnalysisPage.module.css';

export default function AnalysisPage() {
  const { units, fetchUnits } = useOrganizationStore();
  const [loading, setLoading] = useState(true);
  const [allThroughput, setAllThroughput] = useState([]);
  const [teamForecasts, setTeamForecasts] = useState({});
  const [selectedView, setSelectedView] = useState('throughput'); // 'throughput' or 'forecasts'

  // Get all tier 3 teams (leaf units)
  const teams = units.filter(u => u.tier === 3);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  useEffect(() => {
    // Only fetch analysis data once units are loaded
    if (units.length > 0) {
      fetchAnalysisData();
    }
  }, [units]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      // Fetch all teams' throughput
      const throughputRes = await fetch(`${API_BASE_URL}/forecasts/throughput?weeks=6`);
      if (throughputRes.ok) {
        const data = await throughputRes.json();
        setAllThroughput(data.teams);
      }

      // Get tier 3 teams from the store
      const currentTeams = units.filter(u => u.tier === 3);
      console.log('Fetching forecasts for teams:', currentTeams.length);

      // Fetch forecast data for each team
      const forecastPromises = currentTeams.slice(0, 10).map(async (team) => { // Limit to first 10 for performance
        try {
          const [loadRes, backlogRes] = await Promise.all([
            fetch(`${API_BASE_URL}/forecasts/load/${team.id}`),
            fetch(`${API_BASE_URL}/forecasts/backlog/${team.id}`)
          ]);

          if (loadRes.ok && backlogRes.ok) {
            const loadData = await loadRes.json();
            const backlogData = await backlogRes.json();
            
            return {
              teamId: team.id,
              teamName: team.name,
              load: loadData,
              forecasts: backlogData.forecasts || []
            };
          }
        } catch (error) {
          console.error(`Error fetching data for team ${team.id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(forecastPromises);
      const forecastMap = {};
      results.filter(Boolean).forEach(result => {
        forecastMap[result.teamId] = result;
      });
      setTeamForecasts(forecastMap);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get team name from ID
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || teamId;
  };

  // Sort throughput data by throughput descending
  const sortedThroughput = [...allThroughput].sort((a, b) => b.throughput - a.throughput);

  // Calculate organization-wide metrics
  const orgMetrics = {
    totalTeams: allThroughput.length,
    avgThroughput: allThroughput.length > 0 
      ? (allThroughput.reduce((sum, t) => sum + t.throughput, 0) / allThroughput.length).toFixed(1)
      : 0,
    highPerformers: allThroughput.filter(t => t.throughput > 8).length,
    lowPerformers: allThroughput.filter(t => t.throughput < 5).length,
  };

  // Get P1 forecasts for next 30 days
  const getUpcomingP1Items = () => {
    const now = new Date();
    const thirtyDaysOut = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    console.log('Getting P1 items. teamForecasts:', Object.keys(teamForecasts).length, 'teams');
    
    const upcomingItems = [];
    
    Object.values(teamForecasts).forEach(teamData => {
      console.log(`Team ${teamData.teamName}:`, {
        totalForecasts: teamData.forecasts?.length,
        p1Count: teamData.forecasts?.filter(f => f.priority === 'P1').length
      });
      
      const p1Forecasts = teamData.forecasts
        ?.filter(f => f.priority === 'P1')
        .filter(f => {
          const estDate = new Date(f.estimatedDate);
          return estDate >= now && estDate <= thirtyDaysOut;
        })
        .map(f => ({
          ...f,
          teamId: teamData.teamId,
          teamName: teamData.teamName,
        })) || [];
      
      console.log(`  -> ${p1Forecasts.length} P1 items in next 30 days`);
      upcomingItems.push(...p1Forecasts);
    });
    
    console.log('Total upcoming P1 items:', upcomingItems.length);
    return upcomingItems.sort((a, b) => 
      new Date(a.estimatedDate) - new Date(b.estimatedDate)
    );
  };

  const upcomingP1 = getUpcomingP1Items();

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Team Analysis"
          subtitle="Throughput metrics and forecast visualization"
        />
        <div className={styles.loading}>
          <Activity className={styles.spinner} size={48} />
          <p>Loading analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Team Analysis"
        subtitle="Throughput metrics and forecast visualization"
      />

      <div className={styles.container}>
        {/* Organization Summary */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <BarChart3 size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Total Teams</div>
              <div className={styles.summaryValue}>{orgMetrics.totalTeams}</div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Avg Throughput</div>
              <div className={styles.summaryValue}>
                {orgMetrics.avgThroughput}
                <span className={styles.summaryUnit}>items/wk</span>
              </div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <CheckCircle2 size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>High Performers</div>
              <div className={styles.summaryValue}>
                {orgMetrics.highPerformers}
                <span className={styles.summaryUnit}>&gt;8/wk</span>
              </div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Needs Attention</div>
              <div className={styles.summaryValue}>
                {orgMetrics.lowPerformers}
                <span className={styles.summaryUnit}>&lt;5/wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className={styles.viewSelector}>
          <button
            className={`${styles.viewButton} ${selectedView === 'throughput' ? styles.viewButtonActive : ''}`}
            onClick={() => setSelectedView('throughput')}
          >
            <BarChart3 size={18} />
            Throughput Analysis
          </button>
          <button
            className={`${styles.viewButton} ${selectedView === 'forecasts' ? styles.viewButtonActive : ''}`}
            onClick={() => setSelectedView('forecasts')}
          >
            <Calendar size={18} />
            P1 Forecast (Next 30 Days)
          </button>
        </div>

        {/* Throughput View */}
        {selectedView === 'throughput' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={20} />
              Team Throughput (6-Week Average)
            </h2>
            <div className={styles.throughputGrid}>
              {sortedThroughput.map((team) => {
                const teamName = getTeamName(team.teamId);
                const teamLoad = teamForecasts[team.teamId]?.load;
                
                let performanceLevel = 'average';
                if (team.throughput > 8) performanceLevel = 'high';
                if (team.throughput < 5) performanceLevel = 'low';

                return (
                  <div key={team.teamId} className={styles.throughputCard}>
                    <div className={styles.throughputHeader}>
                      <div className={styles.throughputTeam}>{teamName}</div>
                      <Badge variant={
                        performanceLevel === 'high' ? 'success' :
                        performanceLevel === 'low' ? 'danger' : 'secondary'
                      }>
                        {performanceLevel}
                      </Badge>
                    </div>
                    
                    <div className={styles.throughputMetrics}>
                      <div className={styles.throughputMain}>
                        <div className={styles.throughputValue}>{team.throughput}</div>
                        <div className={styles.throughputLabel}>items/week</div>
                      </div>
                      
                      {teamLoad && (
                        <div className={styles.throughputDetails}>
                          <div className={styles.throughputDetail}>
                            <Clock size={14} />
                            <span>P1: {teamLoad.p1LoadWeeks}w</span>
                          </div>
                          <div className={styles.throughputDetail}>
                            <Activity size={14} />
                            <span>Total: {teamLoad.totalLoadWeeks}w</span>
                          </div>
                          <div className={styles.throughputDetail}>
                            <BarChart3 size={14} />
                            <span>{teamLoad.queue.total} items</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Throughput bar visualization */}
                    <div className={styles.throughputBar}>
                      <div 
                        className={`${styles.throughputBarFill} ${styles[`throughputBar${performanceLevel.charAt(0).toUpperCase() + performanceLevel.slice(1)}`]}`}
                        style={{ width: `${Math.min((team.throughput / 15) * 100, 100)}%` }}
                      />
                    </div>

                    <div className={styles.throughputFooter}>
                      Tracked: {team.weeksTracked} weeks
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* P1 Forecast View */}
        {selectedView === 'forecasts' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Calendar size={20} />
              P1 Items Forecasted to Complete (Next 30 Days)
            </h2>
            
            {upcomingP1.length === 0 ? (
              <div className={styles.emptyState}>
                <Calendar size={48} />
                <p>No P1 items forecasted in the next 30 days</p>
                <p className={styles.emptyStateSubtext}>
                  Either teams have no P1 items or completion is forecasted beyond 30 days
                </p>
              </div>
            ) : (
              <div className={styles.forecastTimeline}>
                {upcomingP1.map((item, index) => {
                  const daysUntil = Math.ceil(
                    (new Date(item.estimatedDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={`${item.teamId}-${item.workItemId}`} className={styles.forecastItem}>
                      <div className={styles.forecastDate}>
                        <div className={styles.forecastDateDay}>
                          {new Date(item.estimatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className={styles.forecastDateRelative}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                        </div>
                      </div>
                      
                      <div className={styles.forecastContent}>
                        <div className={styles.forecastTeam}>{item.teamName}</div>
                        <div className={styles.forecastPosition}>
                          Position #{item.queuePosition} in queue • {item.leadTimeWeeks}w lead time
                        </div>
                      </div>

                      <div className={styles.forecastBadges}>
                        <Badge variant="danger">P1</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Team-by-team breakdown */}
            <div className={styles.teamBreakdownSection}>
              <h3 className={styles.subsectionTitle}>P1 Queue by Team</h3>
              <div className={styles.teamBreakdownGrid}>
                {Object.values(teamForecasts)
                  .filter(team => team.load?.queue.p1 > 0)
                  .sort((a, b) => a.load.p1LoadWeeks - b.load.p1LoadWeeks)
                  .map(team => (
                    <div key={team.teamId} className={styles.teamBreakdownCard}>
                      <div className={styles.teamBreakdownHeader}>
                        <div className={styles.teamBreakdownName}>{team.teamName}</div>
                        <Badge variant="danger">{team.load.queue.p1} P1s</Badge>
                      </div>
                      
                      <div className={styles.teamBreakdownMetrics}>
                        <div className={styles.teamBreakdownMetric}>
                          <Clock size={14} />
                          <span>{team.load.p1LoadWeeks} weeks</span>
                        </div>
                        <div className={styles.teamBreakdownMetric}>
                          <TrendingUp size={14} />
                          <span>{team.load.throughput} items/wk</span>
                        </div>
                      </div>

                      <div className={styles.teamBreakdownBar}>
                        <div 
                          className={styles.teamBreakdownBarFill}
                          style={{ 
                            width: `${Math.min((team.load.p1LoadWeeks / 8) * 100, 100)}%`,
                            backgroundColor: team.load.p1LoadWeeks > 6 ? '#dc2626' : 
                                           team.load.p1LoadWeeks > 4 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

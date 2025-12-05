import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, teamService, activityLogService } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiAward, FiTrendingUp, FiActivity } from 'react-icons/fi';
import './DashboardPage.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [topTeams, setTopTeams] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await dashboardService.getStats();
      setStats(statsResponse.data);

      // Fetch top teams from leaderboard
      const leaderboardResponse = await teamService.getLeaderboard({ limit: 5 });
      const teamsData = leaderboardResponse.data.results || leaderboardResponse.data || [];
      setTopTeams(Array.isArray(teamsData) ? teamsData : []);

      // Fetch recent activity logs
      try {
        const activityResponse = await activityLogService.getAll();
        const activities = activityResponse.data.results || activityResponse.data || [];
        setActivityLogs(Array.isArray(activities) ? activities.slice(0, 10) : []);
      } catch (activityError) {
        console.log('Activity logs not available:', activityError);
        setActivityLogs([]);
      }

    } catch (err) {
      setError('Erreur lors du chargement des données du tableau de bord');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement du tableau de bord...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Réessayer
        </button>
      </div>
    );
  }

  // Prepare chart data for top teams
  const teamChartData = topTeams.map(team => ({
    name: team.name.length > 15 ? team.name.substring(0, 15) + '...' : team.name,
    score: team.total_score || 0,
    fullName: team.name
  }));

  // Prepare pie chart data
  const pieChartData = topTeams.slice(0, 5).map(team => ({
    name: team.name,
    value: team.total_score || 0
  }));

  const getActivityIcon = (action) => {
    switch (action) {
      case 'team_created':
        return '👥';
      case 'team_updated':
        return '✏️';
      case 'team_deleted':
        return '🗑️';
      case 'score_added':
        return '📊';
      case 'badge_earned':
        return '🏆';
      default:
        return '📌';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <button className="btn-refresh" onClick={fetchDashboardData}>
          🔄 Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Total des équipes</h3>
            <p className="stat-value">{stats?.total_teams || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-info">
            <h3>Total des scores</h3>
            <p className="stat-value">{stats?.total_scores || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>Points totaux</h3>
            <p className="stat-value">{stats?.total_points || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-info">
            <h3>Score moyen</h3>
            <p className="stat-value">{stats?.avg_score || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>🏆 Top 5 des équipes</h3>
          {teamChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p><strong>{payload[0].payload.fullName}</strong></p>
                          <p>Score: {payload[0].value} points</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="url(#colorGradient)" name="Score" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Aucune donnée disponible</p>
          )}
        </div>

        <div className="chart-card">
          <h3>📊 Répartition des scores</h3>
          {pieChartData.length > 0 && pieChartData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Top Teams Table */}
      <div className="top-teams-section">
        <h2>🥇 Classement des meilleures équipes</h2>
        {topTeams.length > 0 ? (
          <div className="top-teams-list">
            {topTeams.map((team, index) => (
              <div key={team.id} className="top-team-item">
                <div className="team-rank">
                  {index + 1}
                </div>
                <div className="team-info">
                  <h4>{team.name}</h4>
                  {team.description && <p>{team.description}</p>}
                </div>
                <div className="team-score-badge">
                  {team.total_score || 0} pts
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Aucune équipe enregistrée</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>📋 Activité récente</h2>
        {activityLogs.length > 0 ? (
          <div className="activity-list">
            {activityLogs.map((log) => (
              <div key={log.id} className="activity-item">
                <div className="activity-icon">{getActivityIcon(log.action)}</div>
                <div className="activity-content">
                  <p><strong>{log.description}</strong></p>
                  <p className="activity-meta">
                    {log.user_username && `${log.user_username} • `}
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Aucune activité récente</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

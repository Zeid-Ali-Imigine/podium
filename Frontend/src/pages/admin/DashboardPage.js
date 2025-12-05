import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService, scoreService } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRecentScores();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentScores = async () => {
    try {
      const response = await scoreService.getAll();
      const scores = response.data.results || response.data || [];
      setRecentScores(scores.slice(0, 10));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  const chartData = recentScores.map((score, index) => ({
    name: `Score ${index + 1}`,
    points: score.points
  }));

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total des équipes</h3>
          <p className="stat-value">{stats?.total_teams || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total des scores</h3>
          <p className="stat-value">{stats?.total_scores || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Points totaux</h3>
          <p className="stat-value">{stats?.total_points || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Score moyen</h3>
          <p className="stat-value">{stats?.avg_score || 0}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Répartition des scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Évolution des scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="points" stroke="#764ba2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Activité récente</h2>
        <div className="activity-list">
          {recentScores.map((score) => (
            <div key={score.id} className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-content">
                <p><strong>{score.points} points</strong> ajoutés</p>
                <p className="activity-meta">
                  {score.created_by_username} • {new Date(score.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


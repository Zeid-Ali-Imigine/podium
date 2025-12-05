import React, { useState, useEffect } from 'react';
import { teamService } from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await teamService.getLeaderboard();
      // Gérer la pagination DRF (retourne {results: [...]}) ou tableau direct
      const teamsData = response.data.results || response.data || [];
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du classement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading && teams.length === 0) {
    return <div className="loading">Chargement du classement...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>Classement en temps réel</h1>
      <div className="leaderboard-table">
        <table role="table" aria-label="Classement des équipes">
          <thead>
            <tr>
              <th scope="col">Rang</th>
              <th scope="col">Équipe</th>
              <th scope="col">Score total</th>
              <th scope="col">Date de création</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="rank-cell">
                  <span className="medal">{getMedal(team.rank)}</span>
                </td>
                <td className="team-name">{team.name}</td>
                <td className="score-cell">{team.total_score || 0}</td>
                <td>{new Date(team.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {teams.length === 0 && (
          <p className="no-teams">Aucune équipe enregistrée</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;


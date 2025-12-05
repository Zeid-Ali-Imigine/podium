import React, { useState, useEffect } from 'react';
import { teamService } from '../services/api';
import './TeamManagement.css';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingTeam, setEditingTeam] = useState(null);
  const [showScoreForm, setShowScoreForm] = useState(null);
  const [scoreData, setScoreData] = useState({ points: '', description: '' });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamService.getAll();
      // Gérer la pagination DRF (retourne {results: [...]}) ou tableau direct
      const teamsData = response.data.results || response.data || [];
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des équipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamService.update(editingTeam.id, formData);
      } else {
        await teamService.create(formData);
      }
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      try {
        await teamService.delete(id);
        fetchTeams();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, description: team.description || '' });
    setShowForm(true);
  };

  const handleAddScore = async (e, teamId) => {
    e.preventDefault();
    try {
      await teamService.addScore(teamId, {
        points: parseInt(scoreData.points),
        description: scoreData.description,
      });
      setScoreData({ points: '', description: '' });
      setShowScoreForm(null);
      fetchTeams();
    } catch (err) {
      setError('Erreur lors de l\'ajout du score');
      console.error(err);
    }
  };

  if (loading && teams.length === 0) {
    return <div className="loading">Chargement des équipes...</div>;
  }

  return (
    <div className="team-management-container">
      <h1>Gestion des équipes</h1>
      
      {error && <div className="error-message">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={() => {
          setShowForm(!showForm);
          setEditingTeam(null);
          setFormData({ name: '', description: '' });
        }}
        aria-label="Ajouter une nouvelle équipe"
      >
        {showForm ? 'Annuler' : '+ Ajouter une équipe'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="team-form">
          <h2>{editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h2>
          <div className="form-group">
            <label htmlFor="name">Nom de l'équipe *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-submit">
            {editingTeam ? 'Modifier' : 'Créer'}
          </button>
        </form>
      )}

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <h3>{team.name}</h3>
              <div className="team-actions">
                <button
                  onClick={() => handleEdit(team)}
                  className="btn-icon"
                  aria-label={`Modifier ${team.name}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="btn-icon"
                  aria-label={`Supprimer ${team.name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
            {team.description && <p className="team-description">{team.description}</p>}
            <div className="team-score">
              <strong>Score total: {team.total_score || 0}</strong>
            </div>
            <button
              onClick={() => setShowScoreForm(showScoreForm === team.id ? null : team.id)}
              className="btn btn-secondary"
            >
              {showScoreForm === team.id ? 'Annuler' : '+ Ajouter des points'}
            </button>
            
            {showScoreForm === team.id && (
              <form
                onSubmit={(e) => handleAddScore(e, team.id)}
                className="score-form"
              >
                <div className="form-group">
                  <label htmlFor={`points-${team.id}`}>Points *</label>
                  <input
                    type="number"
                    id={`points-${team.id}`}
                    value={scoreData.points}
                    onChange={(e) => setScoreData({ ...scoreData, points: e.target.value })}
                    required
                    min="0"
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`score-desc-${team.id}`}>Description</label>
                  <input
                    type="text"
                    id={`score-desc-${team.id}`}
                    value={scoreData.description}
                    onChange={(e) => setScoreData({ ...scoreData, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-submit">
                  Ajouter
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <p className="no-teams">Aucune équipe enregistrée. Créez-en une pour commencer !</p>
      )}
    </div>
  );
};

export default TeamManagement;


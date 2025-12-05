import React, { useState, useEffect } from 'react';
import { teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import './TeamManagement.css';

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingTeam, setEditingTeam] = useState(null);
  const [showScoreForm, setShowScoreForm] = useState(null);
  const [scoreData, setScoreData] = useState({ points: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canAddTeam = user?.role === 'admin' || (user?.role === 'leader' && teams.length < 1);
  const canDeleteTeam = user?.role === 'admin';
  const canEditTeam = user?.role === 'admin';
  const canAddScore = user?.role === 'admin';

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamService.getAll();
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
      setShowModal(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await teamService.delete(id);
      setDeleteConfirm(null);
      fetchTeams();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, description: team.description || '' });
    setShowModal(true);
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

  const openNewTeamModal = () => {
    setEditingTeam(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  if (loading && teams.length === 0) {
    return <div className="loading">Chargement des équipes...</div>;
  }

  return (
    <div className="team-management-container">
      <h1>Gestion des équipes</h1>

      {error && <div className="error-message">{error}</div>}

      {canAddTeam && (
        <button
          className="btn btn-primary"
          onClick={openNewTeamModal}
          aria-label="Ajouter une nouvelle équipe"
        >
          + Ajouter une équipe
        </button>
      )}

      {/* Modal for Create/Edit Team */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="team-form modal-form">
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
                <label htmlFor="description">Description (Optionnel)</label>
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer l'équipe <strong>{deleteConfirm.name}</strong> ?</p>
              <p className="warning-text">Cette action est irréversible et supprimera tous les scores associés.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <h3>{team.name}</h3>
              <div className="team-actions">
                {canEditTeam && (
                  <button
                    onClick={() => handleEdit(team)}
                    className="btn-icon btn-icon-edit"
                    aria-label={`Modifier ${team.name}`}
                    title="Modifier"
                  >
                    <FiEdit />
                  </button>
                )}
                {canDeleteTeam && (
                  <button
                    onClick={() => setDeleteConfirm(team)}
                    className="btn-icon btn-icon-delete"
                    aria-label={`Supprimer ${team.name}`}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
            {team.description && <p className="team-description">{team.description}</p>}
            {team.created_at && (
              <small className="team-meta">Créé le {new Date(team.created_at).toLocaleDateString()}</small>
            )}
            <div className="team-score">
              <strong>Score total: {team.total_score || 0}</strong>
            </div>

            {canAddScore && (
              <button
                onClick={() => {
                  setScoreData({ points: '', description: '' });
                  setShowScoreForm(team.id);
                }}
                className="btn btn-secondary"
              >
                + Ajouter des points
              </button>
            )}
          </div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <p className="no-teams">Aucune équipe enregistrée. Créez-en une pour commencer !</p>
      )}

      {/* Modal for Adding Score */}
      {showScoreForm && (
        <div className="modal-overlay" onClick={() => setShowScoreForm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter des points</h2>
              <button className="modal-close" onClick={() => setShowScoreForm(null)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={(e) => handleAddScore(e, showScoreForm)} className="team-form modal-form">
              <div className="form-group">
                <label htmlFor="points">Points *</label>
                <input
                  type="number"
                  id="points"
                  value={scoreData.points}
                  onChange={(e) => setScoreData({ ...scoreData, points: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label htmlFor="score-description">Description</label>
                <input
                  type="text"
                  id="score-description"
                  value={scoreData.description}
                  onChange={(e) => setScoreData({ ...scoreData, description: e.target.value })}
                  placeholder="Ex: Victoire match 1"
                />
              </div>
              <button type="submit" className="btn btn-submit">
                Ajouter les points
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

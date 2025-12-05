import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import DashboardPage from '../pages/admin/DashboardPage';
import Leaderboard from './Leaderboard';
import TeamManagement from './TeamManagement';

const AdminDashboard = () => {
  return (
    <Layout role="admin">
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="teams" element={<TeamManagement />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="stats" element={<DashboardPage />} />
        <Route path="settings" element={<div>Paramètres</div>} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;

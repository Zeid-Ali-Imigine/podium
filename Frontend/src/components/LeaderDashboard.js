import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Leaderboard from './Leaderboard';
import TeamManagement from './TeamManagement';

const LeaderDashboard = () => {
  return (
    <Layout role="leader">
      <Routes>
        <Route path="dashboard" element={<TeamManagement />} />
        <Route path="teams" element={<TeamManagement />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<TeamManagement />} />
      </Routes>
    </Layout>
  );
};

export default LeaderDashboard;

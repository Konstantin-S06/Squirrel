import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import BattlePage from './pages/BattlePage';
import FriendsPage from './pages/FriendsPage';
import EditAvatarPage from './pages/EditAvatarPage';
import AboutPage from './pages/AboutPage';
import CourseQuestsPage from './pages/CourseQuestsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/edit-avatar" element={<EditAvatarPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/quests" element={<CourseQuestsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

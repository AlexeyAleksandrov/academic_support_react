import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RPDPage from './pages/RPDPage.jsx';
import RpdSkillsPage from './pages/RpdSkillsPage.jsx';
import RpdSkillsGroupsPage from './pages/RpdSkillsGroupsPage.jsx';
import CompetenciesPage from './pages/CompetenciesPage.jsx';
import IndicatorsPage from './pages/IndicatorsPage.jsx';
import TechnologiesPage from './pages/TechnologiesPage.jsx';
import TechGroupsPage from './pages/TechGroupsPage.jsx';
import KeywordsPage from './pages/KeywordsPage.jsx';
import VacanciesPage from './pages/VacanciesPage.jsx';
import ExpertsPage from './pages/ExpertsPage.jsx';
import ExpertOpinionsPage from './pages/ExpertOpinionsPage.jsx';
import SavedSearchesPage from './pages/SavedSearchesPage.jsx';
import ForesightsPage from './pages/ForesightsPage.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/rpd" element={<ProtectedRoute><RPDPage /></ProtectedRoute>} />
              <Route path="/rpd/:rpdId/skills" element={<ProtectedRoute><RpdSkillsPage /></ProtectedRoute>} />
              <Route path="/rpd/:rpdId/skills-groups" element={<ProtectedRoute><RpdSkillsGroupsPage /></ProtectedRoute>} />
              <Route path="/competencies" element={<ProtectedRoute><CompetenciesPage /></ProtectedRoute>} />
              <Route path="/indicators" element={<ProtectedRoute><IndicatorsPage /></ProtectedRoute>} />
              <Route path="/technologies" element={<ProtectedRoute><TechnologiesPage /></ProtectedRoute>} />
              <Route path="/tech-groups" element={<ProtectedRoute><TechGroupsPage /></ProtectedRoute>} />
              <Route path="/keywords" element={<ProtectedRoute><KeywordsPage /></ProtectedRoute>} />
              <Route path="/vacancies" element={<ProtectedRoute><VacanciesPage /></ProtectedRoute>} />
              <Route path="/experts" element={<ProtectedRoute><ExpertsPage /></ProtectedRoute>} />
              <Route path="/expert-opinions" element={<ProtectedRoute><ExpertOpinionsPage /></ProtectedRoute>} />
              <Route path="/saved-searches" element={<ProtectedRoute><SavedSearchesPage /></ProtectedRoute>} />
              <Route path="/foresights" element={<ProtectedRoute><ForesightsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

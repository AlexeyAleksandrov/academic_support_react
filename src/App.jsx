import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import RPDPage from './pages/RPDPage.jsx';
import CompetenciesPage from './pages/CompetenciesPage.jsx';
import IndicatorsPage from './pages/IndicatorsPage.jsx';
import TechnologiesPage from './pages/TechnologiesPage.jsx';
import TechGroupsPage from './pages/TechGroupsPage.jsx';
import KeywordsPage from './pages/KeywordsPage.jsx';
import VacanciesPage from './pages/VacanciesPage.jsx';
import ExpertsPage from './pages/ExpertsPage.jsx';
import ExpertOpinionsPage from './pages/ExpertOpinionsPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rpd" element={<RPDPage />} />
            <Route path="/competencies" element={<CompetenciesPage />} />
            <Route path="/indicators" element={<IndicatorsPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/tech-groups" element={<TechGroupsPage />} />
            <Route path="/keywords" element={<KeywordsPage />} />
            <Route path="/vacancies" element={<VacanciesPage />} />
            <Route path="/experts" element={<ExpertsPage />} />
            <Route path="/expert-opinions" element={<ExpertOpinionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

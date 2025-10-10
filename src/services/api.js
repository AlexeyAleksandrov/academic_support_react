import axios from 'axios';

// Use empty baseURL for proxy to work in development
// In production, the built app will use the same origin
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RPD (Рабочие Программы Дисциплин)
export const rpdService = {
  getAll: () => api.get('/api/rpd'),
  getById: (id) => api.get(`/api/rpd/${id}`),
  create: (data) => api.post('/api/rpd', data),
  update: (id, data) => api.put(`/api/rpd/${id}`, data),
  delete: (id) => api.delete(`/api/rpd/${id}`),
};

// Competencies (Компетенции)
export const competencyService = {
  getAll: () => api.get('/api/competency'),
  getById: (id) => api.get(`/api/competency/${id}`),
  create: (data) => api.post('/api/competency', data),
  update: (id, data) => api.put(`/api/competency/${id}`, data),
  delete: (id) => api.delete(`/api/competency/${id}`),
};

// Indicators (Индикаторы)
export const indicatorService = {
  getAll: () => api.get('/api/indicators'),
  getByCompetency: (competencyNumber) => api.get(`/api/competencies/${competencyNumber}/indicators`),
  getByNumber: (competencyNumber, number) => api.get(`/api/competencies/${competencyNumber}/indicators/number/${number}`),
  create: (competencyNumber, data) => api.post(`/api/competencies/${competencyNumber}/indicators`, data),
  update: (competencyNumber, number, data) => api.put(`/api/competencies/${competencyNumber}/indicators/number/${number}`, data),
  delete: (competencyNumber, number) => api.delete(`/api/competencies/${competencyNumber}/indicators/number/${number}`),
};

// Technologies / Work Skills (Технологии)
export const technologyService = {
  getAll: () => api.get('/api/work-skills'),
  getById: (id) => api.get(`/api/work-skills/${id}`),
  create: (data) => api.post('/api/work-skills', data),
  update: (id, data) => api.put(`/api/work-skills/${id}`, data),
  delete: (id) => api.delete(`/api/work-skills/${id}`),
  updateByVacancies: () => api.get('/api/update/workSkillsMarketDemand'),
  matchToKeywords: () => api.get('/api/work-skills/math-to-keywords'),
  updateMarketDemand: () => api.get('/api/work-skills/update-market-demand'),
};

// Technology Groups / Skills Groups (Группы технологий)
export const techGroupService = {
  getAll: () => api.get('/api/skills-groups'),
  getById: (id) => api.get(`/api/skills-groups/${id}`),
  create: (data) => api.post('/api/skills-groups', data),
  update: (id, data) => api.put(`/api/skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/skills-groups/${id}`),
  matchToTechnologies: () => api.get('/api/skills-groups/math-to-work-skills'),
  updateMarketDemand: () => api.get('/api/skills-groups/update-market-demand'),
};

// Keywords (Ключевые слова)
export const keywordService = {
  getAll: () => api.get('/api/keywords'),
  getById: (id) => api.get(`/api/keywords/${id}`),
  create: (data) => api.post('/api/keywords', data),
  update: (id, data) => api.put(`/api/keywords/${id}`, data),
  delete: (id) => api.delete(`/api/keywords/${id}`),
  matchAll: () => api.post('/api/keywords/match/all'),
};

// Vacancies (Вакансии)
export const vacancyService = {
  getAll: () => api.get('/api/vac/list'),
  getById: (id) => api.get(`/api/vac/${id}`),
  create: (data) => api.post('/api/vac', data),
  update: (id, data) => api.put(`/api/vac/${id}`, data),
  delete: (id) => api.delete(`/api/vac/${id}`),
  updateFromAPI: () => api.get('/api/vac/list/save'),
};

// Experts (Эксперты)
export const expertService = {
  getAll: () => api.get('/api/experts'),
  getById: (id) => api.get(`/api/experts/${id}`),
  create: (data) => api.post('/api/experts', data),
  update: (id, data) => api.put(`/api/experts/${id}`, data),
  delete: (id) => api.delete(`/api/experts/${id}`),
};

// Expert Opinions (Мнения экспертов)
export const expertOpinionService = {
  getAll: () => api.get('/api/expert-opinions'),
  getById: (id) => api.get(`/api/expert-opinions/${id}`),
  create: (data) => api.post('/api/expert-opinions', data),
  update: (id, data) => api.put(`/api/expert-opinions/${id}`, data),
  delete: (id) => api.delete(`/api/expert-opinions/${id}`),
};

export default api;

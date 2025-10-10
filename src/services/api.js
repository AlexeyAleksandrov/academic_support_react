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
  getAll: () => api.get('/api/competencies'),
  getById: (id) => api.get(`/api/competencies/${id}`),
  create: (data) => api.post('/api/competencies', data),
  update: (id, data) => api.put(`/api/competencies/${id}`, data),
  delete: (id) => api.delete(`/api/competencies/${id}`),
};

// Indicators (Индикаторы)
export const indicatorService = {
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
  matchToKeywords: () => api.get('/work-skills/math-to-keywords'),
  updateMarketDemand: () => api.get('/work-skills/update-market-demand'),
  matchToGroups: () => api.post('/api/work-skills/match-to-groups'),
};

// Technology Groups / Skills Groups (Группы технологий)
export const techGroupService = {
  getAll: () => api.get('/api/skills-groups'),
  getById: (id) => api.get(`/api/skills-groups/${id}`),
  create: (data) => api.post('/api/skills-groups', data),
  update: (id, data) => api.put(`/api/skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/skills-groups/${id}`),
  matchToTechnologies: () => api.get('/skills-groups/math-to-work-skills'),
  updateMarketDemand: () => api.get('/skills-groups/update-market-demand'),
};

// Keywords (Ключевые слова) - работают через competencies
export const keywordService = {
  // Создание ключевых слов для индикатора компетенции
  createForIndicator: (competencyNumber, indicatorNumber, data) => 
    api.post(`/api/competencies/${competencyNumber}/indicators/${indicatorNumber}/keywords`, data),
  // Генерация ключевых слов для компетенции
  generateForCompetency: (competencyId) => 
    api.post(`/api/competencies/${competencyId}/keywords/generate`),
};

// Vacancies (Вакансии)
export const vacancyService = {
  getAll: () => api.get('/api/vacancies'),
  getById: (id) => api.get(`/api/vacancies/${id}`),
  create: (data) => api.post('/api/vacancies', data),
  update: (id, data) => api.put(`/api/vacancies/${id}`, data),
  delete: (id) => api.delete(`/api/vacancies/${id}`),
  getCount: () => api.get('/api/vacancies/count'),
  getByHhId: (hhId) => api.get(`/api/vacancies/hh/${hhId}`),
  getSkills: (id) => api.get(`/api/vacancies/${id}/skills`),
  addSkill: (id, data) => api.post(`/api/vacancies/${id}/skills`, data),
  removeSkill: (id, skillId) => api.delete(`/api/vacancies/${id}/skills/${skillId}`),
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

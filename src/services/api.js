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

// Interceptor для добавления JWT токена в каждый запрос
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок авторизации: 401 (Unauthorized) и 403 (Forbidden)
    // 403 может возникать когда токен истек или невалиден
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Токен истек или невалиден - выполняем автоматический выход
      localStorage.removeItem('authToken');
      
      // Перенаправляем на страницу входа только если мы не на публичных страницах
      const publicPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service (Авторизация и регистрация)
export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (firstName, lastName, middleName, email, password) => 
    api.post('/api/auth/register', { firstName, lastName, middleName, email, password }),
};

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
  getAll: () => api.get('/api/indicators'),
  getByCompetency: (competencyNumber) => api.get(`/api/competencies/${competencyNumber}/indicators`),
  getByNumber: (competencyNumber, number) => api.get(`/api/competencies/${competencyNumber}/indicators/${number}`),
  create: (competencyNumber, data) => api.post(`/api/competencies/${competencyNumber}/indicators`, data),
  update: (competencyNumber, number, data) => api.put(`/api/competencies/${competencyNumber}/indicators/${number}`, data),
  delete: (competencyNumber, number) => api.delete(`/api/competencies/${competencyNumber}/indicators/${number}`),
};

// Technologies / Work Skills (Технологии)
export const technologyService = {
  getAll: () => api.get('/api/work-skills'),
  getById: (id) => api.get(`/api/work-skills/${id}`),
  create: (data) => api.post('/api/work-skills', data),
  update: (id, data) => api.put(`/api/work-skills/${id}`, data),
  delete: (id) => api.delete(`/api/work-skills/${id}`),
  matchToKeywords: () => api.post('/api/keywords/match/all'),
  updateMarketDemand: () => api.get('/update/workSkillsMarketDemand'),
  matchToGroups: () => api.post('/api/work-skills/match-to-groups'),
};

// Technology Groups / Skills Groups (Группы технологий)
export const techGroupService = {
  getAll: () => api.get('/api/skills-groups'),
  getById: (id) => api.get(`/api/skills-groups/${id}`),
  create: (name) => api.post('/api/skills-groups', null, { params: { name } }),
  update: (id, data) => api.put(`/api/skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/skills-groups/${id}`),
  matchToTechnologies: () => api.post('/api/skills-groups/match-to-work-skills'),
  updateMarketDemand: () => api.put('/api/skills-groups/update-market-demand'),
  getWorkSkills: (id) => api.get(`/api/skills-groups/${id}/work-skills`),
};

// Keywords (Ключевые слова)
export const keywordService = {
  getAll: () => api.get('/api/keywords'),
  getById: (id) => api.get(`/api/keywords/${id}`),
  create: (data) => api.post('/api/keywords', data),
  update: (id, data) => api.put(`/api/keywords/${id}`, data),
  delete: (id) => api.delete(`/api/keywords/${id}`),
  // Создание ключевых слов для индикатора компетенции
  createForIndicator: (competencyNumber, indicatorNumber, data) => 
    api.post(`/api/competencies/${competencyNumber}/indicators/${indicatorNumber}/keywords`, data),
  // Генерация ключевых слов для компетенции
  generateForCompetency: (competencyId, model = 'gigachat') => 
    api.post(`/api/competencies/${competencyId}/keywords/generate`, null, { params: { model } }),
  // Соотнести все ключевые слова с технологиями
  matchAll: () => api.post('/api/keywords/match/all'),
};

// Vacancies (Вакансии)
export const vacancyService = {
  getAll: (offset = 0, limit = 50) => api.get('/api/vacancies', { params: { offset, limit } }),
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

// Saved Searches (Сохранённые поисковые запросы Head Hunter)
export const savedSearchService = {
  getAll: () => api.get('/api/saved-searches'),
  getById: (id) => api.get(`/api/saved-searches/${id}`),
  create: (data) => api.post('/api/saved-searches', data),
  update: (id, data) => api.put(`/api/saved-searches/${id}`, data),
  delete: (id) => api.delete(`/api/saved-searches/${id}`),
};

// Foresights (Прогнозы)
export const foresightService = {
  getAll: () => api.get('/api/foresights'),
  getById: (id) => api.get(`/api/foresights/${id}`),
  create: (data) => api.post('/api/foresights', data),
  update: (id, data) => api.put(`/api/foresights/${id}`, data),
  delete: (id) => api.delete(`/api/foresights/${id}`),
};

// RPD Skills (Навыки в РПД)
export const rpdSkillService = {
  getAll: () => api.get('/api/rpd-skills'),
  getById: (id) => api.get(`/api/rpd-skills/${id}`),
  getByRpdId: (rpdId) => api.get(`/api/rpd-skills/rpd/${rpdId}`),
  getByWorkSkillId: (workSkillId) => api.get(`/api/rpd-skills/work-skill/${workSkillId}`),
  getByMinTime: (minTime) => api.get(`/api/rpd-skills/time/${minTime}`),
  create: (data) => api.post('/api/rpd-skills', data),
  update: (id, data) => api.put(`/api/rpd-skills/${id}`, data),
  delete: (id) => api.delete(`/api/rpd-skills/${id}`),
};

// DST Aggregation (DST Аггрегация)
export const dstAggregationService = {
  getByWorkSkillId: (workSkillId) => api.get(`/api/dst-aggregation/work-skill/${workSkillId}`),
};

// RPD Skills Groups (Группы технологий в РПД)
export const rpdSkillsGroupService = {
  getAll: () => api.get('/api/rpd-skills-groups'),
  getById: (id) => api.get(`/api/rpd-skills-groups/${id}`),
  getByRpdId: (rpdId) => api.get(`/api/rpd-skills-groups/rpd/${rpdId}`),
  getBySkillsGroupId: (skillsGroupId) => api.get(`/api/rpd-skills-groups/skills-group/${skillsGroupId}`),
  getByMinTime: (minTime) => api.get(`/api/rpd-skills-groups/time/${minTime}`),
  create: (data) => api.post('/api/rpd-skills-groups', data),
  update: (id, data) => api.put(`/api/rpd-skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/rpd-skills-groups/${id}`),
};

// Expert Opinions Skills Groups (Экспертные оценки групп технологий)
export const expertOpinionSkillsGroupService = {
  getAll: () => api.get('/api/expert-opinions-skills-groups'),
  getById: (id) => api.get(`/api/expert-opinions-skills-groups/${id}`),
  getByExpertId: (expertId) => api.get(`/api/expert-opinions-skills-groups/expert/${expertId}`),
  getByIndicatorId: (indicatorId) => api.get(`/api/expert-opinions-skills-groups/indicator/${indicatorId}`),
  getBySkillsGroupId: (skillsGroupId) => api.get(`/api/expert-opinions-skills-groups/skills-group/${skillsGroupId}`),
  getByMinImportance: (minImportance) => api.get(`/api/expert-opinions-skills-groups/importance/${minImportance}`),
  create: (data) => api.post('/api/expert-opinions-skills-groups', data),
  update: (id, data) => api.put(`/api/expert-opinions-skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/expert-opinions-skills-groups/${id}`),
};

// Foresights Skills Groups (Прогнозы для групп технологий)
export const foresightSkillsGroupService = {
  getAll: () => api.get('/api/foresights-skills-groups'),
  getById: (id) => api.get(`/api/foresights-skills-groups/${id}`),
  getBySkillsGroupId: (skillsGroupId) => api.get(`/api/foresights-skills-groups/skills-group/${skillsGroupId}`),
  getBySource: (sourceName) => api.get(`/api/foresights-skills-groups/source/${sourceName}`),
  create: (data) => api.post('/api/foresights-skills-groups', data),
  update: (id, data) => api.put(`/api/foresights-skills-groups/${id}`, data),
  delete: (id) => api.delete(`/api/foresights-skills-groups/${id}`),
};

// DST Aggregation for Skills Groups (DST Аггрегация для групп технологий)
export const dstAggregationSkillsGroupService = {
  getBySkillsGroupId: (skillsGroupId) => api.get(`/api/dst-aggregation-skills-groups/skills-group/${skillsGroupId}`),
};

export default api;

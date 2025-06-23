import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });

export const getCurrentUser = () =>
  api.get('/auth/me');

export const getProjects = () =>
  api.get('/projects');

export const getProjectsByUser = (userId) =>
  api.get(`/projects/user/${userId}`);

export const createProject = (projectData) =>
  api.post('/projects', projectData);

export const updateProject = (projectId, projectData) =>
  api.put(`/projects/${projectId}`, projectData);

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);
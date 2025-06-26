import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


const getAuthToken = () => {
  
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  

  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('x-auth-token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
};

apiClient.interceptors.request.use(
  (config) => {
  
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('user'); 
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

   
    const userData = {
      user: {
        userId: response.data.data.userId,
        username: response.data.data.username,
        email: response.data.data.email,
      },
      token: response.data.data.token,
    };
    
    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: response.data.success,
      message: response.data.message,
      data: userData,
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        user: {
          userId: response.data.data.userId,
          username: response.data.data.username,
          email: response.data.data.email,
        },
      },
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        userId: response.data.data.userId,
        username: response.data.data.username,
        email: response.data.data.email,
      },
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch user' };
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('user');
    
    
    document.cookie = 'x-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.ve3.world;';
    document.cookie = 'x-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Logout failed' };
  }
};

// Project API calls
export const getProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    return {
      success: response.data.success,
      message: response.data.message || 'Projects fetched successfully',
      data: response.data.data, 
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch projects' };
  }
};

export const getProjectsByUser = async (userId) => {
  try {
    const response = await apiClient.get(`/projects/user/${userId}`);
    return {
      success: response.data.success,
      message: response.data.message || 'User projects fetched successfully',
      data: response.data.data, 
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch user projects' };
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/projects', projectData);
    return {
      success: response.data.success,
      message: response.data.message || 'Project created successfully',
      data: response.data.data,
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create project' };
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return {
      success: response.data.success,
      message: response.data.message || 'Project updated successfully',
      data: response.data.data, 
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update project' };
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Project deleted successfully',
      data: response.data.data, 
    };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete project' };
  }
};

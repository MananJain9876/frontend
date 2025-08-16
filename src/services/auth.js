import api from './api';

const authService = {
  login: async (credentials) => {
    // Need to use form data format for FastAPI's OAuth2 login
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Save auth token for later requests
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
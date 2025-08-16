import api from './api';

const taskService = {
  getTasks: async (filter) => {
    const params = filter ? { ...filter } : {};
    const response = await api.get('/api/tasks/', { params });
    return response.data;
  },
  
  getTask: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (task) => {
    const response = await api.post('/api/tasks/', task);
    return response.data;
  },
  
  updateTask: async (id, task) => {
    const response = await api.patch(`/api/tasks/${id}`, task);
    return response.data;
  },
  
  deleteTask: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
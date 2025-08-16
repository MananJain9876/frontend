import api from './api';

const projectService = {
  getProjects: async () => {
    const response = await api.get('/api/projects/');
    return response.data;
  },
  
  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },
  
  createProject: async (project) => {
    const response = await api.post('/api/projects/', project);
    return response.data;
  },
  
  updateProject: async (id, project) => {
    const response = await api.patch(`/api/projects/${id}`, project);
    return response.data;
  },
  
  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },
};

export default projectService;
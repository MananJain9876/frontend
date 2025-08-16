import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import Grid from '@mui/material/Grid';
import { taskService, projectService } from '../../services';
import AddIcon from '@mui/icons-material/Add';

// Status & Priority helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'TODO': return 'warning';
    case 'IN_PROGRESS': return 'info';
    case 'DONE': return 'success';
    default: return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    default: return 'default';
  }
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          project_id: projectFilter ? parseInt(projectFilter) : undefined,
        }),
        projectService.getProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter, priorityFilter, projectFilter]);

  const handleDeleteClick = (task) => { setTaskToDelete(task); setDeleteDialogOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch { setError('Failed to delete task'); }
  };
  const handleDeleteCancel = () => { setDeleteDialogOpen(false); setTaskToDelete(null); };

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handlePriorityFilterChange = (e) => setPriorityFilter(e.target.value);
  const handleProjectFilterChange = (e) => setProjectFilter(e.target.value);

  const getProjectName = (projectId) => projects.find(p => p.id === projectId)?.name || 'Unknown Project';

  if (loading && tasks.length === 0) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom>Tasks</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} component={RouterLink} to="/tasks/new">
          New Task
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={handleStatusFilterChange}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={handlePriorityFilterChange}>
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select value={projectFilter} onChange={handleProjectFilterChange}>
              <MenuItem value="">All Projects</MenuItem>
              {projects.map(p => <MenuItem key={p.id} value={p.id.toString()}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {tasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">No tasks found</Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {statusFilter || priorityFilter || projectFilter ? 'Try changing filters or create a new task' : 'Create your first task to get started'}
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} component={RouterLink} to="/tasks/new">Create Task</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.map(task => (
            <Grid item key={task.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>{task.description || 'No description'}</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                    <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                    {task.project_id && <Chip label={getProjectName(task.project_id)} size="small" variant="outlined" />}
                  </Box>
                  {task.due_date && <Typography variant="body2">Due: {new Date(task.due_date).toLocaleDateString()}</Typography>}
                </CardContent>
                <CardActions>
                  <Button size="small" component={RouterLink} to={`/tasks/${task.id}`}>View</Button>
                  <Button size="small" component={RouterLink} to={`/tasks/edit/${task.id}`}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteClick(task)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{taskToDelete?.title}"? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskList;

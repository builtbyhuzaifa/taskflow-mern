const express = require('express');
const auth = require('../controllers/authController');
const projects = require('../controllers/projectController');
const tasks = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// Projects
router.get('/projects', protect, projects.getProjects);
router.post('/projects', protect, projects.createProject);
router.get('/projects/:id', protect, projects.getProject);
router.patch('/projects/:id', protect, projects.updateProject);
router.delete('/projects/:id', protect, projects.deleteProject);
router.post('/projects/:id/members', protect, projects.addMember);
router.delete('/projects/:id/members/:userId', protect, projects.removeMember);

// Tasks
router.get('/tasks/mine', protect, tasks.getMyTasks);
router.get('/projects/:projectId/tasks', protect, tasks.getProjectTasks);
router.post('/projects/:projectId/tasks', protect, tasks.createTask);
router.patch('/tasks/:id', protect, tasks.updateTask);
router.delete('/tasks/:id', protect, tasks.deleteTask);

module.exports = router;

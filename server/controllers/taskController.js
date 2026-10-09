const Task = require('../models/Task');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { loadProject } = require('./projectController');

const EDITABLE = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee'];

// An assignee must be someone in the project (or nobody).
const checkAssignee = (project, assignee) => {
  if (assignee && !project.hasMember(assignee)) {
    throw new AppError('The assignee must be a member of this project', 400);
  }
};

const getProjectTasks = async (req, res) => {
  const project = await loadProject(req.params.projectId, req.user);
  const tasks = await Task.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate('assignee', 'name email');
  res.status(200).json({ tasks });
};

const createTask = async (req, res) => {
  const project = await loadProject(req.params.projectId, req.user);
  checkAssignee(project, req.body.assignee);

  const data = { project: project._id, createdBy: req.user._id };
  EDITABLE.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== '') data[field] = req.body[field];
  });

  const task = await Task.create(data);
  await task.populate('assignee', 'name email');

  // Keep the project's "last updated" fresh for sorting.
  await Project.updateOne({ _id: project._id }, { $currentDate: { updatedAt: true } });

  res.status(201).json({ message: 'Task created', task });
};

const findTask = async (id, user) => {
  const task = await Task.findById(id);
  if (!task) throw new AppError('Task not found', 404);
  const project = await loadProject(task.project, user);
  return { task, project };
};

const updateTask = async (req, res) => {
  const { task, project } = await findTask(req.params.id, req.user);
  if (req.body.assignee !== undefined) checkAssignee(project, req.body.assignee);

  EDITABLE.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field] === '' ? null : req.body[field];
    }
  });

  await task.save();
  await task.populate('assignee', 'name email');
  await Project.updateOne({ _id: project._id }, { $currentDate: { updatedAt: true } });

  res.status(200).json({ message: 'Task updated', task });
};

const deleteTask = async (req, res) => {
  const { task } = await findTask(req.params.id, req.user);
  await task.deleteOne();
  res.status(200).json({ message: 'Task deleted' });
};

// Open tasks assigned to the current user across all projects, soonest due first.
const getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignee: req.user._id, status: { $ne: 'done' } })
    .populate('project', 'name color')
    .lean();

  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  res.status(200).json({ tasks });
};

module.exports = { getProjectTasks, createTask, updateTask, deleteTask, getMyTasks };

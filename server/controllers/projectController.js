const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Loads a project and checks the current user belongs to it.
// Pass ownerOnly to also require that they own it.
const loadProject = async (id, user, { ownerOnly = false } = {}) => {
  const project = await Project.findById(id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project || !project.hasMember(user._id)) {
    // 404 rather than 403 so we don't reveal which project ids exist.
    throw new AppError('Project not found', 404);
  }
  if (ownerOnly && !project.owner._id.equals(user._id)) {
    throw new AppError('Only the project owner can do this', 403);
  }
  return project;
};

const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  })
    .sort({ updatedAt: -1 })
    .populate('owner', 'name')
    .lean();

  // Task counts per status for each project, in one query.
  const counts = await Task.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: { project: '$project', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const byProject = {};
  counts.forEach(({ _id, count }) => {
    const key = String(_id.project);
    byProject[key] = byProject[key] || { todo: 0, in_progress: 0, done: 0 };
    byProject[key][_id.status] = count;
  });

  res.status(200).json({
    projects: projects.map((p) => ({
      ...p,
      memberCount: p.members.length + 1,
      taskCounts: byProject[String(p._id)] || { todo: 0, in_progress: 0, done: 0 },
    })),
  });
};

const getProject = async (req, res) => {
  const project = await loadProject(req.params.id, req.user);
  res.status(200).json({ project });
};

const createProject = async (req, res) => {
  const { name, description, color } = req.body;
  const project = await Project.create({ name, description, color, owner: req.user._id });
  res.status(201).json({ message: 'Project created', project });
};

const updateProject = async (req, res) => {
  const project = await loadProject(req.params.id, req.user, { ownerOnly: true });
  ['name', 'description', 'color'].forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });
  await project.save();
  res.status(200).json({ message: 'Project updated', project });
};

const deleteProject = async (req, res) => {
  const project = await loadProject(req.params.id, req.user, { ownerOnly: true });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.status(200).json({ message: 'Project deleted' });
};

const addMember = async (req, res) => {
  const project = await loadProject(req.params.id, req.user, { ownerOnly: true });
  const email = String(req.body.email || '').toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No TaskFlow account uses that email. Ask them to sign up first.', 404);
  }
  if (project.hasMember(user._id)) {
    throw new AppError(`${user.name} is already in this project`, 409);
  }

  project.members.push(user._id);
  await project.save();
  await project.populate('members', 'name email');
  res.status(200).json({ message: `${user.name} added`, project });
};

const removeMember = async (req, res) => {
  const project = await loadProject(req.params.id, req.user, { ownerOnly: true });
  const { userId } = req.params;

  project.members = project.members.filter((m) => !m._id.equals(userId));
  await project.save();

  // Their open tasks in this project become unassigned.
  await Task.updateMany({ project: project._id, assignee: userId }, { assignee: null });

  res.status(200).json({ message: 'Member removed', project });
};

module.exports = {
  loadProject,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};

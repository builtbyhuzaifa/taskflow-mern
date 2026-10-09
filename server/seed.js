// Creates two demo users and a sample project with tasks.
// Run with: npm run seed   (clears existing data first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);

  const [demo, teammate] = await User.create([
    { name: 'Demo User', email: 'demo@taskflow.dev', password: 'demo123' },
    { name: 'Aisha Khan', email: 'aisha@taskflow.dev', password: 'demo123' },
  ]);

  const website = await Project.create({
    name: 'Client website launch',
    description: 'Landing page and contact form for a local furniture store.',
    color: '#d97706',
    owner: demo._id,
    members: [teammate._id],
  });

  const app = await Project.create({
    name: 'Inventory app',
    description: 'Internal tool to track stock across two warehouses.',
    color: '#0f766e',
    owner: demo._id,
  });

  await Task.create([
    { project: website._id, title: 'Collect logo and brand colours', status: 'done', priority: 'medium', assignee: teammate._id, createdBy: demo._id },
    { project: website._id, title: 'Design homepage hero section', status: 'in_progress', priority: 'high', dueDate: daysFromNow(2), assignee: demo._id, createdBy: demo._id },
    { project: website._id, title: 'Build contact form with email notifications', status: 'todo', priority: 'high', dueDate: daysFromNow(4), assignee: demo._id, createdBy: demo._id },
    { project: website._id, title: 'Write product category copy', status: 'todo', priority: 'low', dueDate: daysFromNow(6), assignee: teammate._id, createdBy: demo._id },
    { project: website._id, title: 'Set up domain and hosting', status: 'todo', priority: 'medium', dueDate: daysFromNow(-1), assignee: demo._id, createdBy: demo._id },
    { project: app._id, title: 'Design database schema', status: 'done', priority: 'high', assignee: demo._id, createdBy: demo._id },
    { project: app._id, title: 'Stock transfer screen', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(5), assignee: demo._id, createdBy: demo._id },
    { project: app._id, title: 'Low-stock email alerts', status: 'todo', priority: 'low', createdBy: demo._id },
  ]);

  console.log('Seeded 2 users, 2 projects and 8 tasks.');
  console.log('Login: demo@taskflow.dev / demo123');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

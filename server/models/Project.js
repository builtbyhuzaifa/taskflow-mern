const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [80, 'Project name is too long'],
    },
    description: { type: String, trim: true, maxlength: 500 },
    color: { type: String, default: '#6366f1', match: [/^#[0-9a-fA-F]{6}$/, 'Invalid colour'] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });

projectSchema.methods.hasMember = function hasMember(userId) {
  return this.owner.equals(userId) || this.members.some((m) => (m._id || m).equals(userId));
};

module.exports = mongoose.model('Project', projectSchema);

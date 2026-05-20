const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, default: 'Casablanca, Morocco' },
  maxParticipants: { type: Number, default: 4, min: 2, max: 20 },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);

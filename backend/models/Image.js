const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  filePath: { type: String, required: true },
  size: { type: Number, required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);

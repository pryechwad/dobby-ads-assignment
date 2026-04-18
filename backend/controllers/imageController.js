const Image = require('../models/Image');
const Folder = require('../models/Folder');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

exports.getImages = async (req, res) => {
  const { folderId } = req.query;
  const query = { userId: req.user._id, deletedAt: null };
  if (folderId) query.folderId = folderId;
  const images = await Image.find(query).sort({ createdAt: -1 });
  res.json(images);
};

exports.uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { name, folderId } = req.body;
  if (!name || !folderId) return res.status(400).json({ message: 'Name and folderId required' });
  const folder = await Folder.findOne({ _id: folderId, userId: req.user._id, deletedAt: null });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });
  const image = await Image.create({
    name, filePath: `/uploads/${req.file.filename}`,
    size: req.file.size, folderId, userId: req.user._id,
  });
  res.status(201).json(image);
};

// Soft delete — move to trash
exports.deleteImage = async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!image) return res.status(404).json({ message: 'Image not found' });
  await Image.updateOne({ _id: image._id }, { deletedAt: new Date() });
  res.json({ message: 'Moved to trash' });
};

// Permanent delete (from trash)
exports.permanentDeleteImage = async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
  if (!image) return res.status(404).json({ message: 'Image not found' });
  const filePath = path.join(__dirname, '..', image.filePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await image.deleteOne();
  res.json({ message: 'Permanently deleted' });
};

// Restore from trash
exports.restoreImage = async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
  if (!image) return res.status(404).json({ message: 'Image not found' });
  await Image.updateOne({ _id: image._id }, { deletedAt: null });
  res.json({ message: 'Restored' });
};

exports.moveImage = async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
    if (!image) return res.status(404).json({ message: 'Image not found' });
    if (targetId) {
      const folder = await Folder.findOne({ _id: targetId, userId: req.user._id });
      if (!folder) return res.status(404).json({ message: 'Target folder not found' });
    }
    image.folderId = targetId || null;
    await image.save();
    res.json(image);
  } catch (err) { next(err); }
};

exports.getRecentImages = async (req, res) => {
  const images = await Image.find({ userId: req.user._id, deletedAt: null })
    .sort({ createdAt: -1 }).limit(10).populate('folderId', 'name');
  res.json(images);
};

exports.getStorage = async (req, res) => {
  const result = await Image.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user._id), deletedAt: null } },
    { $group: { _id: null, total: { $sum: '$size' } } },
  ]);
  res.json({ used: result[0]?.total || 0 });
};

// Get trash items (soft-deleted in last 30 days)
exports.getTrash = async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [folders, images] = await Promise.all([
    Folder.find({ userId: req.user._id, deletedAt: { $gte: since } }).sort({ deletedAt: -1 }),
    Image.find({ userId: req.user._id, deletedAt: { $gte: since } }).sort({ deletedAt: -1 }),
  ]);
  res.json({ folders, images });
};

// Auto-purge items older than 30 days
exports.purgeTrash = async (req, res) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oldImages = await Image.find({ userId: req.user._id, deletedAt: { $lt: cutoff } });
  oldImages.forEach((img) => {
    const fp = path.join(__dirname, '..', img.filePath);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
  await Image.deleteMany({ userId: req.user._id, deletedAt: { $lt: cutoff } });
  await Folder.deleteMany({ userId: req.user._id, deletedAt: { $lt: cutoff } });
  res.json({ message: 'Purged' });
};

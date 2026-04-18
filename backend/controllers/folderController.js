const Folder = require('../models/Folder');
const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

const getFolderSize = async (folderId, userId) => {
  const [images, subfolders] = await Promise.all([
    Image.find({ folderId, userId, deletedAt: null }),
    Folder.find({ parentId: folderId, userId, deletedAt: null }),
  ]);
  const imageSize = images.reduce((sum, img) => sum + img.size, 0);
  const subSizes = await Promise.all(subfolders.map((f) => getFolderSize(f._id, userId)));
  return imageSize + subSizes.reduce((sum, s) => sum + s, 0);
};

exports.getFolders = async (req, res) => {
  const { parentId } = req.query;
  const query = { userId: req.user._id, parentId: parentId || null, deletedAt: null };
  const folders = await Folder.find(query).sort({ createdAt: -1 });
  const foldersWithSize = await Promise.all(
    folders.map(async (f) => ({ ...f.toObject(), size: await getFolderSize(f._id, req.user._id) }))
  );
  res.json(foldersWithSize);
};

exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  if (parentId) {
    const parent = await Folder.findOne({ _id: parentId, userId: req.user._id, deletedAt: null });
    if (!parent) return res.status(404).json({ message: 'Parent folder not found' });
  }
  const folder = await Folder.create({ name, parentId: parentId || null, userId: req.user._id });
  res.status(201).json({ ...folder.toObject(), size: 0 });
};

// Soft delete — moves to trash
exports.deleteFolder = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });

  const softDeleteRecursive = async (folderId) => {
    const subfolders = await Folder.find({ parentId: folderId, userId: req.user._id, deletedAt: null });
    await Promise.all(subfolders.map((f) => softDeleteRecursive(f._id)));
    await Image.updateMany({ folderId, userId: req.user._id, deletedAt: null }, { deletedAt: new Date() });
    await Folder.updateOne({ _id: folderId }, { deletedAt: new Date() });
  };

  await softDeleteRecursive(folder._id);
  res.json({ message: 'Moved to trash' });
};

// Permanent delete (from trash)
exports.permanentDeleteFolder = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });

  const hardDeleteRecursive = async (folderId) => {
    const subfolders = await Folder.find({ parentId: folderId, userId: req.user._id });
    await Promise.all(subfolders.map((f) => hardDeleteRecursive(f._id)));
    const images = await Image.find({ folderId, userId: req.user._id });
    images.forEach((img) => {
      const fp = path.join(__dirname, '..', img.filePath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });
    await Image.deleteMany({ folderId, userId: req.user._id });
    await Folder.deleteOne({ _id: folderId });
  };

  await hardDeleteRecursive(folder._id);
  res.json({ message: 'Permanently deleted' });
};

// Restore from trash
exports.restoreFolder = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });
  await Folder.updateOne({ _id: folder._id }, { deletedAt: null });
  await Image.updateMany({ folderId: folder._id, userId: req.user._id }, { deletedAt: null });
  res.json({ message: 'Restored' });
};

exports.moveFolder = async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    if (targetId) {
      const target = await Folder.findOne({ _id: targetId, userId: req.user._id });
      if (!target) return res.status(404).json({ message: 'Target not found' });
    }
    folder.parentId = targetId || null;
    await folder.save();
    res.json(folder);
  } catch (err) { next(err); }
};

exports.getBreadcrumb = async (req, res) => {
  const { folderId } = req.params;
  const crumbs = [];
  let current = await Folder.findOne({ _id: folderId, userId: req.user._id });
  if (!current) return res.status(404).json({ message: 'Folder not found' });
  while (current) {
    crumbs.unshift({ id: current._id, name: current.name });
    if (!current.parentId) break;
    current = await Folder.findOne({ _id: current.parentId, userId: req.user._id });
  }
  res.json(crumbs);
};

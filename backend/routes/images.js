const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const protect = require('../middleware/auth');
const { getImages, uploadImage, deleteImage, permanentDeleteImage, restoreImage, getRecentImages, moveImage, getStorage, getTrash, purgeTrash } = require('../controllers/imageController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(ext && mime ? null : new Error('Images only'), ext && mime);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);
router.get('/', getImages);
router.get('/recent', getRecentImages);
router.get('/storage', getStorage);
router.get('/trash', getTrash);
router.post('/purge', purgeTrash);
router.post('/', upload.single('image'), uploadImage);
router.delete('/:id/permanent', permanentDeleteImage);
router.patch('/:id/restore', restoreImage);
router.patch('/:id/move', moveImage);
router.delete('/:id', deleteImage);

module.exports = router;

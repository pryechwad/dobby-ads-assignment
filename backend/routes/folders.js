const router = require('express').Router();
const protect = require('../middleware/auth');
const { getFolders, createFolder, deleteFolder, permanentDeleteFolder, restoreFolder, getBreadcrumb, moveFolder } = require('../controllers/folderController');

router.use(protect);
router.get('/', getFolders);
router.post('/', createFolder);
router.get('/breadcrumb/:folderId', getBreadcrumb);
router.delete('/:id/permanent', permanentDeleteFolder);
router.patch('/:id/restore', restoreFolder);
router.patch('/:id/move', moveFolder);
router.delete('/:id', deleteFolder);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), createDepartment);
router.get('/', protect, getDepartments);
router.put('/:id', protect, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDepartment);

module.exports = router;

const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'A department with this name already exists.' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (any logged in user)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.name = req.body.name || department.name;
    department.code = req.body.code || department.code;
    department.description = req.body.description ?? department.description;

    const updated = await department.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await department.deleteOne();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };

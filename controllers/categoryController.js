const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    error.type = 'GetCategoriesError';
    throw error;
  }
});

exports.getCategory = (req, res) => {
  res.status(501).json({ message: 'Not implemented', route: req.originalUrl || req.url });
};

exports.createCategory = (req, res) => {
  res.status(501).json({ message: 'Not implemented', route: req.originalUrl || req.url });
};

exports.updateCategory = (req, res) => {
  res.status(501).json({ message: 'Not implemented', route: req.originalUrl || req.url });
};

exports.deleteCategory = (req, res) => {
  res.status(501).json({ message: 'Not implemented', route: req.originalUrl || req.url });
}; 
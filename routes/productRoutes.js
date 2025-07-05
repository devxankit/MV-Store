const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get all reviews for a vendor's products (must come before /:id routes)
router.get('/vendor/:vendorId/reviews', productController.getReviewsForVendor);

// Get product by ID
router.get('/:id', productController.getProduct);

// Get all reviews for a product
router.get('/:id/reviews', productController.getReviewsForProduct);

// Protected routes (for reviews)
router.post('/:id/reviews', protect, productController.addReview);

// Update and delete review routes
router.patch('/:id/reviews', protect, productController.updateReview);
router.delete('/:id/reviews', protect, productController.deleteReview);

// Admin-only product management
router.put('/:id/approve', protect, authorize('admin'), productController.approveProduct);
router.put('/:id/reject', protect, authorize('admin'), productController.rejectProduct);
router.put('/:id', protect, authorize('admin'), productController.adminEditProduct);
router.delete('/:id', protect, authorize('admin'), productController.adminDeleteProduct);

module.exports = router; 
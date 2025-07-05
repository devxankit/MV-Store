const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all products
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get product by ID
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  }
  res.json(product);
});

// Placeholder: Get featured products
exports.getFeaturedProducts = (req, res) => {
  res.json([]);
};

// Placeholder: Search products
exports.searchProducts = (req, res) => {
  res.json([]);
};

// Get products by category
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  // Find products where either category or subCategory matches
  const products = await Product.find({
    $or: [
      { category: categoryId },
      { subCategory: categoryId }
    ]
  });
  res.json(products);
});

// Add review to product
exports.addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  }
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'Product already reviewed by this user', route: req.originalUrl || req.url });
  }
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required', route: req.originalUrl || req.url });
  }
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    isVerified: false
  };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added', reviews: product.reviews });
});

// Admin: Approve product
exports.approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  product.isApproved = true;
  product.approvalDate = new Date();
  product.approvedBy = req.user._id;
  product.rejectionReason = '';
  await product.save();
  res.json(product);
});

// Admin: Reject product
exports.rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  product.isApproved = false;
  product.rejectionReason = req.body.reason || 'Rejected by admin';
  product.approvedBy = req.user._id;
  await product.save();
  res.json(product);
});

// Admin: Edit product
exports.adminEditProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

// Admin: Delete product
exports.adminDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  res.json({ message: 'Product deleted' });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('seller', 'shopName');
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  res.json(product);
});

// Get all reviews for a product
exports.getReviewsForProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('reviews');
  if (!product) {
    return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  }
  res.json(product.reviews);
});

// Get all reviews for a vendor's products
exports.getReviewsForVendor = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.params.vendorId }).select('name reviews');
  if (!products || products.length === 0) {
    return res.status(404).json({ message: 'No products found for this vendor', route: req.originalUrl || req.url });
  }
  const allReviews = products.flatMap(product =>
    product.reviews.map(review => ({
      ...review.toObject(),
      productId: product._id,
      productName: product.name
    }))
  );
  res.json(allReviews);
});

// Update a user's review for a product
exports.updateReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  const review = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (!review) return res.status(404).json({ message: 'Review not found', route: req.originalUrl || req.url });
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this review', route: req.originalUrl || req.url });
  }
  const { rating, comment } = req.body;
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  await product.save();
  res.json({ message: 'Review updated', review });
});

// Delete a user's review for a product
exports.deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  const reviewIndex = product.reviews.findIndex(r => r.user.toString() === req.user._id.toString());
  if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found', route: req.originalUrl || req.url });
  product.reviews.splice(reviewIndex, 1);
  await product.save();
  res.json({ message: 'Review deleted' });
}); 
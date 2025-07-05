const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const Category = require('../models/Category');

// Register a new seller (vendor request)
exports.register = async (req, res) => {
  try {
    // Find or create user (for demo, assume user is already registered and authenticated)
    // In production, you may want to link this to the logged-in user or create a new user
    const { email, phone, password, businessName, businessType, businessDescription, website, address, city, state, zipCode, country, taxId, businessLicense, categories, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Create new user with role 'seller'
    user = await User.create({
      name: (firstName && lastName) ? `${firstName} ${lastName}` : businessName,
      email,
      password,
      role: 'seller',
      phone
    });

    // Create seller request
    const seller = new Seller({
      userId: user._id, // associate with new user
      email,
      phone,
      shopName: businessName,
      description: businessDescription,
      address: {
        street: address,
        city,
        state,
        zipCode,
        country
      },
      businessInfo: {
        businessType,
        taxId,
        businessLicense
      },
      categories: [], // You can map category names to IDs if needed
      isApproved: false // Pending approval
    });
    await seller.save();
    res.status(201).json({ message: 'Vendor registration request submitted. Awaiting admin approval.' });
  } catch (error) {
    console.error('Seller registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// Placeholder: Get seller dashboard
exports.getDashboard = (req, res) => {
  res.json({ message: 'Get seller dashboard' });
};

// Get all products for the current seller
exports.getProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const products = await Product.find({ seller: seller._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product for the current seller
exports.createProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    let imageUrl = '';
    if (req.file) {
      console.log('Received file:', req.file);
      console.log('Received body:', req.body);
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(error);
            }
            resolve(result);
          });
          if (!req.file.buffer) {
            console.error('No file buffer found in req.file');
            return reject(new Error('No file buffer found in req.file'));
          }
          stream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }
    // Fallback to default image if no image uploaded
    if (!imageUrl) {
      imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1690000000/products/default-product.png'; // Replace with your own default image URL
    }

    let categoryId = req.body.category;
    if (req.body.customCategory) {
      // Create a new category if customCategory is provided
      const slug = req.body.customCategory.toLowerCase().replace(/\s+/g, '-');
      let category = await Category.findOne({ slug });
      if (!category) {
        category = await Category.create({ name: req.body.customCategory, slug });
      }
      categoryId = category._id;
    }

    const {
      name, description, shortDescription, price, comparePrice, subCategory, brand, sku, stock, lowStockThreshold, weight, dimensions, variants, tags, shippingInfo, seo, features, specifications
    } = req.body;

    // Parse features and specifications
    let featuresArr = [];
    if (features) {
      featuresArr = typeof features === 'string' ? features.split(',').map(f => f.trim()).filter(Boolean) : features;
    }
    let specificationsArr = [];
    if (specifications) {
      try {
        specificationsArr = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        specificationsArr = [];
      }
    }

    const product = new Product({
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      images: imageUrl ? [{ url: imageUrl }] : [],
      category: categoryId,
      subCategory,
      brand,
      seller: seller._id,
      sku,
      stock,
      lowStockThreshold,
      weight,
      dimensions,
      variants,
      specifications: specificationsArr,
      features: featuresArr,
      tags,
      shippingInfo,
      seo,
      isActive: true,
      isApproved: false // Admin approval required
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a product for the current seller
exports.updateProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const product = await Product.findOne({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let imageUrl = product.images && product.images[0] ? product.images[0].url : '';
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          if (!req.file.buffer) return reject(new Error('No file buffer found in req.file'));
          stream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }

    // Parse fields from req.body
    const {
      name, description, shortDescription, price, comparePrice, category, subCategory, brand, sku, stock, lowStockThreshold, weight, dimensions, variants, tags, shippingInfo, seo, features, specifications
    } = req.body;

    // Parse features and specifications
    let featuresArr = [];
    if (features) {
      featuresArr = typeof features === 'string' ? features.split(',').map(f => f.trim()).filter(Boolean) : features;
    }
    let specificationsArr = [];
    if (specifications) {
      try {
        specificationsArr = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        specificationsArr = [];
      }
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.shortDescription = shortDescription;
    product.price = price;
    product.comparePrice = comparePrice;
    product.images = imageUrl ? [{ url: imageUrl }] : product.images;
    product.category = category;
    product.subCategory = subCategory;
    product.brand = brand;
    product.sku = sku;
    product.stock = stock;
    product.lowStockThreshold = lowStockThreshold;
    product.weight = weight;
    product.dimensions = dimensions;
    product.variants = variants;
    product.specifications = specificationsArr;
    product.features = featuresArr;
    product.tags = tags;
    product.shippingInfo = shippingInfo;
    product.seo = seo;

    await product.save();
    res.json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product for the current seller
exports.deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Placeholder: Get seller orders
exports.getOrders = (req, res) => {
  res.json({ message: 'Get seller orders' });
};

// Placeholder: Update order status
exports.updateOrderStatus = (req, res) => {
  res.json({ message: 'Update order status' });
};

// Get seller stats (dashboard)
exports.getStats = async (req, res) => {
  try {
    // Find seller by user
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    // Get all products for this seller
    const products = await Product.find({ seller: seller._id });
    const productIds = products.map(p => p._id);

    // Get all orders for this seller
    const Order = require('../models/Order');
    const orders = await Order.find({ seller: seller._id });

    // Total sales (sum of totalPrice for delivered orders)
    const totalSales = orders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Total orders (all orders for this seller)
    const totalOrders = orders.length;

    // Total products
    const totalProducts = products.length;

    // Total unique customers
    const uniqueCustomerIds = new Set(orders.map(o => String(o.user)));
    const totalCustomers = uniqueCustomerIds.size;

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
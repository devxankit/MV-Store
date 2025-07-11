const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mv-ecom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugSellerIssue() {
  try {
    console.log('=== Debugging Seller Issue ===');
    
    // Check the specific user
    const userId = '68638ca887feff7be5b14872';
    const user = await User.findById(userId);
    console.log('User:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Check all Seller records for this user
    const sellers = await Seller.find({ userId: userId });
    console.log('Seller records for this user:', sellers.map(s => ({
      _id: s._id,
      userId: s.userId,
      shopName: s.shopName,
      isApproved: s.isApproved
    })));
    
    // Check the specific product
    const productId = '686b58ec4dc22f7e6d2d5e07';
    const product = await Product.findById(productId);
    console.log('Product:', {
      _id: product._id,
      name: product.name,
      seller: product.seller
    });
    
    // Check the Seller record that owns this product
    const productSeller = await Seller.findById(product.seller);
    console.log('Product Seller:', {
      _id: productSeller._id,
      userId: productSeller.userId,
      shopName: productSeller.shopName,
      isApproved: productSeller.isApproved
    });
    
    // Check if there are multiple Seller records
    const allSellers = await Seller.find({});
    console.log('All Seller records:', allSellers.map(s => ({
      _id: s._id,
      userId: s.userId,
      shopName: s.shopName,
      isApproved: s.isApproved
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugSellerIssue(); 
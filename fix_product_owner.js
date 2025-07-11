const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
const Product = require('./models/Product');

// Connect to MongoDB using the same connection string as your app
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mv-ecom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixProductOwner() {
  try {
    console.log('=== Fixing Product Owner ===');
    
    // The user ID from your logs
    const userId = '68638ca887feff7be5b14872';
    const productId = '686b58ec4dc22f7e6d2d5e07';
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('User found:', user.email);
    
    // Find the seller record for this user
    const seller = await Seller.findOne({ userId: userId });
    if (!seller) {
      console.log('Seller record not found for this user');
      return;
    }
    console.log('Seller found:', seller.shopName, 'ID:', seller._id);
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found');
      return;
    }
    console.log('Product found:', product.name, 'Current seller:', product.seller);
    
    // Update the product's seller field
    product.seller = seller._id;
    await product.save();
    
    console.log('Product updated successfully!');
    console.log('New seller ID:', product.seller);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixProductOwner(); 
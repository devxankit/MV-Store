require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Seller = require('./models/Seller');
const User = require('./models/User');

const sampleImages = [
  { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 1', isPrimary: true },
  { url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 2' },
  { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 3' },
  { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 4' },
  { url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 5' },
  { url: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 6' },
  { url: 'https://images.unsplash.com/photo-1526178613658-3f1622045557?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 7' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 8' },
  { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 9' },
  { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', alt: 'Sample Product 10' }
];

const brands = ['Acme', 'Globex', 'Umbrella', 'Wayne', 'Stark', 'Wonka'];

const features = [
  'High quality',
  'Eco-friendly',
  'Limited edition',
  'Best seller',
  '1-year warranty',
  'Free shipping'
];

const specifications = [
  { key: 'Color', value: 'Black' },
  { key: 'Material', value: 'Plastic' },
  { key: 'Weight', value: '1.2kg' }
];

async function seedProducts() {
  await connectDB();
  const sellers = await Seller.find();
  let seller;
  if (sellers.length === 0) {
    seller = await Seller.create({
      name: 'Demo Seller',
      email: 'demo-seller@example.com',
      password: 'password',
      shopName: 'Demo Shop',
      phone: '1234567890',
      address: '123 Demo Street',
      isApproved: true
    });
  } else {
    seller = sellers[0];
  }

  const categories = await Category.find().lean();
  const subcategories = categories.filter(cat => cat.parentCategory);
  const mainCategories = categories.filter(cat => !cat.parentCategory);

  // Remove all seeded products first
  await Product.deleteMany({});

  let count = 0;
  for (const subcat of subcategories) {
    const mainCat = mainCategories.find(cat => String(cat._id) === String(subcat.parentCategory));
    // Ensure at least 2 products per subcategory, each with a unique image
    const usedImageIndexes = new Set();
    for (let i = 1; i <= 2; i++) {
      let imgIdx;
      do {
        imgIdx = Math.floor(Math.random() * sampleImages.length);
      } while (usedImageIndexes.has(imgIdx) && usedImageIndexes.size < sampleImages.length);
      usedImageIndexes.add(imgIdx);
      const name = `${subcat.name} Product ${i}`;
      const sku = `${subcat.name.substring(0,3).toUpperCase()}-${i}-${Math.floor(Math.random()*10000)}`;
      await Product.create({
        name,
        description: `This is a sample description for ${name}.`,
        shortDescription: `Short desc for ${name}.`,
        price: Math.floor(Math.random() * 1000) + 100,
        comparePrice: Math.floor(Math.random() * 200) + 1000,
        images: [sampleImages[imgIdx]],
        category: mainCat ? mainCat._id : subcat.parentCategory,
        subCategory: subcat._id,
        brand: brands[Math.floor(Math.random() * brands.length)],
        seller: seller._id,
        sku,
        stock: Math.floor(Math.random() * 100) + 10,
        features: features.slice(0, Math.floor(Math.random() * features.length) + 1),
        specifications,
        tags: [subcat.name, mainCat ? mainCat.name : ''],
        isActive: true,
        isFeatured: false,
        isApproved: true
      });
      count++;
    }
  }
  console.log(`Seeded ${count} products across ${subcategories.length} subcategories.`);
  mongoose.connection.close();
}

async function updateSoldCounts() {
  await connectDB();
  const products = await Product.find();
  for (const product of products) {
    // Assign a random soldCount between 10 and 500 for demo
    product.soldCount = Math.floor(Math.random() * 491) + 10;
    await product.save();
    console.log(`Updated ${product.name} with soldCount ${product.soldCount}`);
  }
  console.log('All products updated with soldCount.');
  mongoose.connection.close();
}

async function getOrCreateDemoUser(index) {
  const email = `demo-user-${index}@example.com`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: `Demo User ${index}`,
      email,
      password: 'password',
    });
  }
  return user;
}

async function addMoreProducts() {
  await connectDB();
  const sellers = await Seller.find();
  const categories = await Category.find().lean();
  const subcategories = categories.filter(cat => cat.parentCategory);
  const mainCategories = categories.filter(cat => !cat.parentCategory);
  let seller = sellers[0];
  if (!seller) {
    seller = await Seller.create({
      name: 'Extra Seller',
      email: 'extra-seller@example.com',
      password: 'password',
      shopName: 'Extra Shop',
      phone: '9876543210',
      address: '456 Extra Street',
      isApproved: true
    });
  }
  let count = 0;
  for (let i = 1; i <= 20; i++) {
    const subcat = subcategories[i % subcategories.length];
    const mainCat = mainCategories.find(cat => String(cat._id) === String(subcat.parentCategory));
    const name = `Demo Product ${i} - ${subcat.name}`;
    const sku = `DEMO-${i}-${Math.floor(Math.random()*10000)}`;
    const images = [sampleImages[i % sampleImages.length], sampleImages[(i+2) % sampleImages.length]];
    // Generate 1-3 random reviews
    const numReviews = Math.floor(Math.random() * 3) + 1;
    const reviews = [];
    for (let r = 0; r < numReviews; r++) {
      try {
        const user = await getOrCreateDemoUser(i * 10 + r);
        reviews.push({
          user: user._id,
          name: user.name,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `This is a review ${r+1} for ${name}.`,
          images: [],
          isVerified: Math.random() > 0.5
        });
      } catch (err) {
        console.error('Failed to create review user:', err.message);
        continue;
      }
    }
    await Product.create({
      name,
      description: `This is a demo product for seeding: ${name}. It has all required fields and multiple images.`,
      shortDescription: `Short desc for ${name}.`,
      price: Math.floor(Math.random() * 3000) + 100,
      comparePrice: Math.floor(Math.random() * 2000) + 2000,
      images,
      category: mainCat ? mainCat._id : subcat.parentCategory,
      subCategory: subcat._id,
      brand: brands[i % brands.length],
      seller: seller._id,
      sku,
      stock: Math.floor(Math.random() * 300) + 10,
      lowStockThreshold: 10,
      weight: Math.random() * 2 + 0.5,
      dimensions: { length: 10 + i, width: 5 + i, height: 2 + i },
      features: features.slice(0, Math.floor(Math.random() * features.length) + 1),
      specifications,
      tags: [subcat.name, mainCat ? mainCat.name : ''],
      isActive: true,
      isFeatured: false,
      isApproved: true,
      approvalDate: new Date(),
      ratings: reviews.length > 0 ? Math.min(5, Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)) : 0,
      numReviews: reviews.length,
      totalSold: Math.floor(Math.random() * 1000),
      soldCount: Math.floor(Math.random() * 500),
      views: Math.floor(Math.random() * 1000),
      shippingInfo: {
        weight: Math.random() * 2 + 0.5,
        dimensions: { length: 10 + i, width: 5 + i, height: 2 + i },
        freeShipping: Math.random() > 0.5,
        shippingCost: Math.floor(Math.random() * 100)
      },
      seo: {
        metaTitle: `${name} - Buy Online`,
        metaDescription: `Meta description for ${name}.`,
        keywords: [name, subcat.name, mainCat ? mainCat.name : '']
      },
      reviews
    });
    count++;
  }
  console.log(`Added ${count} demo products with all parameters (no variants).`);
  mongoose.connection.close();
}

// Uncomment to run only this function:
addMoreProducts().catch(err => { console.error(err); mongoose.connection.close(); });

// seedProducts().catch(err => {
//   console.error(err);
//   mongoose.connection.close();
// });

// updateSoldCounts().catch(err => {
//   console.error(err);
//   mongoose.connection.close();
// }); 
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Seller = require('./models/Seller');

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
        isFeatured: Math.random() > 0.7,
        isApproved: true
      });
      count++;
    }
  }
  console.log(`Seeded ${count} products across ${subcategories.length} subcategories.`);
  mongoose.connection.close();
}

seedProducts().catch(err => {
  console.error(err);
  mongoose.connection.close();
}); 
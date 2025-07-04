// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const axios = require('axios');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Seller = require('./models/Seller');
const Product = require('./models/Product');

const BASIC_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and accessories.' },
  { name: 'Clothing & Fashion', slug: 'clothing-fashion', description: 'Apparel, shoes, and accessories.' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and gardening.' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports gear and outdoor equipment.' },
  { name: 'Books & Media', slug: 'books-media', description: 'Books, magazines, and media.' },
  { name: 'Health & Beauty', slug: 'health-beauty', description: 'Personal care and beauty products.' },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and puzzles.' },
  { name: 'Automotive', slug: 'automotive', description: 'Car accessories and tools.' },
  { name: 'Food & Beverages', slug: 'food-beverages', description: 'Groceries and drinks.' },
  { name: 'Jewelry & Watches', slug: 'jewelry-watches', description: 'Jewelry and timepieces.' },
  { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Pet food and accessories.' },
];

const PRODUCT_IMAGES = [
  // Unsplash and Pexels free product images
  'https://images.unsplash.com/photo-1513708927688-890fe8c3b6a0', // electronics
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', // fashion
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // home
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', // sports
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2', // books
  'https://images.unsplash.com/photo-1517841905240-472988babdf9', // beauty
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // toys
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d', // automotive
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836', // food
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99', // jewelry
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d', // pets
];

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  // 1. Create categories if not exist
  const categories = [];
  for (const cat of BASIC_CATEGORIES) {
    let category = await Category.findOne({ slug: cat.slug });
    if (!category) {
      category = await Category.create(cat);
    }
    categories.push(category);
  }
  console.log('Categories ensured:', categories.map(c => c.name));

  // 2. Fetch sellers
  const sellers = await Seller.find({ isApproved: true });
  if (!sellers.length) {
    console.error('No approved sellers found. Please approve at least one seller.');
    process.exit(1);
  }
  console.log('Found sellers:', sellers.length);

  // 3. Seed 50 products
  const products = [];
  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const seller = sellers[Math.floor(Math.random() * sellers.length)];
    const imageUrl = PRODUCT_IMAGES[i % PRODUCT_IMAGES.length] + '?w=600&q=80&auto=format&fit=crop';
    const name = faker.commerce.productName();
    const brand = faker.company.name();
    const price = faker.commerce.price(10, 1000, 2);
    const stock = faker.number.int({ min: 10, max: 200 });
    const sku = faker.string.uuid();
    const description = faker.commerce.productDescription();
    const shortDescription = description.slice(0, 100);
    const product = new Product({
      name,
      description,
      shortDescription,
      price,
      comparePrice: (parseFloat(price) + faker.number.float({ min: 5, max: 100, multipleOf: 0.01 })).toFixed(2),
      images: [{ url: imageUrl, alt: name, isPrimary: true }],
      category: category._id,
      brand,
      seller: seller._id,
      sku,
      stock,
      lowStockThreshold: 5,
      weight: faker.number.int({ min: 100, max: 2000 }),
      features: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
      specifications: [
        { key: 'Color', value: faker.color.human() },
        { key: 'Material', value: faker.commerce.productMaterial() },
      ],
      tags: [category.name, brand],
      isActive: true,
      isApproved: true,
      approvalDate: new Date(),
      ratings: faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }),
      numReviews: faker.number.int({ min: 0, max: 100 }),
      totalSold: faker.number.int({ min: 0, max: 500 }),
      views: faker.number.int({ min: 0, max: 1000 }),
      shippingInfo: {
        weight: faker.number.int({ min: 100, max: 2000 }),
        dimensions: {
          length: faker.number.int({ min: 10, max: 100 }),
          width: faker.number.int({ min: 10, max: 100 }),
          height: faker.number.int({ min: 10, max: 100 }),
        },
        freeShipping: faker.datatype.boolean(),
        shippingCost: faker.number.int({ min: 0, max: 50 }),
      },
      seo: {
        metaTitle: name,
        metaDescription: shortDescription,
        keywords: [name, category.name, brand],
      },
    });
    products.push(product.save());
  }
  await Promise.all(products);
  console.log('Seeded 50 products!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
}); 
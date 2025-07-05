require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    subcategories: [
      { name: 'Mobiles', slug: 'mobiles' },
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Headphones', slug: 'headphones' },
      { name: 'Cameras', slug: 'cameras' },
      { name: 'Accessories', slug: 'electronics-accessories' }
    ]
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    subcategories: [
      { name: 'Cookware', slug: 'cookware' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Bedding', slug: 'bedding' },
      { name: 'Storage', slug: 'storage' },
      { name: 'Decor', slug: 'decor' }
    ]
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    subcategories: [
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Haircare', slug: 'haircare' },
      { name: 'Makeup', slug: 'makeup' },
      { name: 'Tools', slug: 'beauty-tools' },
      { name: 'Fragrances', slug: 'fragrances' }
    ]
  },
  {
    name: 'Clothing, Shoes & Jewelry',
    slug: 'clothing-shoes-jewelry',
    subcategories: [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Kids', slug: 'kids' },
      { name: 'Shoes', slug: 'shoes' },
      { name: 'Watches', slug: 'watches' },
      { name: 'Accessories', slug: 'clothing-accessories' }
    ]
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    subcategories: [
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Camping', slug: 'camping' },
      { name: 'Cycling', slug: 'cycling' },
      { name: 'Sportswear', slug: 'sportswear' },
      { name: 'Equipment', slug: 'sports-equipment' }
    ]
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    subcategories: [
      { name: 'Board Games', slug: 'board-games' },
      { name: 'Puzzles', slug: 'puzzles' },
      { name: 'Action Figures', slug: 'action-figures' },
      { name: 'Dolls', slug: 'dolls' }
    ]
  },
  {
    name: 'Books',
    slug: 'books',
    subcategories: [
      { name: 'Fiction', slug: 'fiction' },
      { name: 'Non-Fiction', slug: 'non-fiction' },
      { name: 'Children\'s', slug: 'childrens-books' },
      { name: 'Academic', slug: 'academic-books' }
    ]
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    subcategories: [
      { name: 'Car Electronics', slug: 'car-electronics' },
      { name: 'Accessories', slug: 'automotive-accessories' },
      { name: 'Tools', slug: 'automotive-tools' },
      { name: 'Parts', slug: 'automotive-parts' }
    ]
  },
  {
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    subcategories: [
      { name: 'Food', slug: 'pet-food' },
      { name: 'Toys', slug: 'pet-toys' },
      { name: 'Grooming', slug: 'pet-grooming' },
      { name: 'Beds', slug: 'pet-beds' },
      { name: 'Carriers', slug: 'pet-carriers' }
    ]
  },
  {
    name: 'Health & Household',
    slug: 'health-household',
    subcategories: [
      { name: 'Supplements', slug: 'supplements' },
      { name: 'Medical Supplies', slug: 'medical-supplies' },
      { name: 'Cleaning', slug: 'cleaning' },
      { name: 'Baby Care', slug: 'baby-care' }
    ]
  }
];

async function seedCategories() {
  await connectDB();
  await Category.deleteMany({});
  console.log('Existing categories deleted.');

  for (const cat of categories) {
    const mainCat = await Category.create({
      name: cat.name,
      slug: cat.slug,
      level: 0
    });
    for (const sub of cat.subcategories) {
      await Category.create({
        name: sub.name,
        slug: sub.slug,
        parentCategory: mainCat._id,
        level: 1
      });
    }
  }
  console.log('Categories and subcategories seeded!');
  mongoose.connection.close();
}

seedCategories().catch(err => {
  console.error(err);
  mongoose.connection.close();
}); 
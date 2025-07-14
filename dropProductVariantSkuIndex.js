require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

async function dropVariantSkuIndex() {
  await connectDB();
  const collection = mongoose.connection.collection('products');
  try {
    const result = await collection.dropIndex('variants.options.sku_1');
    console.log('Dropped index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index not found, nothing to drop.');
    } else {
      console.error('Error dropping index:', err.message);
    }
  }
  mongoose.connection.close();
}

dropVariantSkuIndex(); 
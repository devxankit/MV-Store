const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

async function listIndexes() {
  await connectDB();
  const conn = mongoose.connection;
  const indexes = await conn.collection('products').indexes();
  console.log('Indexes on products collection:');
  console.log(indexes);
  mongoose.connection.close();
}

listIndexes(); 
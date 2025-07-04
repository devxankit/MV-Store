const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Translate 'hello' to Hindi");
    console.log(result.response.text());
  } catch (err) {
    console.error('Gemini test error:', err);
  }
}

test(); 
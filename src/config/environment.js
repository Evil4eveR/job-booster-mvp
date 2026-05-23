import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = ['GEMINI_API_KEY'];

requiredEnv.forEach((variable) => {
  if (!process.env[variable]) {
    console.error(`[CRITICAL ERROR] Missing mandatory environment variable: ${variable}`);
    process.exit(1);
  }
});

export const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalSecret: process.env.PAYPAL_SECRET,
  paypalEnv: process.env.PAYPAL_ENV || 'sandbox',
  nodeEnv: process.env.NODE_ENV || 'development'
};
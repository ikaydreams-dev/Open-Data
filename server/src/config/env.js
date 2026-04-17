import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'CLOUDINARY_CLOUD_NAME'];

requiredEnvs.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
    REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  CLOUDINARY: {
    NAME: process.env.CLOUDINARY_CLOUD_NAME,
    KEY: process.env.CLOUDINARY_API_KEY,
    SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
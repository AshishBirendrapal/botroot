import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mitti2market',
  jwtSecret: process.env.JWT_SECRET || 'mitti2market_jwt_secret_super_secure_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dataGovApiKey: process.env.DATA_GOV_IN_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  freightRatePerKmQuintal: parseFloat(process.env.DEFAULT_FREIGHT_RATE_PER_KM_QUINTAL || '2.5'),
  handlingChargePerQuintal: parseFloat(process.env.DEFAULT_HANDLING_CHARGE_PER_QUINTAL || '25'),
  mandiCessPercent: parseFloat(process.env.DEFAULT_MANDI_CESS_PERCENT || '1.5'),
};

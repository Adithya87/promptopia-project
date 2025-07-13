import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('Missing MONGODB_URI');
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: 'promptopia',
    });

    isConnected = true;
    console.log('✅ MongoDB connected to:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

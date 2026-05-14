import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env['MONGODB_URI'] as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
};

export default connectDB;

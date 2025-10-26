import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      isVerified: Boolean
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Delete old admin
    await User.deleteOne({ email: 'admin@gladius.com' });
    console.log('🗑️  Cleared old admin user');

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('admin123', salt);
    console.log('🔐 Password hashed');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gladius.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('\n✅ ADMIN CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@gladius.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:     admin');
    console.log('🆔 ID:      ', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password
    const testMatch = await bcryptjs.compare('admin123', hashedPassword);
    console.log('🧪 Password test:', testMatch ? '✅ PASS' : '❌ FAIL');

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
};

createAdmin();
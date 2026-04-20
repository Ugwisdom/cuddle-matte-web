import mongoose from 'mongoose';
import readline from 'readline';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    console.log('🔐 Admin User Creation Script\n');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = process.env.ADMIN_EMAIL || await question('Enter admin email: ');
    const name = process.env.ADMIN_NAME || await question('Enter admin name: ');
    const password = process.env.ADMIN_PASSWORD || await question('Enter admin password (min 6 characters): ');

    if (!email || !name || !password) {
      console.log('❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('❌ Admin with this email already exists');
        process.exit(1);
      } else {
        const autoConvert = process.env.ADMIN_AUTO_CONVERT === 'true';
        const updateExisting = autoConvert
          ? 'yes'
          : await question('\n⚠️  User with this email exists. Convert to admin? (yes/no): ');

        if (updateExisting.toLowerCase() === 'yes') {
          existingUser.role = 'admin';
          await existingUser.save();
          console.log('\n✅ User converted to admin successfully!');
          console.log(`📧 Email: ${existingUser.email}`);
          console.log(`👤 Name: ${existingUser.name}`);
          console.log(`🔑 Role: ${existingUser.role}\n`);
          process.exit(0);
        } else {
          console.log('❌ Operation cancelled');
          process.exit(1);
        }
      }
    }

    const admin = new User({
      email,
      password,
      name,
      role: 'admin',
      emailVerified: true,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      interestedIn: [],
      isActive: true
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin._id}\n`);
    console.log('You can now login with these credentials.\n');

    process.exit(0);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error creating admin:', message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createAdmin();

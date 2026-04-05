const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim();
                    process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}

loadEnvFile();

const User = require('./models/User');

async function createAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@pixelmafia.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('   Email: admin@pixelmafia.com');
            process.exit(0);
        }
        
        console.log('🔐 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const admin = new User({
            name: 'Administrator',
            email: 'admin@pixelmafia.com',
            password: hashedPassword,
            isAdmin: true,
            tokens: 9999,
            plan: 'Elite'
        });
        
        await admin.save();
        console.log('\n✅ Admin created successfully!');
        console.log('   Email: admin@pixelmafia.com');
        console.log('   Password: admin123');
        console.log('   Role: Administrator');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Done');
        process.exit(0);
    }
}

createAdmin();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
const paymentRoutes = require('./routes/payments');
const cuentaRoutes = require('./routes/cuentas');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelmafia';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cuentas', cuentaRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Create first admin (one-time use)
app.post('/api/create-first-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        
        // Check if any admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(403).json({ error: 'Admin already exists' });
        }
        
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password required' });
        }
        
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            tokens: 9999
        });
        
        await admin.save();
        
        res.json({ 
            success: true, 
            message: 'Admin created successfully',
            admin: { name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (e) {
        console.error('Error creating admin:', e);
        res.status(500).json({ error: e.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`🚀 API server running on port ${PORT}`);
});

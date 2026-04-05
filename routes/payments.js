const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create payment
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { description, amount, tokens, method } = req.body;
        const user = await User.findById(req.user.id);

        const payment = new Payment({
            id: `pay-${Date.now()}`,
            clientEmail: user.email,
            clientName: user.name,
            description,
            amount,
            tokens,
            method,
            status: method === 'PayPal' ? 'Pendiente' : 'Pendiente'
        });

        await payment.save();

        res.json({ ok: true, payment });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my payments
router.get('/my-payments', authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find({ clientEmail: req.user.email })
            .sort({ date: -1 });
        res.json({ payments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Confirm payment (admin only)
router.post('/confirm/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payment = await Payment.findOne({ id: req.params.id });
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status === 'Completado') {
            return res.status(400).json({ error: 'Payment already confirmed' });
        }

        // Update payment
        payment.status = 'Completado';
        payment.confirmedBy = req.user.email;
        payment.confirmedAt = new Date();
        await payment.save();

        // Add tokens to user
        const user = await User.findOne({ email: payment.clientEmail });
        if (user) {
            user.tokens += payment.tokens;
            await user.save();
        }

        res.json({ ok: true, payment, tokensAdded: payment.tokens });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all payments (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ date: -1 });
        res.json({ payments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PayPal webhook (for automatic confirmation)
router.post('/paypal-webhook', async (req, res) => {
    // Verify PayPal webhook signature
    // Automatically confirm payment and add tokens
    // Implementation depends on PayPal SDK
    res.json({ received: true });
});

module.exports = router;

const express = require('express');
const Bot = require('../models/Bot');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's bots
router.get('/my-bots', authMiddleware, async (req, res) => {
    try {
        const bots = await Bot.find({ clienteEmail: req.user.email });
        res.json({ bots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new bot (onboarding)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { clienteNombre, salaUrl, tipo, categoria } = req.body;
        const user = await User.findById(req.user.id);

        // Check tokens
        const costPerDay = categoria === 'GA' ? 0.5 : 0.83;
        const weeklyCost = tipo === 'alfa' ? costPerDay * 2 * 7 : costPerDay * 7;

        if (user.tokens < weeklyCost) {
            return res.status(400).json({ 
                error: `Necesitas ${Math.ceil(weeklyCost)} tokens para crear este bot` 
            });
        }

        // Generate ID
        const slug = clienteNombre.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        const id = `${slug}-${tipo}-${categoria.toLowerCase()}-${Date.now()}`.slice(0, 60);

        // Create bot
        const bot = new Bot({
            id,
            clienteNombre,
            clienteEmail: user.email,
            salaUrl,
            tipo,
            categoria,
            estado: 'creado'
        });

        await bot.save();

        // Deduct tokens
        user.tokens -= Math.ceil(weeklyCost);
        await user.save();

        res.json({ ok: true, bot, tokensRemaining: user.tokens });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update bot status
router.post('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { estado, pid } = req.body;
        const bot = await Bot.findOneAndUpdate(
            { id: req.params.id, clienteEmail: req.user.email },
            { estado, pid, ultimaActividad: new Date() },
            { new: true }
        );

        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        res.json({ ok: true, bot });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete bot
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const bot = await Bot.findOneAndDelete({
            id: req.params.id,
            clienteEmail: req.user.email
        });

        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        res.json({ ok: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all bots (admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin only' });
        }

        const bots = await Bot.find();
        res.json({ bots });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

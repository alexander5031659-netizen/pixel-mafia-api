const express = require('express');
const Cuenta = require('../models/Cuenta');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get available cuenta (for onboarding)
router.get('/available/:categoria', authMiddleware, async (req, res) => {
    try {
        const cuenta = await Cuenta.findOne({ 
            categoria: req.params.categoria, 
            enUso: false 
        });

        if (!cuenta) {
            return res.status(404).json({ error: 'No accounts available' });
        }

        res.json({ cuenta });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign cuenta to instance
router.post('/assign/:id', authMiddleware, async (req, res) => {
    try {
        const { instanciaId } = req.body;
        
        const cuenta = await Cuenta.findOneAndUpdate(
            { id: req.params.id, enUso: false },
            { enUso: true, instanciaAsignada: instanciaId },
            { new: true }
        );

        if (!cuenta) {
            return res.status(404).json({ error: 'Account not available' });
        }

        res.json({ ok: true, cuenta });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Release cuenta
router.post('/release/:id', authMiddleware, async (req, res) => {
    try {
        const cuenta = await Cuenta.findOneAndUpdate(
            { id: req.params.id },
            { enUso: false, instanciaAsignada: null },
            { new: true }
        );

        if (!cuenta) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ ok: true, cuenta });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all cuentas (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const cuentas = await Cuenta.find();
        res.json({ cuentas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new cuenta (admin only)
router.post('/add', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { usuario, password, categoria, notas } = req.body;

        const cuenta = new Cuenta({
            id: `bot-${categoria.toLowerCase()}-${Date.now()}`,
            usuario,
            password,
            categoria,
            notas
        });

        await cuenta.save();

        res.json({ ok: true, cuenta });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete cuenta (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const cuenta = await Cuenta.findOneAndDelete({ id: req.params.id });
        
        if (!cuenta) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ ok: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

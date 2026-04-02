const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clientEmail: { type: String, required: true },
    clientName: { type: String },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    tokens: { type: Number, required: true },
    method: { type: String, enum: ['PayPal', 'Nequi', 'Bancolombia'], required: true },
    status: { type: String, enum: ['Pendiente', 'Completado', 'Rechazado'], default: 'Pendiente' },
    comprobante: { type: String }, // URL de imagen para transferencias
    date: { type: Date, default: Date.now },
    confirmedBy: { type: String }, // Admin que confirmó
    confirmedAt: { type: Date }
});

module.exports = mongoose.model('Payment', paymentSchema);

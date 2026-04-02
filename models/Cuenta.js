const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    usuario: { type: String, required: true },
    password: { type: String, required: true },
    categoria: { type: String, enum: ['GA', 'AP'], required: true },
    enUso: { type: Boolean, default: false },
    instanciaAsignada: { type: String, default: null },
    notas: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cuenta', cuentaSchema);

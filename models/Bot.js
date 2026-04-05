const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clienteNombre: { type: String, required: true },
    clienteEmail: { type: String, required: true },
    salaUrl: { type: String, required: true },
    tipo: { type: String, enum: ['music', 'mod', 'ia', 'alfa'], required: true },
    categoria: { type: String, enum: ['GA', 'AP'], required: true },
    cuenta: { type: String },
    estado: { type: String, enum: ['creado', 'activo', 'detenido', 'error'], default: 'creado' },
    creadoEn: { type: Date, default: Date.now },
    pid: { type: Number },
    ultimaActividad: { type: Date },
    logs: [{ message: String, time: Date }]
});

module.exports = mongoose.model('Bot', botSchema);

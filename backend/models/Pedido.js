const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    nombreCliente: String,
    sucursal: String,
    comprobantePago: String,
    productos: [
        {
            id: Number,
            nombre: String,
            precio: Number,
            cantidad: Number
        }
    ],
    total: Number,
    estado: { type: String, default: 'Pendiente' },
    fecha: { type: Date, default: Date.now }
});

// 📌 Exportar el modelo correctamente
module.exports = mongoose.model("Pedido", PedidoSchema);

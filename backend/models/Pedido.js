// 📁 models/Pedido.js - Modelo para pedidos de clientes

import mongoose from 'mongoose';

// Esquema de un pedido realizado por el cliente
const PedidoSchema = new mongoose.Schema({
  nombreCliente: String,              // Nombre del comprador
  sucursal: String,                   // Sucursal seleccionada para retiro/envío
  comprobantePago: String,           // Nombre del archivo de comprobante (opcional)
  productos: [                       // Lista de productos incluidos en el pedido
    {
      id: Number,                    // ID único del producto
      nombre: String,                // Nombre del producto
      precio: Number,                // Precio unitario
      cantidad: Number               // Cantidad comprada
    }
  ],
  total: Number,                     // Monto total del pedido
  estado: {
    type: String,
    default: 'Pendiente'             // Estado inicial del pedido
  },
  fecha: {
    type: Date,
    default: Date.now                // Fecha automática de creación
  }
});

const Pedido = mongoose.model('Pedido', PedidoSchema);
export default Pedido;

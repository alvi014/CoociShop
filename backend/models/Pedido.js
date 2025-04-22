import mongoose from 'mongoose';

const PedidoSchema = new mongoose.Schema({
  nombreCliente: String,
  sucursal: String,
  comprobantePago: String,
  productos: [
    {
      id: Number,
      nombre: String,
      precio: Number,
      cantidad: Number,
    },
  ],
  total: Number,
  estado: { type: String, default: 'Pendiente' },
  fecha: { type: Date, default: Date.now },
});

// Eliminar el campo 'estado' de la colección existente
const Pedido = mongoose.model('Pedido', PedidoSchema);
export default Pedido;

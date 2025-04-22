// 📁 backend/routes/pedidos.js (ESM compatible)

import express from 'express';
import Pedido from '../models/Pedido.js';
import { generarFacturaPDF } from '../utils/pdfGenerator.js';
import nodemailer from 'nodemailer';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Ruta: POST /api/pedidos
router.post('/', upload.single('comprobantePago'), async (req, res) => {
  try {
    const { nombreCliente, sucursal, productos, total } = req.body;
    const productosJSON = JSON.parse(productos);

    const nuevoPedido = new Pedido({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    await nuevoPedido.save();

    const comprobanteBuffer = req.file?.buffer;

    // 🧾 Generar el PDF de factura
    const facturaPDF = await generarFacturaPDF({ nombreCliente, sucursal, productos: productosJSON, total });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    const attachments = [
      {
        filename: 'Factura-CoociShop.pdf',
        content: facturaPDF,
        contentType: 'application/pdf'
      }
    ];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: comprobanteBuffer
      });
    }

    await transporter.sendMail({
      from: `CoociShop <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: '📦 Nuevo Pedido en CoociShop',
      text: `Nuevo pedido recibido de ${nombreCliente} para sucursal ${sucursal}. Total: ₡${total}`,
      attachments
    });

    res.status(200).json({ message: '✅ Pedido enviado con éxito.' });
  } catch (error) {
    console.error('❌ Error en pedido:', error);
    res.status(500).json({ error: '❌ Hubo un error al procesar el pedido.' });
  }
});

export default router;
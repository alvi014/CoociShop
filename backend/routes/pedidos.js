// 📁 backend/routes/pedidos.js (ESM compatible)

import express from 'express';
import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';
import { generarFacturaPDF } from '../utils/pdfGenerator.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fetch from 'node-fetch';


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Ruta: POST /api/pedidos
router.post('/', upload.single('comprobantePago'), async (req, res) => {
  try {
        // ✅ Validar reCAPTCHA
        const recaptchaToken = req.body['g-recaptcha-response'];
        if (!recaptchaToken) {
          return res.status(400).json({ error: "⚠️ Falta CAPTCHA" });
        }
        
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const recaptchaRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
        });
        
        const recaptchaData = await recaptchaRes.json();
        if (!recaptchaData.success) {
          return res.status(403).json({ error: "❌ Verificación CAPTCHA fallida" });
        }
        
    
    const { nombreCliente, sucursal, productos, total } = req.body;
    const productosJSON = JSON.parse(productos);

    // ✅ Validar existencia y stock de productos
    for (const p of productosJSON) {
      const producto = await Producto.findOne({ id: Number(p.id) });

      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${p.id} no encontrado.` });
      }

      if (producto.stock < p.cantidad) {
        return res.status(400).json({
          error: `❌ Stock insuficiente para '${producto.nombre}'. Disponible: ${producto.stock}`
        });
      }

      await Producto.updateOne({ id: Number(p.id) }, { $inc: { stock: -p.cantidad } });
    }

    // ✅ Guardar pedido
    const nuevoPedido = new Pedido({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    await nuevoPedido.save();

    // 🧾 PDF factura
    const comprobanteBuffer = req.file?.buffer;
    const facturaPDF = await generarFacturaPDF({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    // ✉️ Configurar envío de correo
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

    // 📤 Enviar correo
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

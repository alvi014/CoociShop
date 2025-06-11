// 📁 backend/routes/pedidos.js - Procesamiento de pedidos + CAPTCHA + Email + PDF

import express from 'express';
import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';
import { generarFacturaPDF } from '../utils/pdfGenerator.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fetch from 'node-fetch';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Carga en memoria, útil para adjuntar directo al correo

//  Ruta: POST /api/pedidos
router.post('/', upload.single('comprobantePago'), async (req, res) => {
  try {
    //  Token reCAPTCHA enviado desde el cliente
    const recaptchaToken = req.body['g-recaptcha-response'];
    const clienteIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    //  Validamos que exista y sea largo válido
    if (!recaptchaToken || recaptchaToken.length < 30) {
      console.warn(`⚠️ Token CAPTCHA vacío o inválido de IP: ${clienteIP}`);
      return res.status(400).json({ error: "⚠️ Falta o token inválido del CAPTCHA" });
    }

    //  Validación del token con Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    });

    const recaptchaData = await recaptchaRes.json();
    console.log("✅ CAPTCHA RESPONSE:", recaptchaData);

    if (!recaptchaData.success) {
      console.log("🔍 Error reCAPTCHA:", recaptchaData['error-codes']);
      return res.status(403).json({ error: "❌ Verificación CAPTCHA fallida" });
    }

    //  Datos del pedido
    const { nombreCliente, sucursal, productos, total } = req.body;
    const productosJSON = JSON.parse(productos);

    //  Validación y actualización de stock
    for (const p of productosJSON) {
      const producto = await Producto.findOne({ id: Number(p.id) });
      if (!producto) return res.status(404).json({ error: `Producto con ID ${p.id} no encontrado.` });
      if (producto.stock < p.cantidad) {
        return res.status(400).json({ error: `❌ Stock insuficiente para '${producto.nombre}'. Disponible: ${producto.stock}` });
      }
      await Producto.updateOne({ id: Number(p.id) }, { $inc: { stock: -p.cantidad } });
    }

    //  Crear pedido y guardar en MongoDB
    const nuevoPedido = new Pedido({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    await nuevoPedido.save();

    //  Generar factura PDF y capturar comprobante
    const comprobanteBuffer = req.file?.buffer;
    const facturaPDF = await generarFacturaPDF({ nombreCliente, sucursal, productos: productosJSON, total });

    //  Configurar transporte Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    //  Adjuntos: factura + comprobante si existe
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

    //  Enviar correo a administrador
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

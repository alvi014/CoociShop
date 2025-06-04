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
    // 🛡️ Extraemos el token de reCAPTCHA enviado desde el frontend
    const recaptchaToken = req.body['g-recaptcha-response'];
    const clienteIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // ⚠️ Verificamos que el token exista y tenga una longitud razonable
    if (!recaptchaToken || recaptchaToken.length < 30) {
      console.warn(`⚠️ Token CAPTCHA vacío o inválido de IP: ${clienteIP}`);
      return res.status(400).json({ error: "⚠️ Falta o token inválido del CAPTCHA" });
    }



    // Logs de pruebas para reCAPTCHA
    console.log("🔐 Enviando a Google:");
    console.log("SECRET:", process.env.RECAPTCHA_SECRET);
    //console.log("TOKEN:", recaptchaToken);

   // 🌐 Verificamos el token con los servidores de Google
const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
const recaptchaRes = await fetch(verifyUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
});

// ✅ Primero obtenemos la respuesta JSON
const recaptchaData = await recaptchaRes.json();

// 🧪 Logs para ver respuesta de Google
console.log("✅ CAPTCHA RESPONSE:", recaptchaData);

// ❌ Si falla la verificación, retornamos error
if (!recaptchaData.success) {
  console.log("🔍 Error reCAPTCHA:", recaptchaData['error-codes']);
  return res.status(403).json({ error: "❌ Verificación CAPTCHA fallida" });
}



    // 🧾 Extrae y parseamos los datos del pedido
    const { nombreCliente, sucursal, productos, total } = req.body;
    const productosJSON = JSON.parse(productos);

    // ✅ Validamos existencia y stock de cada producto
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
      // ⬇️ Descontamos el stock
      await Producto.updateOne({ id: Number(p.id) }, { $inc: { stock: -p.cantidad } });
    }

    // 🛒 Guardamos el pedido en la base de datos
    const nuevoPedido = new Pedido({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    await nuevoPedido.save();

    // 📎 Preparamos el archivo PDF y comprobante de pago (si viene)
    const comprobanteBuffer = req.file?.buffer;
    const facturaPDF = await generarFacturaPDF({
      nombreCliente,
      sucursal,
      productos: productosJSON,
      total
    });

    // 📧 Configuramos el transporte de email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    // 📎 Armamos los adjuntos para el correo
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

    // 📤 Enviamos el correo con el pedido y sus adjuntos
    await transporter.sendMail({
      from: `CoociShop <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: '📦 Nuevo Pedido en CoociShop',
      text: `Nuevo pedido recibido de ${nombreCliente} para sucursal ${sucursal}. Total: ₡${total}`,
      attachments
    });

    // ✅ Todo salió bien
    res.status(200).json({ message: '✅ Pedido enviado con éxito.' });
  } catch (error) {
    // 🚨 Capturamos cualquier error inesperado
    console.error('❌ Error en pedido:', error);
    res.status(500).json({ error: '❌ Hubo un error al procesar el pedido.' });
  }
});

export default router;

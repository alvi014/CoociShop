// 📁 utils/pdfGenerator.js - Generador dinámico de PDF para pedidos

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fetch from 'node-fetch';

//  Genera un PDF con el resumen del pedido
export async function generarFacturaPDF(pedido) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 vertical

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Función auxiliar para colocar texto en coordenadas
  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0)
    });
  };

  //  Inserta logo institucional
  try {
    const logoBytes = await fetch('https://coocishop.netlify.app/img/CoociShop1.png').then(res => res.arrayBuffer());
    const logoImg = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImg, { x: 50, y: 770, width: 50, height: 50 });
  } catch (e) {
    console.warn('⚠️ Error cargando logo:', e);
  }

  // Información general
  drawText('CoociShop - Nuevo Pedido', 110, 790, 18);
  drawText(`Cliente: ${pedido.nombreCliente}`, 50, 740);
  drawText(`Sucursal: ${pedido.sucursal}`, 50, 720);
  const now = new Date();
  drawText(`Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 50, 700);
  drawText('Detalles del pedido:', 50, 670, 14);

  let y = 640;

  //  Recorrido de cada producto
  for (let i = 0; i < pedido.productos.length; i++) {
    const prod = pedido.productos[i];
    const subtotal = prod.precio * prod.cantidad;

    // Fondo visual blanco con borde gris claro
    page.drawRectangle({
      x: 45,
      y: y - 60,
      width: 500,
      height: 75,
      borderColor: rgb(0.8, 0.8, 0.8),
      color: rgb(1, 1, 1),
      borderWidth: 0.5,
      opacity: 0.95
    });

    drawText(`${i + 1}. ${prod.nombre}`, 50, y);
    drawText(`Cantidad: ${prod.cantidad}`, 50, y - 15);
    drawText(`Precio Unitario: CRC ${prod.precio.toLocaleString()}`, 50, y - 30);
    drawText(`Subtotal: CRC ${subtotal.toLocaleString()}`, 50, y - 45);

    // Línea divisora inferior
    page.drawLine({
      start: { x: 45, y: y - 60 },
      end: { x: 545, y: y - 60 },
      thickness: 0.4,
      color: rgb(0.7, 0.7, 0.7)
    });

    //  Imagen del producto
    try {
      const imagenRuta = typeof prod.imagen === 'string' ? prod.imagen : '';
      const imageUrl = imagenRuta.startsWith('http')
        ? imagenRuta
        : `https://coocishop.netlify.app${imagenRuta.startsWith('/') ? '' : '/'}${imagenRuta}`;

      if (!imagenRuta) throw new Error('Imagen no definida');

      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const imageEmbed = imageUrl.toLowerCase().endsWith('.png')
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);

      page.drawImage(imageEmbed, { x: 400, y: y - 20, width: 60, height: 60 });
    } catch (e) {
      drawText('[Imagen no disponible]', 400, y);
      console.warn(`⚠️ Imagen fallida: ${prod.nombre}`, e.message || e);
    }

    y -= 90;
    if (y < 100) {
      page.drawText('--- Página continua ---', { x: 250, y: 50 });
      y = 740;
    }
  }

  drawText(`Total: CRC ${pedido.total.toLocaleString()}`, 350, y - 30, 14);
  drawText('Gracias por su compra en CoociShop.', 180, 50, 10);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes); // Retorna el buffer para adjuntarlo por email
}

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fetch from 'node-fetch';

export async function generarFacturaPDF(pedido) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0)
    });
  };

  // Logo
  try {
    const logoBytes = await fetch('https://coocishop.netlify.app/img/iconLog.PNG').then(res => res.arrayBuffer());
    const logoImg = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImg, { x: 50, y: 770, width: 50, height: 50 });
  } catch (e) {
    console.warn('⚠️ Error cargando logo:', e);
  }

  drawText('CoociShop - Nuevo Pedido', 110, 790, 18);
  drawText(`Cliente: ${pedido.nombreCliente}`, 50, 740);
  drawText(`Sucursal: ${pedido.sucursal}`, 50, 720);
  drawText(`Fecha: ${new Date().toLocaleString()}`, 50, 700);
  drawText('Detalles del pedido:', 50, 670, 14);

  let y = 640;
  for (const [i, prod] of pedido.productos.entries()) {
    const subtotal = prod.precio * prod.cantidad;
    drawText(`${i + 1}. ${prod.nombre}`, 50, y);
    drawText(`Cantidad: ${prod.cantidad}`, 50, y - 15);
    drawText(`Precio Unitario: CRC${prod.precio.toLocaleString()}`, 50, y - 30);
    drawText(`Subtotal: CRC${subtotal.toLocaleString()}`, 50, y - 45);

    try {
      const imageUrl = prod.imagen.startsWith('http')
        ? prod.imagen
        : `https://coocishop.netlify.app${prod.imagen.startsWith('/') ? '' : '/'}${prod.imagen}`;
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const imageEmbed = imageUrl.toLowerCase().endsWith('.png')
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
      page.drawImage(imageEmbed, { x: 400, y: y - 20, width: 60, height: 60 });
    } catch (e) {
      drawText('[Imagen no disponible]', 400, y);
      console.warn(`⚠️ Imagen fallida: ${prod.nombre}`, e);
    }

    y -= 90;
    if (y < 100) {
      page.drawText('--- Página continua ---', { x: 250, y: 50 });
      y = 740;
    }
  }

  drawText(`Total: CRC${pedido.total.toLocaleString()}`, 350, y - 30, 14);
  drawText('Gracias por su compra en CoociShop.', 180, 50, 10);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

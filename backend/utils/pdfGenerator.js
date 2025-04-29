import PDFDocument from 'pdfkit';
import { fileTypeFromBuffer } from 'file-type';
import https from 'https';

export async function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept-Encoding': 'identity' } }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        try {
          const type = await fileTypeFromBuffer(buffer);
          resolve({ buffer, mime: type?.mime || 'image/png' });
        } catch {
          resolve({ buffer, mime: 'image/png' });
        }
      });
    }).on('error', err => reject(err));
  });
}

export async function generarFacturaPDF(pedido) {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  const logoURL = 'https://coocishop.netlify.app/img/iconLog.PNG';

  try {
    const { buffer: logoBuffer, mime } = await fetchImageBuffer(logoURL);
    if (mime.includes('png') || mime.includes('jpeg')) {
      doc.image(logoBuffer, 50, 45, { width: 50 });
    }
  } catch (err) {
    console.warn('⚠️ Logo no cargado:', err);
  }

  doc.fontSize(20).text('CoociShop - Nuevo Pedido', 110, 57).moveDown(2);
  doc.fontSize(12)
    .text(`Cliente: ${pedido.nombreCliente}`)
    .text(`Sucursal: ${pedido.sucursal}`)
    .text(`Fecha: ${new Date().toLocaleString()}`)
    .moveDown(1);

  doc.fontSize(13).text('Detalles del pedido:', { underline: true }).moveDown(0.5);

  for (let i = 0; i < pedido.productos.length; i++) {
    const prod = pedido.productos[i];
    const subtotal = prod.precio * prod.cantidad;
    const posY = doc.y;

    doc.fontSize(12)
      .fillColor('black')
      .text(`${i + 1}. ${prod.nombre}`, 50, posY)
      .text(`Cantidad : ${prod.cantidad}`, 50, doc.y)
      .text(`Precio Unitario : CRC${prod.precio.toLocaleString()}`, 50, doc.y)
      .text(`Subtotal : CRC${subtotal.toLocaleString()}`, 50, doc.y);

    let imagenURL = 'https://coocishop.netlify.app/img/default.png';
    if (prod.imagen && typeof prod.imagen === 'string') {
      imagenURL = prod.imagen.startsWith('http') 
        ? prod.imagen 
        : `https://coocishop.netlify.app${prod.imagen.startsWith('/') ? '' : '/'}${prod.imagen}`;
    }

    try {
      const { buffer: imgBuffer, mime } = await fetchImageBuffer(imagenURL);
      if (mime.includes('png') || mime.includes('jpeg')) {
        doc.image(imgBuffer, 370, posY, { fit: [60, 60] });
      } else {
        throw new Error('Formato no soportado');
      }
    } catch (err) {
      console.warn(`⚠️ Imagen fallida '${prod.nombre}':`, err);
      try {
        const { buffer: fallback } = await fetchImageBuffer('https://coocishop.netlify.app/img/default.png');
        doc.image(fallback, 370, posY, { fit: [60, 60] });
      } catch {
        doc.fontSize(10).fillColor('gray').text('[Imagen no disponible]', 370, posY);
      }
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
  }

  doc.moveDown(1).fontSize(14).fillColor('black').text(`Total: CRC${pedido.total.toLocaleString()}`, {
    align: 'right'
  });

  doc.moveDown(2).fontSize(10).text('Gracias por su compra en CoociShop.', { align: 'center' });
  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

const PDFDocument = require('pdfkit');
const https = require('https');

/**
 * Descarga una imagen desde una URL y devuelve un buffer
 */
function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', err => reject(err));
  });
}

/**
 * Genera un PDF tipo pedido con imágenes desde Netlify convertidas en buffers
 * @param {Object} pedido - Contiene nombreCliente, sucursal, productos[], total
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
async function generarFacturaPDF(pedido) {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  const logoURL = 'https://coocishop.netlify.app/img/iconLog.PNG';

  try {
    const logoBuffer = await fetchImageBuffer(logoURL);
    doc.image(logoBuffer, 50, 45, { width: 50 });
  } catch (err) {
    console.warn('⚠️ No se pudo cargar el logo:', err);
  }

  doc
    .fontSize(20)
    .text('CoociShop - Nuevo Pedido', 110, 57)
    .moveDown(2);

  doc
    .fontSize(12)
    .text(`Cliente: ${pedido.nombreCliente}`)
    .text(`Sucursal: ${pedido.sucursal}`)
    .text(`Fecha: ${new Date().toLocaleString()}`)
    .moveDown(1);

  doc.fontSize(13).text('Detalles del pedido:', { underline: true }).moveDown(0.5);

  for (let i = 0; i < pedido.productos.length; i++) {
    const prod = pedido.productos[i];
    const subtotal = prod.precio * prod.cantidad;
    const posY = doc.y;

    doc
      .fontSize(12)
      .text(`${i + 1}. ${prod.nombre}`, 50, posY)
      .text(`Cantidad : ${prod.cantidad}`, 50, doc.y)
      .text(`Precio Unitario : CRC${prod.precio.toLocaleString()}`, 50, doc.y)
      .text(`Subtotal : CRC${subtotal.toLocaleString()}`, 50, doc.y);

    let imagenURL = 'https://coocishop.netlify.app/img/default.png';
    if (prod.imagen && typeof prod.imagen === 'string') {
      const imgPath = prod.imagen.startsWith('img/') ? prod.imagen : `img/${prod.imagen}`;
      imagenURL = `https://coocishop.netlify.app/${imgPath}`;
    }

    try {
      const imgBuffer = await fetchImageBuffer(imagenURL);
      doc.image(imgBuffer, 370, posY, { fit: [100, 100] });
    } catch (err) {
      console.warn(`⚠️ Imagen no cargada para producto '${prod.nombre}':`, err);
    }

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
  }

  doc.moveDown(1).fontSize(14).text(`Total: CRC${pedido.total.toLocaleString()}`, {
    align: 'right',
  });

  doc.moveDown(2).fontSize(10).text('Gracias por su compra en CoociShop.', { align: 'center' });

  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

module.exports = { generarFacturaPDF };

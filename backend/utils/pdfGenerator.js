const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF tipo pedido con detalles e imágenes a la derecha
 * @param {Object} pedido - Contiene nombreCliente, sucursal, productos[], total
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
function generarFacturaPDF(pedido) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // === ENCABEZADO ===
    try {
      const logoPath = path.join(__dirname, '../../html/img/iconLog.PNG');
      if (fs.existsSync(logoPath)) {
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        doc.image(Buffer.from(logoBase64, 'base64'), 50, 45, { width: 50 });
      }
    } catch (err) {
      console.error('Error cargando logo:', err);
    }

    doc
      .fontSize(20)
      .text('CoociShop - Nuevo Pedido', 110, 57)
      .moveDown(2);

    // === DATOS DEL CLIENTE ===
    doc
      .fontSize(12)
      .text(`Cliente: ${pedido.nombreCliente}`)
      .text(`Sucursal: ${pedido.sucursal}`)
      .text(`Fecha: ${new Date().toLocaleString()}`)
      .moveDown(1);

    // === DETALLES DEL PEDIDO ===
    doc.fontSize(13).text('Detalles del pedido:', { underline: true }).moveDown(0.5);

    pedido.productos.forEach((prod, i) => {
      const subtotal = prod.precio * prod.cantidad;
      const posY = doc.y;

      doc
        .fontSize(12)
        .text(`${i + 1}. ${prod.nombre}`, 50, posY)
        .text(`Cantidad : ${prod.cantidad}`, 50, doc.y)
        .text(`Precio Unitario : CRC${prod.precio.toLocaleString()}`, 50, doc.y)
        .text(`Subtotal : CRC${subtotal.toLocaleString()}`, 50, doc.y);

      let imagenRelativa = 'img/default.png';
      if (prod.imagen && typeof prod.imagen === 'string') {
        imagenRelativa = prod.imagen.startsWith('img/') ? prod.imagen : `img/${prod.imagen}`;
      }

      const imagePath = path.join(__dirname, `../../html/${imagenRelativa}`);
      if (fs.existsSync(imagePath)) {
        try {
          const imgBase64 = fs.readFileSync(imagePath).toString('base64');
          doc.image(Buffer.from(imgBase64, 'base64'), 370, posY, { fit: [100, 100] });
        } catch (err) {
          console.error(`Error cargando imagen del producto ${prod.nombre}:`, err);
        }
      }

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);
    });

    // === TOTAL ===
    doc.moveDown(1).fontSize(14).text(`Total: CRC${pedido.total.toLocaleString()}`, {
      align: 'right',
    });

    // === PIE DE PÁGINA ===
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text('Gracias por su compra en CoociShop.', { align: 'center' });

    doc.end();
  });
}

module.exports = { generarFacturaPDF };

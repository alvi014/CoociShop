const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF tipo factura con detalles del pedido
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
      const logoPath = path.join(__dirname, '../public/img/iconLog.PNG');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 50 });
      }
    } catch {}

    doc
      .fontSize(20)
      .text('CoociShop - Factura', 110, 57)
      .moveDown(2);

    // === DATOS DEL CLIENTE ===
    doc
      .fontSize(12)
      .text(`🧑 Cliente: ${pedido.nombreCliente}`)
      .text(`🏢 Sucursal: ${pedido.sucursal}`)
      .text(`📅 Fecha: ${new Date().toLocaleString()}`)
      .moveDown(1);

    // === DETALLES DEL PEDIDO ===
    doc.fontSize(13).text('🛒 Detalles del pedido:', { underline: true }).moveDown(0.5);

    pedido.productos.forEach((prod, i) => {
      const subtotal = prod.precio * prod.cantidad;
      doc
        .fontSize(12)
        .text(`${i + 1}. ${prod.nombre}`)
        .text(`   Cantidad: ${prod.cantidad} x ₡${prod.precio} = ₡${subtotal}`)
        .moveDown(0.3);
    });

    // === TOTAL ===
    doc.moveDown(1).fontSize(14).text(`🔢 Total: ₡${pedido.total}`, {
      bold: true,
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

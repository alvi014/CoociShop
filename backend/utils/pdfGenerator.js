const PDFDocument = require('pdfkit');
const fs = require('fs');
const https = require('https');

/**
 * Genera un PDF tipo pedido con imágenes desde Netlify
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
      const logoURL = 'https://coocishop.netlify.app/img/iconLog.PNG';
      doc.image(logoURL, 50, 45, { width: 50 });
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

    const renderProducto = (i, prod, done) => {
      const subtotal = prod.precio * prod.cantidad;
      const posY = doc.y;

      doc
        .fontSize(12)
        .text(`${i + 1}. ${prod.nombre}`, 50, posY)
        .text(`Cantidad : ${prod.cantidad}`, 50, doc.y)
        .text(`Precio Unitario : CRC${prod.precio.toLocaleString()}`, 50, doc.y)
        .text(`Subtotal : CRC${subtotal.toLocaleString()}`, 50, doc.y);

      let imagenUrl = 'https://coocishop.netlify.app/img/default.png';
      if (prod.imagen && typeof prod.imagen === 'string') {
        const nombre = prod.imagen.startsWith('img/') ? prod.imagen : `img/${prod.imagen}`;
        imagenUrl = `https://coocishop.netlify.app/${nombre}`;
      }

      https.get(imagenUrl, res => {
        const data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          try {
            const imgBuffer = Buffer.concat(data);
            doc.image(imgBuffer, 370, posY, { fit: [100, 100] });
          } catch (e) {
            console.error(`No se pudo mostrar imagen: ${imagenUrl}`);
          }
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
          doc.moveDown(0.5);
          done();
        });
      }).on('error', err => {
        console.error(`Error cargando desde URL: ${imagenUrl}`, err);
        done();
      });
    };

    // Recursivamente renderizar productos uno por uno (esperando carga de imagen)
    const renderProductosRecursivo = (index = 0) => {
      if (index >= pedido.productos.length) {
        doc.moveDown(1).fontSize(14).text(`Total: CRC${pedido.total.toLocaleString()}`, {
          align: 'right',
        });
        doc.moveDown(2).fontSize(10).text('Gracias por su compra en CoociShop.', { align: 'center' });
        doc.end();
        return;
      }
      renderProducto(index, pedido.productos[index], () => renderProductosRecursivo(index + 1));
    };

    renderProductosRecursivo();
  });
}

module.exports = { generarFacturaPDF };

// Lista de sucursales
const sucursales = [
    "Cuidad Quesada", "Sucursal NG", "Florencia", "Alajuela", "Heredia", "San José", "Cartago", "Tilarán", "Nicoya",
    "Zarcero", "San Ramón", "Orotina", "Naranjo", "Grecia", "La Tigra", "Fortuna", "Guatuso", "Santa Rosa", "Aguas Zarcas",
    "Venecia", "Pital", "Puerto Viejo", "Guapiles"
];

// Función para cargar las sucursales en el menú desplegable
function cargarSucursales() {
    const sucursalEnvio = document.getElementById('sucursal-envio');
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        sucursalEnvio.appendChild(option);
    });
}

// Función para mostrar los productos en el carrito
function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoContainer = document.getElementById('carrito-container');
    carritoContainer.innerHTML = '';

    let total = 0;

    carrito.forEach(producto => {
        const productRow = document.createElement('div');
        productRow.className = 'row mb-3';

        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        productRow.innerHTML = `
            <div class="col-4">
                <img src="${producto.imagen}" class="img-fluid" alt="${producto.nombre}">
            </div>
            <div class="col-8">
                <h5>${producto.nombre}</h5>
                <p>${producto.descripcion}</p>
                <p><strong>Precio: ₡${producto.precio}</strong></p>
                <p><strong>Cantidad: ${producto.cantidad}</strong></p>
                <p><strong>Subtotal: ₡${subtotal}</strong></p>
                <button class="btn btn-danger btn-sm" data-product-id="${producto.id}">Eliminar</button>
            </div>
        `;

        carritoContainer.appendChild(productRow);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'row mt-3';
    totalRow.innerHTML = `
        <div class="col-12 text-end">
            <h4>Total: ₡${total}</h4>
        </div>
    `;
    carritoContainer.appendChild(totalRow);

    // Agregar eventos a los botones "Eliminar"
    document.querySelectorAll('.btn-danger').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            eliminarDelCarrito(productId);
        });
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(producto => producto.id == productId);
    if (productoEnCarrito.cantidad > 1) {
        productoEnCarrito.cantidad -= 1;
    } else {
        carrito = carrito.filter(producto => producto.id != productId);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

// Mostrar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    cargarSucursales();
});

// Función para enviar el pedido por correo electrónico
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);

    // Verificar el tamaño del archivo adjunto
    const comprobantePago = document.getElementById('comprobante-pago').files[0];
    if (comprobantePago.size > 5 * 1024 * 1024) { // Limitar a 5MB
        alert('El archivo adjunto es demasiado grande. Por favor, seleccione un archivo de menos de 5MB.');
        return;
    }

    try {
        // Cargar y autenticar Google API
        await cargarGoogleAPI();

        // Subir archivo a Google Drive
        const fileLink = await subirArchivoGoogleDrive(comprobantePago);

        // Agregar los productos y el enlace del archivo al formData
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productos = carrito.map(producto => `${producto.nombre} (Cantidad: ${producto.cantidad})`).join(', ');
        formData.append('productos', productos);
        formData.append('comprobante_link', fileLink);

        // Enviar el formulario por EmailJS
        await emailjs.sendForm('service_gw9jafq', 'template_3rrw3ht', form);

        // Mostrar mensaje de éxito
        alert('Pedido enviado con éxito');
        localStorage.removeItem('carrito');
        mostrarCarrito();
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error. Por favor, inténtelo de nuevo.');
    }
});

// Cargar y autenticar Google API
async function cargarGoogleAPI() {
    return new Promise((resolve, reject) => {
        gapi.load('client:auth2', async () => {
            try {
                await gapi.auth2.init({
                    client_id: 'YOUR_CLIENT_ID',
                    scope: 'https://www.googleapis.com/auth/drive.file'
                });
                const authInstance = gapi.auth2.getAuthInstance();
                if (!authInstance.isSignedIn.get()) {
                    await authInstance.signIn();
                }
                await gapi.client.load('drive', 'v3');
                resolve();
            } catch (error) {
                reject('Error en la autenticación de Google Drive: ' + error);
            }
        });
    });
}

// Subir archivo a Google Drive
async function subirArchivoGoogleDrive(file) {
    return new Promise((resolve, reject) => {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const reader = new FileReader();

        reader.readAsBinaryString(file);
        reader.onload = async function(event) {
            const contentType = file.type || 'application/octet-stream';
            const metadata = {
                name: file.name,
                mimeType: contentType
            };

            const multipartRequestBody =
                delimiter + 'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter + 'Content-Type: ' + contentType + '\r\n\r\n' +
                event.target.result + close_delim;

            try {
                const response = await gapi.client.request({
                    path: '/upload/drive/v3/files',
                    method: 'POST',
                    params: {uploadType: 'multipart'},
                    headers: {
                        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                    },
                    body: multipartRequestBody
                });

                // Obtener ID del archivo subido
                const fileId = response.result.id;
                const fileLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

                // Hacer el archivo accesible públicamente
                await gapi.client.drive.permissions.create({
                    fileId: fileId,
                    resource: {role: 'reader', type: 'anyone'}
                });

                resolve(fileLink);
            } catch (error) {
                reject('Error al subir archivo a Google Drive: ' + error);
            }
        };
    });
}

// 📦 Lista de sucursales disponibles
const sucursales = [
    "Cuidad Quesada", "Sucursal NG", "Florencia", "Alajuela", "Heredia", "San José", "Cartago", "Tilarán", "Nicoya",
    "Zarcero", "San Ramón", "Orotina", "Naranjo", "Grecia", "La Tigra", "Fortuna", "Guatuso", "Santa Rosa", "Aguas Zarcas",
    "Venecia", "Pital", "Puerto Viejo", "Guapiles"
];

// 📦 Cargar las sucursales en el <select>
function cargarSucursales() {
    const sucursalEnvio = document.getElementById('sucursal-envio');
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        sucursalEnvio.appendChild(option);
    });
}

// 📦 Mostrar el contenido del carrito
function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoContainer = document.getElementById('carrito-container');
    carritoContainer.innerHTML = '';

    let total = 0;

    carrito.forEach(producto => {
        const productRow = document.createElement('div');
        productRow.className = 'carrito-item';

        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        let imagenSrc = producto.imagen;
        if (imagenSrc?.startsWith('/img')) {
            imagenSrc = imagenSrc.replace('/img', 'img');
        }

        productRow.innerHTML = `
            <img src="${imagenSrc}" alt="${producto.nombre}">
            <div class="carrito-item-info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion}</p>
                <p><strong>Precio: ₡${producto.precio}</strong></p>
                <p><strong>Cantidad: ${producto.cantidad}</strong></p>
                <p><strong>Subtotal: ₡${subtotal}</strong></p>
            </div>
            <button class="btn-eliminar" data-product-id="${producto.id}">Eliminar</button>
        `;

        carritoContainer.appendChild(productRow);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'carrito-total';
    totalRow.innerHTML = `Total: ₡${total}`;
    carritoContainer.appendChild(totalRow);

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            eliminarDelCarrito(productId);
        });
    });
}

// 📦 Eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(producto => producto.id == productId);

    if (productoEnCarrito) {
        if (productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad -= 1;
        } else {
            carrito = carrito.filter(producto => producto.id != productId);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarrito();
        actualizarCarritoNavbar();
    }
}

// 📦 Inicializar el carrito y sucursales al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    cargarSucursales();
});

// 📦 Manejo del envío del formulario

document.getElementById('checkout-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombreCompleto = document.getElementById('nombre-completo').value;
    const sucursalEnvio = document.getElementById('sucursal-envio').value;
    const comprobantePago = document.getElementById('comprobante-pago').files[0];

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert("❌ No hay productos en el carrito.");
        return;
    }

    const productosValidos = carrito.filter(producto =>
        producto.id && producto.nombre && !isNaN(Number(producto.precio)) && !isNaN(Number(producto.cantidad))
    );

    if (productosValidos.length === 0) {
        alert("❌ Hay productos inválidos en el carrito. Por favor elimínalos.");
        return;
    }

    const total = productosValidos.reduce((acc, producto) => acc + (Number(producto.precio) * Number(producto.cantidad)), 0);

    const pedido = {
        nombreCliente: nombreCompleto,
        sucursal: sucursalEnvio,
        productos: productosValidos.map(producto => ({
             id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: Number(producto.cantidad),
            imagen: producto.imagen || ''
            }))
,
        total
    };

    // 🔐 Validación del reCAPTCHA
    if (typeof grecaptcha === 'undefined') {
        alert("❌ Error al cargar reCAPTCHA. Verificá tu conexión.");
        return;
    }

   // Validación del token CAPTCHA
const captchaToken = grecaptcha.getResponse();
if (!captchaToken || captchaToken.length < 30) {
    alert("⚠️ Por favor, resolvé el CAPTCHA antes de enviar.");
    grecaptcha.reset(); // 🔁 RESETEA SI ES INVÁLIDO
    return;
}


    console.log("🧠 CAPTCHA TOKEN:", captchaToken);

    const formData = new FormData();
    formData.append('nombreCliente', pedido.nombreCliente);
    formData.append('sucursal', pedido.sucursal);
    formData.append('productos', JSON.stringify(pedido.productos));
    formData.append('total', pedido.total);
    formData.append('comprobantePago', comprobantePago);
    formData.append("g-recaptcha-response", captchaToken);

    // 🚀 Enviar datos al backend
    try {
        const response = await fetch("https://coocishop.onrender.com/api/pedidos", {
            method: "POST",
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            data = null;
        }

        if (response.ok) {
            mostrarNotificacion("success", "✅ Pedido enviado con éxito.");
            localStorage.removeItem('carrito');
            mostrarCarrito();
            document.getElementById('checkout-form').reset();
            grecaptcha.reset(); // 🔁 RESETEA TRAS ÉXITO
        } else {
            alert(`❌ Error al enviar pedido: ${(data && data.error) || 'Error desconocido'}`);
            grecaptcha.reset(); // 🔁 RESETEA SI EL BACKEND RECHAZA
        }
        

        actualizarCarritoNavbar();
    } catch (error) {
        console.error("❌ Error al enviar pedido:", error);
        alert("⚠️ No se pudo completar el pedido en este momento. Inténtalo de nuevo más tarde.");
        grecaptcha.reset();
    }

    actualizarCarritoNavbar();
});

// 📌 Actualizar el contador del carrito en el navbar
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");
    if (contadorCarrito) {
        contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}

// 📌 Crear el contenedor de notificaciones si no existe
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML("beforeend", '<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
}

// 📦 Mostrar una notificación visual
function mostrarNotificacion(tipo, mensaje) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
    toast.role = "alert";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// 📌 Asegurar contenedor de notificaciones
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML(
        "beforeend",
        `<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1055;"></div>`
    );
}
// 📦 Inicializar reCAPTCHA al cargar la página
let captchaWidgetId;

function onLoadRecaptcha() {
  captchaWidgetId = grecaptcha.render('captcha-container', {
    sitekey: '6LeB7kcrAAAAAAqp03o7nYZt79W7KNFwULHdHufF'
  });
}

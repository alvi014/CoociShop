// Lista de productos categorizados
const productos = [
    { id: 1, nombre: 'Alcancía', precio: 1000, descripcion: 'Alcancía plástica para tus ahorros.', imagen: '/img/alcancia.PNG', categoria: 'COOCIQUE' },
    { id: 2, nombre: 'Folder', precio: 0, descripcion: 'Organizá tus documentos.', imagen: '/img/folder.PNG', categoria: 'COOCIQUE' },
    { id: 3, nombre: 'Broche', precio: 1000, descripcion: 'Broche metálico.', imagen: '/img/broche.PNG', categoria: 'COOCIQUE' },
    { id: 4, nombre: 'Lapicero Madera', precio: 1000, descripcion: 'Elegante lapicero de madera.', imagen: '/img/lapiceroMadera.PNG', categoria: 'COOCIQUE' },
    { id: 5, nombre: 'Lapicero de Escritorio', precio: 1000, descripcion: 'Práctico lapicero para oficina.', imagen: '/img/lapiceroEscritorio.PNG', categoria: 'COOCIQUE' },
    { id: 6, nombre: 'Lapicero Premiun', precio: 1000, descripcion: 'Lapicero premium de alta calidad.', imagen: '/img/lapiceroPremiun.PNG', categoria: 'COOCIQUE' },
    { id: 7, nombre: 'Lapicero Premiun Mujer', precio: 1000, descripcion: 'Lapicero elegante para mujer.', imagen: '/img/lapiceroMujer.PNG', categoria: 'COOCIQUE MUJER' },
    { id: 8, nombre: 'Llavero Coocique', precio: 1000, descripcion: 'Llavero con diseño de casita.', imagen: '/img/Llavero.PNG', categoria: 'COOCIQUE' },
    { id: 9, nombre: 'Bolsa Azul', precio: 3000, descripcion: 'Bolsa de tela práctica microfibra.', imagen: '/img/bolsaAzul.PNG', categoria: 'COOCIQUE' },
    { id: 10, nombre: 'Post it', precio: 1000, descripcion: 'Adhesivas para apuntes rápidos.', imagen: '/img/postIt.PNG', categoria: 'COOCIQUE' },
    { id: 11, nombre: 'Post it NG', precio: 1000, descripcion: 'Adhesivas con colores brillantes.', imagen: '/img/postitNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 12, nombre: 'Libreta + Lápicero Mujer', precio: 2000, descripcion: 'Set con libreta y lápicero femenino.', imagen: '/img/libretaMujer.PNG', categoria: 'COOCIQUE MUJER' },
    { id: 13, nombre: 'Botella NG', precio: 1500, descripcion: 'Práctica y Resistente', imagen: '/img/botellaNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 14, nombre: 'Lápiz Color', precio: 500, descripcion: 'Set de lápices de colores vibrantes.', imagen: '/img/lapicesColor.PNG', categoria: 'COOCIQUE NG' },
    { id: 15, nombre: 'Monedero NG', precio: 1000, descripcion: 'Guardá tú menudillo', imagen: '/img/monederoNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 16, nombre: 'Kit Escolar', precio: 2000, descripcion: 'Set escolar completo', imagen: '/img/setescolar.PNG', categoria: 'COOCIQUE NG' },
    { id: 17, nombre: 'Chonete', precio: 3000, descripcion: 'Tú acompañante en el campo y fiestas patrias.', imagen: '/img/Chonete.PNG', categoria: 'COOCIQUE' }
];


document.addEventListener('DOMContentLoaded', () => {
    cargarProductosPorCategoria();
});

function cargarProductosPorCategoria() {
    const params = new URLSearchParams(window.location.search);
    const categoriaSeleccionada = params.get("categoria") || "TODOS";
    const productosFiltrados = (categoriaSeleccionada === "TODOS")
        ? productos
        : productos.filter(producto => producto.categoria === categoriaSeleccionada);
    generarProductos(productosFiltrados);
}

document.getElementById('product-container').addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (card) {
        const productId = card.dataset.productId;
        const producto = productos.find(p => p.id == productId);
        if (producto) mostrarVistaPrevia(producto);
    }
});

// Función para mostrar la vista previa del producto en el modal
function mostrarVistaPrevia(producto) {
    // Actualiza el contenido del modal
    const modalLabel = document.getElementById('productModalLabel');
    const modalBody = document.getElementById('productModalBody');
    modalLabel.textContent = producto.nombre;
    modalBody.innerHTML = `
        <img src="${producto.imagen}" class="img-fluid mb-3" alt="${producto.nombre}">
        <p>${producto.descripcion}</p>
        <p><strong>Precio: ₡${producto.precio}</strong></p>
        <div class="mb-3">
            <label for="cantidadProducto" class="form-label">Cantidad:</label>
            <input type="number" id="cantidadProducto" class="form-control" value="1" min="1">
        </div>
    `;
    
    // Crear el botón y asignarle el evento para agregar al carrito
    const agregarBtn = document.createElement('button');
    agregarBtn.className = "btn btn-primary";
    agregarBtn.textContent = "Agregar al carrito";
    agregarBtn.addEventListener("click", function() {
        agregarAlCarrito(producto.id);
    });
    modalBody.appendChild(agregarBtn);
    
    // Mostrar el modal
    const modalElement = document.getElementById('productModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Función para agregar un producto al carrito
function agregarAlCarrito(productoId) {
    console.log("Función agregarAlCarrito invocada para productoId:", productoId);
    
    // Obtén la cantidad del input
    const cantidadInput = document.getElementById('cantidadProducto');
    if (!cantidadInput) {
        console.error("No se encontró el input 'cantidadProducto'");
        return;
    }
    const cantidad = parseInt(cantidadInput.value, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, ingrese una cantidad válida.");
        return;
    }
    
    // Verifica que la variable global 'productos' exista
    if (typeof productos === 'undefined') {
        console.error("La variable 'productos' no está definida");
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        alert("Error al agregar el producto.");
        return;
    }
    
    // Agregar el producto al carrito (incluyendo imagen y descripción)
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(p => p.id === productoId);
    
    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidad;
    } else {
        carrito.push({ 
            id: producto.id, 
            nombre: producto.nombre, 
            precio: producto.precio, 
            cantidad,
            imagen: producto.imagen,         // Se guarda la imagen
            descripcion: producto.descripcion  // Se guarda la descripción
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Antes de ocultar el modal, quita el foco del elemento activo para evitar el error de aria-hidden
    document.activeElement.blur();
    
    // Ocultar el modal
    const modalElement = document.getElementById('productModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
    
    alert("Producto agregado al carrito.");
}

function generarProductos(productos) {
    const contenedor = document.getElementById('product-container');
    contenedor.innerHTML = '';
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card col-md-4 col-lg-3 mb-4';
        card.dataset.productId = producto.id;
        card.innerHTML = `
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text"><strong>Precio: ₡${producto.precio}</strong></p>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

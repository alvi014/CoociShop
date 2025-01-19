

// Lista de productos
const productos = [
    { id: 1, nombre: 'Alcancía', precio: 1000, descripcion: 'Alcancía plástica para tus ahorros.', imagen: '/img/alcancia.PNG' },
    { id: 2, nombre: 'Folder', precio: 0, descripcion: 'Folder ideal para organizar documentos.', imagen: '/img/folder.PNG' },
    { id: 3, nombre: 'Broche', precio: 1000, descripcion: 'Broche metálico.', imagen: '/img/broche.PNG' },
    { id: 4, nombre: 'Lapicero Madera', precio: 1000, descripcion: 'Elegante lapicero de madera.', imagen: '/img/lapiceroMadera.PNG' },
    { id: 5, nombre: 'Lapicero de Escritorio', precio: 1000, descripcion: 'Práctico lapicero para oficina.', imagen: '/img/lapiceroEscritorio.PNG' },
    { id: 6, nombre: 'Lapicero Premiun', precio: 1000, descripcion: 'Lapicero premium de alta calidad.', imagen: '/img/lapiceroPremiun.PNG' },
    { id: 7, nombre: 'Lapicero Premiun Mujer', precio: 1000, descripcion: 'Lapicero elegante para mujer.', imagen: '/img/lapiceroMujer.PNG' },
    { id: 8, nombre: 'Llavero Coocique', precio: 1000, descripcion: 'Llavero con diseño de casita.', imagen: '/img/Llavero.PNG' },
    { id: 9, nombre: 'Bolsa Azul', precio: 3000, descripcion: 'Bolsa de tela práctica microfibra.', imagen: '/img/bolsaAzul.PNG' },
    { id: 10, nombre: 'Post it', precio: 1000, descripcion: 'Notas adhesivas para apuntes rápidos.', imagen: '/img/postIt.PNG' },
    { id: 11, nombre: 'Post it NG', precio: 1000, descripcion: 'Notas adhesivas de colores brillantes.', imagen: '/img/postitNG.PNG' },
    { id: 12, nombre: 'Libreta + Lápicero Mujer', precio: 2000, descripcion: 'Set con libreta y lápicero femenino.', imagen: '/img/libretaMujer.PNG' },
    { id: 13, nombre: 'Lápiz Color', precio: 500, descripcion: 'Set de lápices de colores vibrantes.', imagen: '/img/lapicesColor.PNG' },
];

// Selecciona el contenedor donde se mostrarán los productos
const productContainer = document.getElementById('product-container');

// Genera el HTML de cada producto dinámicamente
productos.forEach(producto => {
    const productCard = `
        <div class="col-md-4 mb-4">
            <div class="card">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text"><strong>Precio: ₡${producto.precio}</strong></p>
                    <button class="btn btn-primary">Agregar al Canasto</button>
                </div>
            </div>
        </div>
    `;
    productContainer.innerHTML += productCard;
});


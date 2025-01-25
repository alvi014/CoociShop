// Lista de productos categorizados
const productos = [
    { id: 1, nombre: 'Alcancía', precio: 1000, descripcion: 'Alcancía plástica para tus ahorros.', imagen: '/img/alcancia.PNG', categoria: 'COOCIQUE' },
    { id: 2, nombre: 'Folder', precio: 0, descripcion: 'Folder ideal para organizar documentos.', imagen: '/img/folder.PNG', categoria: 'COOCIQUE' },
    { id: 3, nombre: 'Broche', precio: 1000, descripcion: 'Broche metálico.', imagen: '/img/broche.PNG', categoria: 'COOCIQUE' },
    { id: 4, nombre: 'Lapicero Madera', precio: 1000, descripcion: 'Elegante lapicero de madera.', imagen: '/img/lapiceroMadera.PNG', categoria: 'COOCIQUE' },
    { id: 5, nombre: 'Lapicero de Escritorio', precio: 1000, descripcion: 'Práctico lapicero para oficina.', imagen: '/img/lapiceroEscritorio.PNG', categoria: 'COOCIQUE' },
    { id: 6, nombre: 'Lapicero Premiun', precio: 1000, descripcion: 'Lapicero premium de alta calidad.', imagen: '/img/lapiceroPremiun.PNG', categoria: 'COOCIQUE' },
    { id: 7, nombre: 'Lapicero Premiun Mujer', precio: 1000, descripcion: 'Lapicero elegante para mujer.', imagen: '/img/lapiceroMujer.PNG', categoria: 'COOCIQUE MUJER' },
    { id: 8, nombre: 'Llavero Coocique', precio: 1000, descripcion: 'Llavero con diseño de casita.', imagen: '/img/Llavero.PNG', categoria: 'COOCIQUE' },
    { id: 9, nombre: 'Bolsa Azul', precio: 3000, descripcion: 'Bolsa de tela práctica microfibra.', imagen: '/img/bolsaAzul.PNG', categoria: 'COOCIQUE' },
    { id: 10, nombre: 'Post it', precio: 1000, descripcion: 'Notas adhesivas para apuntes rápidos.', imagen: '/img/postIt.PNG', categoria: 'COOCIQUE' },
    { id: 11, nombre: 'Post it NG', precio: 1000, descripcion: 'Notas adhesivas de colores brillantes.', imagen: '/img/postitNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 12, nombre: 'Libreta + Lápicero Mujer', precio: 2000, descripcion: 'Set con libreta y lápicero femenino.', imagen: '/img/libretaMujer.PNG', categoria: 'COOCIQUE MUJER' },
    { id: 13, nombre: 'Botella NG', precio: 1500, descripcion: 'Práctica y Resistente', imagen: '/img/botellaNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 14, nombre: 'Lápiz Color', precio: 500, descripcion: 'Set de lápices de colores vibrantes.', imagen: '/img/lapicesColor.PNG', categoria: 'COOCIQUE NG' },
    { id: 15, nombre: 'Monedero NG', precio: 1000, descripcion: 'Guardá tú menudillo', imagen: '/img/monederoNG.PNG', categoria: 'COOCIQUE NG' },
    { id: 16, nombre: 'Kit Escolar', precio: 2000, descripcion: 'Set escolar completo', imagen: '/img/setescolar.PNG', categoria: 'COOCIQUE NG' },
    { id: 17, nombre: 'Chonete', precio: 3000, descripcion: 'Tú acompañante en el campo y fiestas patrias', imagen: '/img/Chonete.PNG', categoria: 'COOCIQUE' },
];

// Selecciona el contenedor donde se mostrarán los productos
const productContainer = document.getElementById('product-container');

// Filtra los productos por categoría seleccionada
const categoriaSeleccionada = 'COOCIQUE'; // Cambia esta variable según la categoría deseada
const productosFiltrados = productos.filter(producto => producto.categoria === categoriaSeleccionada);

// Genera el HTML de cada producto dinámicamente
productosFiltrados.forEach(producto => {
    const productCard = `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card product-card">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body text-center">
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

// Filtra y muestra los productos al hacer clic en una categoría del submenú
const categorias = document.querySelectorAll('.categoria');
categorias.forEach(categoria => {
    categoria.addEventListener('click', (e) => {
        const categoriaSeleccionada = e.target.dataset.categoria;
        const productosFiltrados = productos.filter(producto => producto.categoria === categoriaSeleccionada);
        productContainer.innerHTML = '';
        productosFiltrados.forEach(producto => {
            const productCard = `
                <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card product-card">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body text-center">
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
    });
});

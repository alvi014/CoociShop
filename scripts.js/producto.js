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
    { id: 17, nombre: 'Chonete', precio: 3000, descripcion: 'Tú acompañante en el campo y fiestas patrias', imagen: '/img/Chonete.PNG', categoria: 'COOCIQUE' },
];

// Selecciona el contenedor donde se mostrarán los productos
const productContainer = document.getElementById('product-container');

// Función para generar el HTML de cada producto dinámicamente
function generarProductos(productos) {
    productContainer.innerHTML = '';
    productos.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';

        const card = document.createElement('div');
        card.className = 'card product-card';

        const img = document.createElement('img');
        img.src = producto.imagen;
        img.className = 'card-img-top';
        img.alt = producto.nombre;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = producto.nombre;

        const cardTextDesc = document.createElement('p');
        cardTextDesc.className = 'card-text';
        cardTextDesc.textContent = producto.descripcion;

        const cardTextPrice = document.createElement('p');
        cardTextPrice.className = 'card-text';
        cardTextPrice.textContent = `Precio: ₡${producto.precio}`;

        const button = document.createElement('button');
        button.className = 'btn btn-primary';
        button.textContent = 'Agregar al Canasto';

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardTextDesc);
        cardBody.appendChild(cardTextPrice);
        cardBody.appendChild(button);

        card.appendChild(img);
        card.appendChild(cardBody);

        productCard.appendChild(card);

        productContainer.appendChild(productCard);
    });
}

// Filtra los productos por categoría seleccionada
const urlParams = new URLSearchParams(window.location.search);
const categoriaSeleccionada = urlParams.get('categoria') || 'COOCIQUE';
const productosFiltrados = categoriaSeleccionada === 'TODOS' ? productos : productos.filter(producto => producto.categoria === categoriaSeleccionada);

// Genera los productos al cargar la página
generarProductos(productosFiltrados);

// Filtra y muestra los productos al hacer clic en una categoría del submenú
const categorias = document.querySelectorAll('.categoria');
categorias.forEach(categoria => {
    categoria.addEventListener('click', (e) => {
        e.preventDefault();
        const categoriaSeleccionada = e.target.dataset.categoria;
        const productosFiltrados = categoriaSeleccionada === 'TODOS' ? productos : productos.filter(producto => producto.categoria === categoriaSeleccionada);
        generarProductos(productosFiltrados);
    });
});

// Muestra todos los productos al hacer clic en el botón "Todos los Productos"
const todosProductosBtn = document.getElementById('todos-productos-btn');
todosProductosBtn.addEventListener('click', () => {
    generarProductos(productos);
});

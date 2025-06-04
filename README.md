CoociShop

Tienda Virtual de Coocique para socios, desarrollada como un sistema de compra de promocionales.

📋 Tabla de Contenidos

Descripción General

Instalación

Uso

Frontend

Características

Variables de Entorno

Arquitectura del Sistema

Contribuciones

Licencia

Contacto

📦 Descripción General

Este proyecto consiste en una tienda virtual donde los socios pueden adquirir productos promocionales de la cooperativa. Está compuesto por un frontend estático (HTML/CSS/JS) y un backend construido con Node.js, Express y MongoDB.

La comunicación entre clientes y administrador se refuerza con notificaciones por correo, autenticación con JWT, y carga de comprobantes de pago.

🛠 Instalación

Clona este repositorio e instala las dependencias:

git clone https://github.com/alvi014/coocishop.git
cd coocishop
npm install

🚀 Uso

# Correr servidor en modo desarrollo
npm run dev

Frontend estático puede desplegarse desde Netlify. Backend se aloja en Render o localmente.

🌐 Frontend

Desarrollado con HTML5, CSS3, Bootstrap y JavaScript. Cada vista está desacoplada y asociada a un JS dinámico.

Archivos HTML clave:

index.html — Portada principal con categorías

producto.html — Render dinámico de productos

carrito.html — Carrito y formulario de envío con validación

admin.html — Login admin con formulario

gestionProducto.html — CRUD de productos

contacto.html — Información de contacto

comoComprar.html — Guía paso a paso

navbar.html — Barra de navegación común

✨ Características

Autenticación de administrador con JWT

CRUD completo de productos

Carga de comprobantes de pago (carrito.html)

Envío de correos automáticos con Nodemailer

Control de stock en backend

Filtros por categoría de producto

Interfaz responsiva y accesible

🔐 Variables de Entorno

Crea un archivo .env en la raíz del proyecto:

MONGO_URI=
PORT=3000
EMAIL_ADMIN=
EMAIL_PASS=
JWT_SECRET=
NODE_ENV=development

🧭 Arquitectura del Sistema

A continuación se muestra el flujo de componentes principales del sistema:



🧑 Usuario (Navegador)
   ↓
🌐 Frontend (Netlify - HTML/JS/CSS)
   ↓
🔧 Backend API (Render - Express.js + Node.js)
   ↓
🌍 API externa o base de datos (si aplica)

🤝 Contribuciones

¡Contribuciones son bienvenidas! Abre un issue o PR con mejoras o sugerencias.

📝 Licencia

Este proyecto está licenciado bajo los términos de uso de Coocique.

📬 Contacto

Desarrollador: avictor@coocique.fi.cr

Proyecto creado para facilitar el acceso a promocionales de socios de Coocique.
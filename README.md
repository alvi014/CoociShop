# CoociShop 🛒

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

**CoociShop** es una plataforma de comercio electrónico diseñada para los socios de Coocique. Este sistema integral permite la visualización, selección y compra de productos promocionales, gestionando el flujo completo desde el pedido hasta la facturación automática.

---

## 📋 Tabla de Contenidos

- [📦 Descripción General](#-descripción-general)
- [📸 Galería](#-galería)
- [🛠 Instalación](#-instalación)
- [🚀 Uso](#-uso)
- [🌐 Frontend](#-frontend)
- [🧪 Backend](#-backend)
- [✨ Características](#-características)
- [🔐 Variables de Entorno](#-variables-de-entorno)
- [🧭 Arquitectura del Sistema](#-arquitectura-del-sistema)
- [🤝 Contribuciones](#-contribuciones)
- [📝 Licencia](#-licencia)
- [📬 Contacto](#-contacto)

---

## 📦 Descripción General

Este proyecto Full Stack consiste en una tienda virtual donde los socios pueden adquirir productos promocionales de la cooperativa.

Está compuesto por:

- **Frontend**: Interfaz de usuario intuitiva y responsiva desarrollada con HTML5, CSS3 (Bootstrap) y JavaScript Vanilla.
- **Backend**: API RESTful construida con Node.js y Express, utilizando ES Modules.
- **Base de Datos**: MongoDB Atlas para el almacenamiento escalable de productos y pedidos.

🔁 La comunicación entre clientes y administrador se refuerza con:

- **Notificaciones automáticas**: Envío de correos con Nodemailer.
- **Seguridad**: Autenticación robusta mediante JWT (JSON Web Tokens).
- **Gestión de Archivos**: Carga de imágenes y comprobantes (integración con Cloudinary/Multer).
- **Facturación**: Generación dinámica de PDFs con `pdf-lib` y `pdfkit`.

---

## 📸 Galería

> *Capturas de pantalla de la aplicación en funcionamiento.*

| Inicio | Detalle de Producto |
|:---:|:---:|
| ![Pantalla de Inicio](screenshots/inicio.png) | ![Detalle de Producto](screenshots/producto.png) |

| Carrito | Panel Admin |
|:---:|:---:|
| ![Carrito de Compras](screenshots/carrito.png) | ![Panel de Administración](screenshots/admin.png) |

---

## 🛠 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/alvi014/coocishop.git
cd coocishop
npm install
```

---

## 🚀 Uso

```bash
# Correr servidor en modo desarrollo
npm run dev
```

- El frontend puede desplegarse desde **Netlify**
- El backend se aloja en **Render** o se ejecuta localmente

---

## 🌐 Frontend

El frontend fue desarrollado con **HTML5, CSS3, Bootstrap y JavaScript**. Cada vista HTML tiene su lógica en archivos JS correspondientes.

### 📁 Archivos HTML principales

```
├── index.html              # Portada con categorías
├── producto.html           # Lista dinámica de productos
├── carrito.html            # Carrito + formulario + comprobante
├── admin.html              # Login administrador
├── gestionProducto.html    # Gestión y CRUD de productos
├── contacto.html           # Información de contacto
├── comoComprar.html        # Guía paso a paso
├── navbar.html             # Barra de navegación reutilizable
```

### 📜 Scripts de JavaScript

```
├── scripts/inicio.js             # Carga dinámica del navbar y portada
├── scripts/navbar.js             # Inserta barra de navegación en cada página
├── scripts/producto.js           # Renderiza productos por categoría en producto.html
├── scripts/carrito.js            # Manejo del carrito, validación de formulario y envío
├── scripts/admin_login.js        # Login y validación de administrador
├── scripts/gestionProducto.js    # Operaciones CRUD para gestión de productos
```

---

## 🧪 Backend

El backend ofrece una API REST robusta para manejar productos, pedidos y autenticación de administrador. Desarrollado en **Node.js + Express**, conectado a **MongoDB Atlas** con **Mongoose**.

### 🔁 Rutas principales del backend

#### 📦 Productos (admin)

```
POST   /api/admin/producto         # Crear producto
PUT    /api/admin/producto/:id     # Actualizar producto
DELETE /api/admin/producto/:id     # Eliminar producto
GET    /api/productos              # Obtener todos los productos
GET    /api/productos/:id          # Obtener producto por ID
POST   /api/admin/upload           # Subir imagen (con Multer)
```

#### 🛒 Pedidos

```
POST /api/pedidos                  # Registrar pedido y restar stock
```
- Control de concurrencia en stock

#### 🔐 Autenticación

```
POST /api/auth/register            # Registrar nuevo admin
POST /api/auth/login               # Login admin y obtener token JWT
```

### 🧾 Modelos principales (MongoDB)

- `Admin`: Email + contraseña hasheada
- `Producto`: id, nombre, precio, descripción, imagen, stock, categoría

### 🖨 Factura PDF automática
Al recibir un pedido, el sistema utiliza **pdf-lib** y **pdfkit** para generar un documento PDF detallado con la información de la compra y las imágenes de los productos, el cual se adjunta automáticamente al correo de confirmación.


## ✨ Características

- **Seguridad Avanzada**: Autenticación de administradores mediante **JWT** y contraseñas hasheadas.
- **Gestión de Inventario**: CRUD completo de productos con actualización de stock en tiempo real.
- **Procesamiento de Imágenes**: Integración con **Cloudinary** para almacenamiento optimizado de imágenes de productos.
- **Automatización**: Envío de correos transaccionales (confirmación de pedido, alertas) usando **Nodemailer**.
- **Generación de Documentos**: Creación de facturas PDF al vuelo.
- **Validación**: Protección contra spam mediante Google reCAPTCHA.
- **Diseño Responsivo**: Interfaz adaptada a móviles y escritorio usando Bootstrap.


## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes claves:

```env
MONGO_URI=
PORT=3000
EMAIL_ADMIN=
EMAIL_PASS=
JWT_SECRET=
NODE_ENV=development
RECAPTCHA_SECRET=
```

---

## 🧭 Arquitectura del Sistema

Diagrama representativo de los componentes del sistema:

```plaintext
🧑 Usuario (Navegador)
   ↓
🌐 Frontend (Netlify - HTML/JS/CSS)
   ↓
🔧 Backend API (Render - Express.js + Node.js)
   ↓
🌍 API externa o base de datos (si aplica)
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto:
1. Haz un Fork del repositorio.
2. Crea una rama con tu nueva característica (`git checkout -b feature/AmazingFeature`).
3. Realiza un Commit (`git commit -m 'Add some AmazingFeature'`).
4. Haz Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.


## 📬 Contacto

- 👨‍💻 Desarrollador: Alvaro Victor Zamora
- Correo: alvarovictor06@gmail.com
- Telf: 8722-1109

> Proyecto creado para facilitar el acceso a promocionales de socios de Coocique.

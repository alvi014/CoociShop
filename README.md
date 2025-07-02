# CoociShop

Tienda Virtual de Coocique para socios, desarrollada como un sistema de compra de promocionales.

---

## 📋 Tabla de Contenidos

- [📦 Descripción General](#-descripción-general)
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

Este proyecto consiste en una tienda virtual donde los socios pueden adquirir productos promocionales de la cooperativa.

Está compuesto por:

- Un frontend estático (HTML/CSS/JS)
- Un backend construido con Node.js, Express y MongoDB

🔁 La comunicación entre clientes y administrador se refuerza con:

- Notificaciones por correo
- Autenticación con JWT
- Carga de comprobantes de pago

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
- Valida reCAPTCHA (Google)
- Valida stock, guarda pedido, descuenta inventario
- Envia PDF y comprobante por correo

#### 🔐 Autenticación

```
POST /api/auth/register            # Registrar nuevo admin
POST /api/auth/login               # Login admin y obtener token JWT
```

### 🧾 Modelos principales (MongoDB)

- `Admin`: Email + contraseña hasheada
- `Producto`: id, nombre, precio, descripción, imagen, stock, categoría
- `Pedido`: productos, total, sucursal, comprobante, estado, fecha

### 🖨 Factura PDF automática

Al recibir un pedido, se genera un PDF con detalles e imágenes usando **pdf-lib** y se envía por correo

---

## ✨ Características

- 🔐 Autenticación de administrador con JWT
- 🛍️ CRUD completo de productos
- 📎 Carga de comprobantes de pago
- 📧 Envío de correos automáticos con Nodemailer
- 📦 Control de stock por pedido
- 🔍 Filtros por categoría de producto
- 📱 Interfaz responsiva (Bootstrap)

---

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

¡Contribuciones son bienvenidas!


---

## 📝 Licencia

Este proyecto está licenciado bajo los términos de uso de Coocique.

---

## 📬 Contacto

- 👨‍💻 Desarrollador: Alvaro Victor

-   Telf: 8722-1109

> Proyecto creado para facilitar el acceso a promocionales de socios de Coocique.

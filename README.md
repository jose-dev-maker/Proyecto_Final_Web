
# StockFlow — Sistema de Gestión de Inventario y Pedidos

StockFlow es una aplicación web fullstack desarrollada como proyecto del segundo parcial de Programación Web Avanzada. Sirve para gestionar el inventario de una empresa, crear y dar seguimiento a pedidos, y generar reportes de stock bajo. Está construida con Node.js, Express y TypeScript en el backend, React en el frontend, y Prisma como ORM con una base de datos SQLite.

El sistema maneja dos roles de usuario: el administrador tiene acceso completo al inventario y a los reportes, mientras que el operador puede consultar productos, crear pedidos y cancelarlos.


## Estructura del repositorio

El proyecto está dividido en dos carpetas. La carpeta `backend` contiene toda la API REST y la lógica de negocio, y la carpeta `frontend` contiene la interfaz web en React. Cada una tiene su propio `package.json` y se corre de forma independiente, aunque el frontend depende de que el backend esté corriendo para funcionar.


## Cómo instalar y correr el proyecto

Primero que nada, necesitás tener Node.js v18 o superior instalado en tu máquina.

**Backend**

Entrá a la carpeta del backend e instalá las dependencias:

    cd backend
    npm install

Después creá un archivo `.env` dentro de la carpeta `backend` con el siguiente contenido:

    DATABASE_URL="file:./dev.db"
    JWT_SECRET="stockflow_super_secret_key_2025"
    JWT_EXPIRES_IN="24h"
    PORT=3000

Ejecutá las migraciones para que Prisma cree la base de datos:

    npx prisma migrate dev --name init

Cargá los datos iniciales de prueba:

    npm run prisma:seed

Y arrancá el servidor:

    npm run dev

El backend va a quedar corriendo en http://localhost:3000.

**Frontend**

En otra terminal, entrá a la carpeta del frontend e instalá sus dependencias:

    cd frontend
    npm install
    npm run dev

La aplicación va a estar disponible en http://localhost:5173. No necesitás configurar nada más, ya está apuntando al backend por defecto.


## Usuarios de prueba

El seed crea dos usuarios listos para usar:

- admin@stockflow.com con contraseña admin123, tiene rol de administrador
- operator@stockflow.com con contraseña operator123, tiene rol de operador


## Qué puede hacer cada rol

El administrador puede ver el listado de productos, crearlos, editarlos y eliminarlos. También puede crear pedidos, ver el detalle de cualquier pedido, cambiar su estado y acceder al reporte de productos con stock bajo.

El operador puede ver el inventario y crear pedidos, ver el detalle de sus pedidos y cancelarlos si todavía no fueron despachados. No tiene acceso a la gestión de productos ni a los reportes.


## Endpoints de la API

Las rutas públicas, que no requieren autenticación, son el registro de usuarios en POST /api/auth/register y el login en POST /api/auth/login.

Para todas las demás rutas hay que enviar el token JWT en el header de la petición, así: Authorization: Bearer el-token-que-devuelve-el-login.

Las rutas disponibles para cualquier usuario autenticado son: listar productos en GET /api/products (acepta un query param ?categoryId= para filtrar), crear un pedido en POST /api/orders, ver el detalle de un pedido en GET /api/orders/:id, y cambiar el estado de un pedido en PATCH /api/orders/:id/status.

Las rutas exclusivas para administradores son: crear un producto en POST /api/products, actualizar uno en PUT /api/products/:id, eliminarlo en DELETE /api/products/:id, y ver el reporte de stock bajo en GET /api/reports/low-stock.

Cuando se cancela un pedido, el stock de los productos involucrados se reintegra automáticamente mediante una transacción en la base de datos.


## Páginas del frontend

La única página pública es el login en /login. Una vez autenticado, las páginas disponibles son el dashboard con un resumen general en /dashboard, el listado de productos en /productos, la sección de pedidos en /pedidos, el detalle de un pedido en /pedidos/:id y el reporte de stock bajo en /reportes (esta última solo visible para administradores).

Si intentás acceder a una página protegida sin estar logueado, la aplicación te redirige al login automáticamente. Si el token expira mientras estás usando la app, cierra la sesión y te manda al login sin que tengas que hacer nada.


## Tecnologías utilizadas

El backend está hecho con Node.js, Express y TypeScript. Usa Prisma como ORM sobre SQLite, JSON Web Tokens para la autenticación y Zod para validar los datos de entrada. El frontend está hecho en React con Vite, y usa Context API para manejar el estado de autenticación.

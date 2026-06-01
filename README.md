# StockFlow API

API REST para gestión de logística y despacho, desarrollada con Node.js, Express, TypeScript y Prisma ORM como proyecto del segundo parcial de Programación Web Avanzada.

---

Requisitos previos

Tener instalado Node.js v18 o superior y npm v9 o superior.

---

Cómo instalar y correr el proyecto

Primero instala las dependencias:

    npm install

Luego crea un archivo .env en la raíz del proyecto con este contenido:

    DATABASE_URL="file:./dev.db"
    JWT_SECRET="stockflow_super_secret_key_2025"
    JWT_EXPIRES_IN="24h"
    PORT=3000

Después ejecuta las migraciones para crear la base de datos:

    npx prisma migrate dev --name init

Siembra los datos iniciales de prueba:

    npm run prisma:seed

Esto crea dos usuarios listos para usar:
- admin@stockflow.com con contraseña admin123 y rol ADMIN
- operator@stockflow.com con contraseña operator123 y rol OPERATOR

También crea 2 categorías y 3 productos de ejemplo, uno de ellos con stock bajo para probar el endpoint de alertas.

Finalmente arranca el servidor:

    npm run dev

El servidor queda disponible en http://localhost:3000

---

Endpoints disponibles

Rutas públicas (no requieren token):
- POST /api/auth/register — registrar un nuevo usuario
- POST /api/auth/login — iniciar sesión y obtener el token JWT

Rutas para cualquier usuario autenticado:
- GET /api/products — listar productos, acepta ?categoryId= como filtro
- POST /api/orders — crear un pedido (operación transaccional)
- GET /api/orders/:id — ver los detalles de un pedido
- PATCH /api/orders/:id/status — cambiar el estado de un pedido

Rutas exclusivas para administradores:
- POST /api/products — crear un producto
- PUT /api/products/:id — modificar un producto
- DELETE /api/products/:id — eliminar un producto
- GET /api/reports/low-stock — ver productos con stock por debajo del mínimo

Para las rutas protegidas hay que enviar el header: Authorization: Bearer <token>

---

Ejemplos de uso

Login:

    POST /api/auth/login
    Content-Type: application/json

    {
      "email": "admin@stockflow.com",
      "password": "admin123"
    }

Crear un pedido:

    POST /api/orders
    Authorization: Bearer <token>
    Content-Type: application/json

    {
      "items": [
        { "productId": 1, "quantity": 2 },
        { "productId": 3, "quantity": 1 }
      ]
    }

Cancelar un pedido (el stock se reintegra automáticamente):

    PATCH /api/orders/1/status
    Authorization: Bearer <token>
    Content-Type: application/json

    {
      "status": "CANCELLED"
    }

---

Estructura del proyecto

    src/
    ├── index.ts                  punto de entrada, configura Express y registra las rutas
    ├── types/
    │   ├── index.ts              interfaces y DTOs de TypeScript
    │   └── AppError.ts           clase de error personalizada con statusCode
    ├── prisma/
    │   ├── client.ts             instancia única de PrismaClient
    │   └── seed.ts               datos iniciales de prueba
    ├── validators/
    │   └── schemas.ts            esquemas Zod para validar los datos de entrada
    ├── middlewares/
    │   ├── authMiddleware.ts     verifica el JWT en cada petición protegida
    │   ├── roleGuard.ts          bloquea acceso si el rol no está permitido
    │   ├── validateRequest.ts    valida req.body contra un esquema Zod
    │   └── errorHandler.ts       captura todos los errores y responde en JSON
    ├── services/
    │   ├── AuthService.ts        registro, hash de contraseña, login y token
    │   ├── ProductService.ts     CRUD de productos y consulta de stock bajo
    │   └── OrderService.ts       creación transaccional de pedidos y gestión de estados
    ├── controllers/
    │   ├── AuthController.ts
    │   ├── ProductController.ts
    │   └── OrderController.ts
    └── routes/
        ├── authRoutes.ts
        ├── productRoutes.ts
        ├── orderRoutes.ts
        └── reportRoutes.ts

    prisma/
    └── schema.prisma             definición de modelos y relaciones de la base de datos

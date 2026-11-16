# 📦 ShipNow API — Arquitectura por Capas, Mocking & Manejo Profesional de Errores

Bienvenido al repositorio de la API de **ShipNow**, estructurada profesionalmente en **3 capas (Controller - Service - Repository)**, con validación estricta de variables de entorno, sistema de **Mocking y Seeding relacional** y una **capa centralizada de manejo de errores** con diccionario y errores personalizados del dominio.

---

## 🏗️ Arquitectura por Capas + Gestión Centralizada de Errores

```text
[ Cliente HTTP ]
       │
       ▼
[ Routes ] (Conecta la URL con el método del Controller)
       │
       ▼
[ Controllers ] (Gestiona req/res exitosos y deriva cualquier error con next(error))
       │
       ▼
[ Services ] (Reglas de negocio, validaciones y lanzamiento de Errores Personalizados del Dominio)
       │
       ▼
[ Repositories ] (Único punto de acceso a Mongoose / MongoDB)
       │
       ▼
[ Middleware Global de Errores ] (Único punto que transforma errores en respuestas HTTP uniformes)
```

---

## 📁 Estructura del Proyecto

```text
backend3/
├── src/
│   ├── config/
│   │   ├── env.config.js           # Validación de variables de entorno con dotenv
│   │   ├── db.config.js            # Conexión centralizada a MongoDB con Mongoose
│   │   └── index.js                # Re-exportación de configuración
│   ├── constants/
│   │   └── index.js                # Constantes inmutables congeladas (Object.freeze)
│   ├── errors/
│   │   ├── error.dictionary.js     # Diccionario centralizado de errores (códigos, status y mensajes)
│   │   ├── custom.error.js         # Clase base AppError/CustomError y errores específicos del dominio
│   │   └── index.js                # Punto de exportación unificado de errores
│   ├── middlewares/
│   │   └── error.middleware.js     # Middleware global de errores y middleware 404
│   ├── utils/
│   │   ├── constants.js            # Re-exportación de constantes y diccionario
│   │   ├── validators.util.js      # Validadores puros (ObjectId, Email) desacoplados de Mongoose
│   │   └── mock.util.js            # Generador de datos simulados con Faker
│   ├── models/
│   │   ├── product.model.js        # Esquema Mongoose de Productos
│   │   ├── user.model.js           # Esquema Mongoose de Usuarios
│   │   ├── order.model.js          # Esquema Mongoose de Pedidos
│   │   └── delivery.model.js       # Esquema Mongoose de Entregas
│   ├── repositories/
│   │   ├── product.repository.js   # Persistencia de Productos
│   │   ├── user.repository.js      # Persistencia de Usuarios (oculta passwords, inserción en lote)
│   │   ├── order.repository.js     # Persistencia de Pedidos (populates e inserción en lote)
│   │   └── delivery.repository.js  # Persistencia de Entregas (populates e inserción en lote)
│   ├── services/
│   │   ├── product.service.js      # Lógica de inventario y errores de dominio de productos
│   │   ├── user.service.js         # Lógica de usuarios y errores de dominio de usuarios
│   │   ├── order.service.js        # Lógica de pedidos y errores de dominio de pedidos
│   │   ├── delivery.service.js     # Lógica de entregas y errores de dominio de entregas
│   │   └── mock.service.js         # Lógica de mocking, validaciones de qty y control de fallos en DB
│   ├── controllers/
│   │   ├── product.controller.js   # HTTP para Productos
│   │   ├── user.controller.js      # HTTP para Usuarios
│   │   ├── order.controller.js     # HTTP para Pedidos
│   │   ├── delivery.controller.js  # HTTP para Entregas
│   │   └── mock.controller.js      # HTTP para Mocks y Carga de datos
│   ├── routes/
│   │   ├── product.routes.js       # Router de Productos (/api/products)
│   │   ├── user.routes.js          # Router de Usuarios (/api/users)
│   │   ├── order.routes.js         # Router de Pedidos (/api/orders)
│   │   ├── delivery.routes.js      # Router de Entregas (/api/deliveries)
│   │   ├── mock.routes.js          # Router de Mocks (/api/mocks)
│   │   └── index.js                # Enrutador principal (/api)
│   ├── app.js                      # Configuración de Express y middlewares globales
│   └── server.js                   # Punto de entrada de la aplicación
├── tests/
│   └── error-handling.test.js      # Suite automatizada de pruebas de errores, servicios y mocks
├── .env.example
├── package.json
└── README.md
```

---

## 🛡️ Manejo Profesional de Errores (Pre-entrega Módulo 3)

### 1. Diccionario de Errores (`src/errors/error.dictionary.js`)
Objeto inmutable (`Object.freeze`) que centraliza todos los códigos internos, códigos de estado HTTP y mensajes por defecto del sistema:

| Código | HTTP Status | Caso de Dominio |
| :--- | :---: | :--- |
| `USER_NOT_FOUND` | `404` | Usuario inexistente en el sistema |
| `USER_ALREADY_EXISTS` | `409` | Correo electrónico ya registrado |
| `INVALID_USER_ROLE` | `400` | Rol de usuario no permitido |
| `ORDER_NOT_FOUND` | `404` | Pedido no encontrado |
| `PRODUCT_NOT_FOUND` | `404` | Producto no encontrado |
| `DELIVERY_NOT_FOUND` | `404` | Entrega no encontrada |
| `INVALID_STATE` | `400` | Estado inválido para pedido, producto o entrega |
| `INVALID_PRIORITY` | `400` | Prioridad inválida para un pedido |
| `NEGATIVE_VALUE` | `400` | Valores negativos en cantidad de mocks, precio, stock o total |
| `INVALID_MOCK_QUANTITY` | `400` | Cantidad (`qty`) de mocks inválida (no numérica, `0`, decimal o `> 1000`) |
| `INVALID_MOCK_COLLECTION` | `400` | Colección de mocking no reconocida |
| `MOCK_SEED_FAILURE` | `500` | Falla controlada durante la inserción o limpieza en MongoDB |
| `INVALID_OBJECT_ID` | `400` | Formato de ObjectId de MongoDB inválido |
| `VALIDATION_ERROR` | `400` | Error de validación de datos de entrada |
| `ROUTE_NOT_FOUND` | `404` | Ruta HTTP inexistente |

### 2. Errores Personalizados del Dominio (`src/errors/custom.error.js`)
Jerarquía de clases que extiende de `AppError` (`CustomError`):
- `UserNotFoundError`
- `OrderNotFoundError`
- `ProductNotFoundError`
- `DeliveryNotFoundError`
- `InvalidStateError`
- `InvalidPriorityError`
- `InvalidRoleError`
- `InvalidMockQuantityError`
- `NegativeValueError`
- `InvalidMockCollectionError`
- `MockSeedError`
- `DuplicateResourceError`
- `ValidationError`
- `InvalidIdError`
- `RouteNotFoundError`

### 3. Middleware Global (`src/middlewares/error.middleware.js`)
Ninguna ruta ni controller responde errores por su cuenta; todos llaman a `next(error)` y el middleware global transforma cualquier error en una respuesta JSON uniforme:

```json
{
  "success": false,
  "message": "No se permiten valores negativos para la cantidad de mocks (recibido: -5)",
  "error": {
    "code": "NEGATIVE_VALUE",
    "name": "NegativeValueError",
    "message": "No se permiten valores negativos para la cantidad de mocks (recibido: -5)",
    "statusCode": 400,
    "details": {
      "field": "qty",
      "receivedValue": -5
    },
    "path": "/api/mocks/users?qty=-5",
    "method": "GET",
    "timestamp": "2026-11-15T23:45:00.000Z"
  }
}
```

---

## 🧪 Módulo de Mocking (`/api/mocks`) y Validaciones

| Método | Endpoint | Parámetros | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mocks/users` | `?qty=2` (default: 10) | Devuelve usuarios simulados en memoria (`cliente`, `repartidor`). |
| `GET` | `/api/mocks/orders` | `?qty=5` (default: 10) | Devuelve pedidos simulados con estados y prioridades válidas. |
| `GET` | `/api/mocks/deliveries` | `?qty=5` (default: 10) | Devuelve entregas simuladas en memoria. |
| `GET` | `/api/mocks/all` | `?qty=5` (default: 10) | Devuelve ecosistema completo en memoria con relaciones lógicas. |
| `POST` | `/api/mocks/seed` | `?qty=10&collection=usuarios` | Inserta registros simulados en MongoDB (`usuarios`, `pedidos`, `entregas`, `all`). |
| `DELETE` | `/api/mocks/clear` | - | Limpia las colecciones de prueba en MongoDB. |

### Casos de error controlados en `/api/mocks`:
- **Valores negativos** (`GET /api/mocks/users?qty=-5` o `POST /api/mocks/seed?qty=-10`) → `400 NEGATIVE_VALUE`.
- **Cantidad inválida** (`GET /api/mocks/orders?qty=abc`, `qty=0`, `qty=3.5`, `qty=5000`) → `400 INVALID_MOCK_QUANTITY`.
- **Colección inválida** (`POST /api/mocks/seed?qty=5&collection=otra`) → `400 INVALID_MOCK_COLLECTION`.
- **Fallas en MongoDB durante la carga** → `500 MOCK_SEED_FAILURE` con el detalle de la colección y causa controlada.

---

## 📡 Endpoints del Dominio ShipNow

- **Usuarios (`/api/users`)**: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- **Productos (`/api/products`)**: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- **Pedidos (`/api/orders`)**: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id`
- **Entregas (`/api/deliveries`)**: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

---

## 🚀 Instalación, Ejecución y Testing

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar tests automatizados**:
   ```bash
   npm test
   ```

4. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

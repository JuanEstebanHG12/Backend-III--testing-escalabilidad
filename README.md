# 📦 ShipNow API — Arquitectura por Capas, Mocking, Manejo de Errores, Logging & Swagger UI

Bienvenido al repositorio de la API de **ShipNow**, estructurada profesionalmente en **3 capas (Controller - Service - Repository)**, con validación estricta de variables de entorno, sistema de **Mocking y Seeding relacional**, **capa centralizada de manejo de errores**, **sistema de logging con Winston y rotación de archivos** y **documentación interactiva con Swagger / OpenAPI 3.0**.

---

## 🏗️ Arquitectura del Sistema

```text
[ Cliente HTTP / Swagger UI (/api/docs) ]
       │
       ▼
[ Middleware HTTP Logger (Winston 'http') ]
       │
       ▼
[ Routes ] (Conecta la URL con el método del Controller; sin mezclar configuración Swagger)
       │
       ▼
[ Controllers ] (Gestiona req/res exitosos y deriva cualquier error con next(error))
       │
       ▼
[ Services ] (Reglas de negocio, logs de eventos y errores personalizados del dominio)
       │
       ▼
[ Repositories ] (Único punto de acceso a Mongoose / MongoDB)
       │
       ▼
[ Middleware Global de Errores ] (Registra warning/error/fatal en Winston y devuelve respuesta HTTP uniforme)
```

---

## 📁 Estructura del Proyecto

```text
backend3/
├── logs/
│   └── .gitkeep                    # Carpeta de logs documentada (archivos .log ignorados en Git)
├── src/
│   ├── config/
│   │   ├── env.config.js           # Validación de variables de entorno con dotenv
│   │   ├── db.config.js            # Conexión centralizada a MongoDB con logs de Winston
│   │   ├── logger.config.js        # Configuración centralizada de Winston y rotación diaria
│   │   ├── swagger.config.js       # Configuración centralizada de OpenAPI 3.0.3 y Swagger UI
│   │   └── index.js                # Re-exportación de configuración, logger y swaggerSpec
│   ├── docs/
│   │   ├── schemas.docs.js         # Schemas reutilizables (User, Order, OrderItem, Delivery, ErrorResponse, etc.)
│   │   ├── users.docs.js           # Documentación del módulo Users (/api/users)
│   │   ├── orders.docs.js          # Documentación del módulo Orders (/api/orders)
│   │   ├── deliveries.docs.js      # Documentación del módulo Deliveries (/api/deliveries)
│   │   ├── mocks.docs.js           # Documentación del módulo Mocks (/api/mocks)
│   │   ├── logger.docs.js          # Documentación del endpoint de validación Logger (/api/loggerTest)
│   │   ├── products.docs.js        # Documentación del módulo Products (/api/products)
│   │   └── index.js                # Unificación modular de rutas y schemas de Swagger
│   ├── constants/
│   │   └── index.js                # Constantes inmutables congeladas (Object.freeze)
│   ├── errors/
│   │   ├── error.dictionary.js     # Diccionario centralizado de errores (códigos, status y mensajes)
│   │   ├── custom.error.js         # Clase base AppError/CustomError y errores específicos del dominio
│   │   └── index.js                # Punto de exportación unificado de errores
│   ├── middlewares/
│   │   ├── logger.middleware.js    # Middleware HTTP que adjunta req.logger y registra peticiones
│   │   └── error.middleware.js     # Middleware global de errores conectado con Winston
│   ├── utils/
│   │   ├── constants.js            # Re-exportación de constantes y diccionario
│   │   ├── logger.js               # Re-exportación del logger centralizado
│   │   ├── validators.util.js      # Validadores puros (ObjectId, Email) desacoplados de Mongoose
│   │   └── mock.util.js            # Generador de datos simulados con Faker
│   ├── models/
│   │   ├── product.model.js        # Esquema Mongoose de Productos
│   │   ├── user.model.js           # Esquema Mongoose de Usuarios
│   │   ├── order.model.js          # Esquema Mongoose de Pedidos (incluye subdocumento OrderItem)
│   │   └── delivery.model.js       # Esquema Mongoose de Entregas
│   ├── repositories/
│   │   ├── product.repository.js   # Persistencia de Productos
│   │   ├── user.repository.js      # Persistencia de Usuarios
│   │   ├── order.repository.js     # Persistencia de Pedidos
│   │   └── delivery.repository.js  # Persistencia de Entregas
│   ├── services/
│   │   ├── product.service.js      # Lógica de inventario y errores de dominio de productos
│   │   ├── user.service.js         # Lógica de usuarios y errores de dominio de usuarios
│   │   ├── order.service.js        # Lógica de pedidos, ítems, logs y errores de dominio
│   │   ├── delivery.service.js     # Lógica de entregas, logs y errores de dominio
│   │   └── mock.service.js         # Lógica de mocking, validaciones de qty y control de fallos en DB
│   ├── controllers/
│   │   ├── product.controller.js   # HTTP para Productos
│   │   ├── user.controller.js      # HTTP para Usuarios
│   │   ├── order.controller.js     # HTTP para Pedidos
│   │   ├── delivery.controller.js  # HTTP para Entregas
│   │   ├── mock.controller.js      # HTTP para Mocks y Carga de datos
│   │   └── logger.controller.js    # Controlador de prueba para todos los niveles del logger
│   ├── routes/
│   │   ├── product.routes.js       # Router mínimo de Productos (/api/products)
│   │   ├── user.routes.js          # Router mínimo de Usuarios (/api/users)
│   │   ├── order.routes.js         # Router mínimo de Pedidos (/api/orders)
│   │   ├── delivery.routes.js      # Router mínimo de Entregas (/api/deliveries)
│   │   ├── mock.routes.js          # Router mínimo de Mocks (/api/mocks)
│   │   ├── logger.routes.js        # Router mínimo de Prueba de Logger (/api/loggerTest y /loggerTest)
│   │   └── index.js                # Enrutador principal (/api)
│   ├── app.js                      # Configuración de Express, Swagger UI y middlewares globales
│   └── server.js                   # Punto de entrada de la aplicación
├── tests/
│   ├── error-handling.test.js      # Suite automatizada de pruebas de errores, servicios y mocks
│   ├── logger.test.js              # Suite automatizada de pruebas del logger Winston y rotación
│   └── swagger.test.js             # Suite automatizada de pruebas de Swagger UI y schemas OpenAPI
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📖 Documentación Interactiva con Swagger / OpenAPI (Pre-entrega Módulo 5)

### 1. Ruta de Acceso a Swagger UI
Una vez iniciado el servidor, la documentación interactiva se encuentra disponible en:
- **Swagger UI Interactivo**: `http://localhost:8080/api/docs`
- **Especificación OpenAPI en JSON**: `http://localhost:8080/api/docs.json`

La configuración de Swagger está completamente separada de los archivos de rutas (`src/routes/`), ubicándose en `src/config/swagger.config.js` y dividida modularmente dentro de `src/docs/`.

### 2. Módulos (Tags) Documentados
La documentación está organizada en los siguientes grupos (`tags`):
- **`Users` (`/api/users`)**: listado, consulta por ID, creación, actualización y eliminación de usuarios (`cliente`, `repartidor`, `admin`).
- **`Orders` (`/api/orders`)**: listado con filtros (`estado`, `prioridad`), consulta por ID, creación con ítems de pedido (`OrderItem`), actualización general, cambio de estado (`PATCH /api/orders/:id/status`) y eliminación.
- **`Deliveries` (`/api/deliveries`)**: listado por estado, consulta por ID, creación verificando pedido y rol `repartidor`, actualización y eliminación.
- **`Mocks` (`/api/mocks`)**: generación en memoria (`users`, `orders`, `deliveries`, `all`), carga controlada en MongoDB (`POST /api/mocks/seed`) y limpieza (`DELETE /api/mocks/clear`).
- **`Logger` (`/api/loggerTest`)**: endpoint de validación interna para disparar los 6 niveles de Winston (`debug`, `http`, `info`, `warning`, `error`, `fatal`).
- **`Products` (`/api/products`)**: gestión del catálogo de productos e inventario.

### 3. Schemas Reutilizables (`components.schemas`)
Definidos en `src/docs/schemas.docs.js`:
- **Usuario**: `User`, `UserInput`, `UserUpdateInput`, `MockUser`.
- **Pedido**: `Order`, `OrderInput`, `OrderUpdateInput`, `OrderStatusInput`.
- **Ítem de Pedido**: `OrderItem` (`nombre`, `cantidad`, `precioUnitario`).
- **Entrega**: `Delivery`, `DeliveryInput`, `DeliveryUpdateInput`.
- **Respuesta Exitosa**: `SuccessResponse`, `MockSeedResponse`, `MockAllResponse`, `LoggerTestResponse`.
- **Respuesta de Error**: `ErrorResponse` y `ErrorDetail`, reflejando con exactitud la salida del middleware global de errores (`400`, `404`, `409`, `500`).

### 4. Aclaraciones para Probar los Endpoints desde Swagger UI
1. **Generar datos rápidamente sin tocar la base de datos**:
   - Probá `GET /api/mocks/users?qty=2`, `GET /api/mocks/orders?qty=3` o `GET /api/mocks/all?qty=2` desde la sección **Mocks**.
2. **Poblar MongoDB para probar relaciones reales (`Users`, `Orders`, `Deliveries`)**:
   - Ejecutá primero `POST /api/mocks/seed` con `qty=5` y `collection=all` (o `usuarios`).
   - Luego consultá `GET /api/users` o `GET /api/orders` para copiar un `_id` real de MongoDB y utilizarlo en `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status` o `POST /api/deliveries`.
3. **Probar el manejo profesional de errores**:
   - En `GET /api/mocks/users`, enviá `qty=-5` (`400 NEGATIVE_VALUE`) o `qty=abc` (`400 INVALID_MOCK_QUANTITY`).
   - En `PATCH /api/orders/{id}/status`, enviá `{ "estado": "invalido" }` (`400 INVALID_STATE`).
   - En `GET /api/orders/{id}`, enviá un ObjectId inexistente como `65f1a2b3c4d5e6f7a8b9c0d9` (`404 ORDER_NOT_FOUND`) o un ID mal formado como `123` (`400 INVALID_OBJECT_ID`).

---

## 📊 Sistema de Logging y Monitoreo (Pre-entrega Módulo 4)

- **Herramienta**: `winston` + `winston-daily-rotate-file` (`src/config/logger.config.js`).
- **Niveles**: `fatal` (`0`), `error` (`1`), `warning` (`2`), `info` (`3`), `http` (`4`), `debug` (`5`).
- **Comportamiento por entorno**:
  - `NODE_ENV=development`: registra desde `debug` en adelante.
  - `NODE_ENV=production`: registra desde `info` en adelante (`info`, `warning`, `error`, `fatal`).
- **Archivos y Rotación (`/logs`)**:
  - `logs/error.log`: almacena **exclusivamente** niveles `error` y `fatal`.
  - `logs/error-YYYY-MM-DD.log` y `logs/combined-YYYY-MM-DD.log`: rotación diaria automática (`maxSize: '10m'`, `maxFiles: '14d'`).
  - Ignorados en `.gitignore` (`logs/*.log`, `logs/*.json`, conservando `logs/.gitkeep`).
- **Endpoint de prueba**: `GET /api/loggerTest` (y `GET /loggerTest`).

---

## 🚀 Cómo Levantar el Servidor y Ejecutar Pruebas

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de tener MongoDB activo y las variables definidas en `.env` (`PORT=8080`, `NODE_ENV=development`, `MONGODB_URI=mongodb://localhost:27017/shipnow`).

3. **Ejecutar la suite de pruebas automatizadas**:
   ```bash
   npm test
   ```

4. **Levantar el servidor**:
   - Modo desarrollo:
     ```bash
     npm run dev
     ```
   - Modo producción:
     ```bash
     npm start
     ```
   - Abrí en tu navegador: `http://localhost:8080/api/docs`

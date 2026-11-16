# 📦 ShipNow API — Arquitectura por Capas, Mocking, Errores, Logging, Swagger & Testing Funcional

Bienvenido al repositorio de la API de **ShipNow**, estructurada profesionalmente en **3 capas (Controller - Service - Repository)**, con validación estricta de variables de entorno, sistema de **Mocking y Seeding relacional**, **capa centralizada de manejo de errores**, **sistema de logging con Winston y rotación de archivos**, **documentación interactiva con Swagger / OpenAPI 3.0** y **suite de testing funcional con Mocha, Chai y Supertest**.

---

## 🏗️ Arquitectura del Sistema

```text
[ Cliente HTTP / Swagger UI (/api/docs) / Supertest (Testing) ]
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
│   │   ├── env.config.js           # Validación de variables de entorno y aislamiento de DB para testing
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
│   ├── app.js                      # Instancia de Express exportable sin abrir puerto (para Supertest)
│   └── server.js                   # Punto de entrada que conecta a DB y levanta el servidor HTTP
├── tests/
│   ├── test-db.helper.js           # Configuración y limpieza automática de base de datos de testing
│   ├── functional.api.test.js      # Suite de tests funcionales end-to-end (Mocha, Chai, Supertest)
│   ├── error-handling.test.js      # Pruebas del diccionario de errores, middleware y servicios
│   ├── logger.test.js              # Pruebas de niveles de Winston, formato y /logs/error.log
│   └── swagger.test.js             # Pruebas de especificación OpenAPI y ruta /api/docs
├── .env.example
├── .env.test.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testing Funcional Automatizado (Pre-entrega Módulo 6)

### 1. Herramientas Utilizadas
- **Mocha (`mocha`)**: framework de ejecución y organización de suites de pruebas (`describe`, `it`, `before`, `beforeEach`, `after`).
- **Chai (`chai`)**: librería de aserciones expresivas (`expect`) para verificar códigos HTTP, estructura del body y propiedades de éxito y error.
- **Supertest (`supertest`)**: cliente de pruebas HTTP que importa directamente la aplicación Express (`src/app.js`) sin necesidad de levantar manualmente un puerto en `src/server.js`.

### 2. Entorno de Testing y Variables de Entorno Necesarias
El entorno de testing está **completamente separado** del entorno de desarrollo:
- Al ejecutar `npm test`, se define `NODE_ENV=test`.
- `src/config/env.config.js` carga `.env.test` (si existe) con prioridad sobre `.env` y selecciona automáticamente una base de datos exclusiva de pruebas (`MONGODB_URI_TEST`, o añade el sufijo `_test` a `MONGODB_URI`, por ejemplo `mongodb://localhost:27017/shipnow_test`).
- Variables requeridas (ver `.env.example` y `.env.test.example`):
  ```env
  PORT=8080
  NODE_ENV=test
  MONGODB_URI=mongodb://localhost:27017/shipnow
  MONGODB_URI_TEST=mongodb://localhost:27017/shipnow_test
  ```

### 3. Base de Datos de Testing y Estrategia de Limpieza
- **Base de datos aislada**: las pruebas apuntan a `shipnow_test` (`MONGODB_URI_TEST`), evitando tocar datos de desarrollo. Además, `tests/test-db.helper.js` cuenta con soporte automático de persistencia aislada en memoria si se ejecuta en un entorno CI/local donde el demonio `mongod` no esté corriendo.
- **Limpieza controlada (`beforeEach` / `after`)**: antes de cada test (`beforeEach`) y al finalizar la suite (`after`), `clearTestDatabase()` vacía las colecciones (`User`, `Order`, `Delivery`, `Product`), garantizando que cada prueba sea 100% repetible e independiente del orden de ejecución.

### 4. Cómo Ejecutar los Tests
```bash
npm test
```
Esto ejecuta el script configurado en `package.json`:
```json
"test": "NODE_ENV=test mocha \"tests/**/*.test.js\" --timeout 15000 --exit"
```

### 5. Módulos y Casos Cubiertos por la Suite de Tests
1. **Usuarios (`/api/users`)**:
   - Casos exitosos: listado vacío inicial, creación de usuario (`201`) verificando ocultamiento de `password`, consulta por ID (`200`).
   - Casos de error: campos faltantes (`400 MISSING_REQUIRED_FIELDS`), correo duplicado (`409 USER_ALREADY_EXISTS`), rol inválido (`400 INVALID_USER_ROLE`), usuario inexistente (`404 USER_NOT_FOUND`), ID inválido (`400 INVALID_OBJECT_ID`).
2. **Pedidos (`/api/orders`)**:
   - Casos exitosos: creación previa de usuario cliente válido y creación de pedido con ítems (`OrderItem`, `201`), listado general (`200`), consulta por ID (`200`) y cambio de estado (`PATCH /api/orders/:id/status`, `200`).
   - Casos de error: datos incompletos (`400 MISSING_REQUIRED_FIELDS`), cliente inexistente (`404 USER_NOT_FOUND`), pedido no encontrado (`404 ORDER_NOT_FOUND`), estado inválido (`400 INVALID_STATE`), valores negativos (`400 NEGATIVE_VALUE`).
3. **Entregas (`/api/deliveries`) y Productos (`/api/products`)**:
   - Creación vinculada a pedido y repartidor válido (`201`), rechazo de usuario sin rol `repartidor` (`400 INVALID_USER_ROLE`), rechazo de precios negativos (`400 NEGATIVE_VALUE`).
4. **Mocks (`/api/mocks`)**:
   - Casos exitosos: generación en memoria (`GET /api/mocks/users`, `GET /api/mocks/orders`) y carga controlada en base de datos (`POST /api/mocks/seed` y `DELETE /api/mocks/clear`).
   - Casos de error: cantidades negativas (`400 NEGATIVE_VALUE`), cantidades no numéricas o cero (`400 INVALID_MOCK_QUANTITY`) y colección inválida (`400 INVALID_MOCK_COLLECTION`).
5. **Logger (`/api/loggerTest`), Swagger (`/api/docs`) y Rutas 404**:
   - Verificación de los 6 niveles de Winston y persistencia exclusiva de `error` y `fatal` en `logs/error.log`.
   - Verificación de Swagger UI (`GET /api/docs/`) y especificación OpenAPI (`GET /api/docs.json`).
   - Verificación de rutas inexistentes (`404 ROUTE_NOT_FOUND`).

---

## 📖 Documentación Interactiva con Swagger / OpenAPI (Pre-entrega Módulo 5)

- **Swagger UI Interactivo**: `http://localhost:8080/api/docs`
- **Especificación OpenAPI en JSON**: `http://localhost:8080/api/docs.json`
- **Módulos (Tags) Documentados**: `Users`, `Orders`, `Deliveries`, `Mocks`, `Logger` y `Products`.
- **Schemas Reutilizables**: `User`, `Order`, `OrderItem`, `Delivery`, `Product`, `SuccessResponse` y `ErrorResponse`.

---

## 📊 Sistema de Logging y Monitoreo (Pre-entrega Módulo 4)

- **Herramienta**: `winston` + `winston-daily-rotate-file` (`src/config/logger.config.js`).
- **Niveles**: `fatal` (`0`), `error` (`1`), `warning` (`2`), `info` (`3`), `http` (`4`), `debug` (`5`).
- **Archivos (`/logs`)**: `logs/error.log` (solo `error` y `fatal`), `logs/error-YYYY-MM-DD.log` y `logs/combined-YYYY-MM-DD.log` (ignorados en `.gitignore`).
- **Endpoint de prueba**: `GET /api/loggerTest` (y `GET /loggerTest`).

---

## 🚀 Instalación y Puesta en Marcha

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar la suite de pruebas funcionales**:
   ```bash
   npm test
   ```

4. **Levantar el servidor**:
   ```bash
   npm run dev
   ```
   - Documentación interactiva: `http://localhost:8080/api/docs`

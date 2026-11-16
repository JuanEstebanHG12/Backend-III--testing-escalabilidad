# 📦 ShipNow API — Arquitectura por Capas, Mocking, Manejo de Errores & Logging con Winston

Bienvenido al repositorio de la API de **ShipNow**, estructurada profesionalmente en **3 capas (Controller - Service - Repository)**, con validación estricta de variables de entorno, sistema de **Mocking y Seeding relacional**, **capa centralizada de manejo de errores** y **sistema de logging y monitoreo con Winston y rotación de archivos**.

---

## 🏗️ Arquitectura del Sistema

```text
[ Cliente HTTP ]
       │
       ▼
[ Middleware HTTP Logger (Winston 'http') ]
       │
       ▼
[ Routes ] (Conecta la URL con el método del Controller)
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
│   │   └── index.js                # Re-exportación de configuración y logger
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
│   │   ├── order.model.js          # Esquema Mongoose de Pedidos
│   │   └── delivery.model.js       # Esquema Mongoose de Entregas
│   ├── repositories/
│   │   ├── product.repository.js   # Persistencia de Productos
│   │   ├── user.repository.js      # Persistencia de Usuarios
│   │   ├── order.repository.js     # Persistencia de Pedidos
│   │   └── delivery.repository.js  # Persistencia de Entregas
│   ├── services/
│   │   ├── product.service.js      # Lógica de inventario y errores de dominio de productos
│   │   ├── user.service.js         # Lógica de usuarios y errores de dominio de usuarios
│   │   ├── order.service.js        # Lógica de pedidos, logs y errores de dominio
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
│   │   ├── product.routes.js       # Router de Productos (/api/products)
│   │   ├── user.routes.js          # Router de Usuarios (/api/users)
│   │   ├── order.routes.js         # Router de Pedidos (/api/orders)
│   │   ├── delivery.routes.js      # Router de Entregas (/api/deliveries)
│   │   ├── mock.routes.js          # Router de Mocks (/api/mocks)
│   │   ├── logger.routes.js        # Router de Prueba de Logger (/api/loggerTest y /loggerTest)
│   │   └── index.js                # Enrutador principal (/api)
│   ├── app.js                      # Configuración de Express y middlewares globales
│   └── server.js                   # Punto de entrada de la aplicación
├── tests/
│   ├── error-handling.test.js      # Suite automatizada de pruebas de errores, servicios y mocks
│   └── logger.test.js              # Suite automatizada de pruebas del logger Winston y rotación
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📊 Sistema de Logging y Monitoreo (Pre-entrega Módulo 4)

### 1. Herramienta de Logging Utilizada
Se utiliza **Winston** (`winston`) junto con **Winston Daily Rotate File** (`winston-daily-rotate-file`), configurado de forma centralizada en `src/config/logger.config.js` (y exportado también en `src/utils/logger.js`), reemplazando por completo el uso de `console.log()` y `console.error()`.

### 2. Niveles de Log Definidos
El logger define 6 niveles personalizados ordenados de mayor a menor criticidad:

| Nivel | Prioridad | Uso en ShipNow API |
| :--- | :---: | :--- |
| `fatal` | `0` | Fallas críticas del sistema (error de conexión inicial a MongoDB o caída de arranque). |
| `error` | `1` | Errores inesperados del servidor (`status >= 500`) o fallos de persistencia en MongoDB durante seeding. |
| `warning` | `2` | Errores operacionales/de negocio esperados (`400`, `404`, `409`: pedido no encontrado, cantidad inválida de mocks, ruta inexistente). |
| `info` | `3` | Eventos relevantes del ciclo de vida (inicio del servidor, conexión exitosa a MongoDB, creación de pedidos, generación y carga de mocks). |
| `http` | `4` | Registro automático de cada petición HTTP entrante (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). |
| `debug` | `5` | Información detallada de diagnóstico durante el desarrollo. |

Formato de salida estandarizado (`timestamp + [nivel] + mensaje`):
```text
2026-08-01 10:12:03 [info]    Servidor ShipNow escuchando en el puerto 3000
2026-08-01 10:12:03 [info]    Conexión a MongoDB establecida
2026-08-01 10:14:21 [warning] Pedido #A-102 sin repartidor asignado
2026-08-01 10:15:09 [error]   Falló la creación del pedido: ValidationError (campo "destino" requerido)
```

### 3. Comportamiento según el Entorno (`NODE_ENV`)
- **Desarrollo (`NODE_ENV=development`)**: registra desde el nivel `debug` en adelante (`debug`, `http`, `info`, `warning`, `error`, `fatal`), brindando máxima visibilidad.
- **Producción (`NODE_ENV=production`)**: registra únicamente desde el nivel `info` en adelante (`info`, `warning`, `error`, `fatal`), omitiendo logs verbosos (`debug` y `http`) para optimizar el rendimiento y el almacenamiento.

### 4. Dónde se Guardan los Archivos de Logs y Estrategia de Rotación
Todos los archivos se almacenan dentro de la carpeta `/logs`:
- `logs/error.log`: almacena **exclusivamente** eventos de nivel `error` y `fatal` (con rotación por tamaño máximo de `5 MB` y hasta `5` archivos).
- `logs/error-YYYY-MM-DD.log`: archivo de errores (`error` y `fatal`) con **rotación diaria automática** (`datePattern: 'YYYY-MM-DD'`), límite de `10 MB` por archivo y retención máxima de `14 días` (`maxFiles: '14d'`).
- `logs/combined-YYYY-MM-DD.log`: historial general rotado diariamente con retención de `14 días`.

### 5. Archivos y Carpetas Ignorados en Git (`.gitignore`)
En `.gitignore` se ignoran todos los archivos generados por la aplicación y el motor de rotación:
- `logs/*.log`
- `logs/*.json` (archivos de auditoría de rotación)
- `logs/*.gz` y `logs/*.txt`
- Además de `node_modules/` y `.env`.
- Solo se conserva `logs/.gitkeep` para mantener documentada la estructura del directorio en el repositorio.

### 6. Cómo Probar el Endpoint del Logger
Con el servidor en marcha, realizá una petición `GET` a cualquiera de las siguientes rutas:
```http
GET http://localhost:8080/api/loggerTest
GET http://localhost:8080/loggerTest
```
Este endpoint dispara un registro de prueba en cada uno de los 6 niveles (`debug`, `http`, `info`, `warning`, `error` y `fatal`), mostrándolos por consola y guardando únicamente los niveles `error` y `fatal` en `/logs/error.log`.

---

## 🛡️ Manejo Profesional de Errores (Pre-entrega Módulo 3)

- **Diccionario de Errores (`src/errors/error.dictionary.js`)**: centraliza códigos internos (`USER_NOT_FOUND`, `ORDER_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `DELIVERY_NOT_FOUND`, `INVALID_STATE`, `INVALID_MOCK_QUANTITY`, `NEGATIVE_VALUE`, `MOCK_SEED_FAILURE`, etc.), códigos HTTP y mensajes por defecto.
- **Errores Personalizados (`src/errors/custom.error.js`)**: clases de dominio que extienden de `AppError` (`CustomError`).
- **Middleware Global (`src/middlewares/error.middleware.js`)**: único punto que responde errores HTTP con estructura uniforme y los registra automáticamente en Winston (`warning` para errores de negocio `< 500`, `error` para fallos `>= 500` y `fatal` para fallos críticos).

---

## 🧪 Módulo de Mocking (`/api/mocks`)

- `GET /api/mocks/users?qty=2`
- `GET /api/mocks/orders?qty=5`
- `GET /api/mocks/deliveries?qty=5`
- `GET /api/mocks/all?qty=5`
- `POST /api/mocks/seed?qty=10&collection=usuarios` (`usuarios`, `pedidos`, `entregas`, `all`)
- `DELETE /api/mocks/clear`

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

3. **Ejecutar la suite de pruebas automatizadas**:
   ```bash
   npm test
   ```

4. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

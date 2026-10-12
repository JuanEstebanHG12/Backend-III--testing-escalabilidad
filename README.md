# 📦 ShipNow API — Backend con Arquitectura por Capas & Mocking

Bienvenido al repositorio de la API de **ShipNow**, estructurada profesionalmente en 3 capas (Controller - Service - Repository), con validación estricta de variables de entorno y un sistema completo de **Mocking y carga de datos de prueba (Seeding)**.

---

## 🏗️ Arquitectura por Capas

El proyecto implementa una arquitectura limpia y desacoplada:

```
[ Cliente HTTP ]
       │
       ▼
[ Routes ] (Conecta la URL con el método del Controller)
       │
       ▼
[ Controllers ] (Gestiona req, res y códigos HTTP; nunca toca Mongoose)
       │
       ▼
[ Services ] (Lógica y reglas de negocio, generación de mocks, validaciones)
       │
       ▼
[ Repositories ] (Único punto de acceso a la base de datos y Mongoose)
       │
       ▼
[ Base de Datos (MongoDB) ]
```

### 🧠 ¿Por qué separamos la lógica entre Service y Repository?

1. **Separación de Responsabilidades (SRP)**:
   - El **Repository** solo sabe **cómo persistir y recuperar datos** (queries, filtros, ordenamiento, populate y proyecciones para ocultar contraseñas o campos internos como `__v`).
   - El **Service** contiene las **reglas de negocio** (asignar estados de stock según inventario, validar unicidad de correos, verificar roles y coordinar relaciones lógicas entre clientes, pedidos y repartidores).
2. **Independencia de la Base de Datos**:
   - Si cambiamos MongoDB por PostgreSQL o Prisma, la lógica de negocio en el Service no cambia; solo se adapta el Repository.
3. **Mantenimiento y Testeo**:
   - Facilita escribir tests unitarios aislando la lógica de negocio mediante mocks de los repositorios sin requerir una base de datos conectada.

---

## 📁 Estructura del Proyecto

```text
backend3/
├── src/
│   ├── config/
│   │   ├── env.config.js          # Validación de variables de entorno con dotenv
│   │   ├── db.config.js           # Conexión centralizada a MongoDB con Mongoose
│   │   └── index.js               # Re-exportación de configuración
│   ├── constants/
│   │   └── index.js               # Constantes inmutables congeladas (Object.freeze)
│   ├── utils/
│   │   ├── constants.js           # Re-exportación de constantes
│   │   └── mock.util.js           # Generador de datos simulados con Faker
│   ├── models/
│   │   ├── product.model.js       # Esquema Mongoose de Productos
│   │   ├── user.model.js          # Esquema Mongoose de Usuarios (alias nombre/rol)
│   │   ├── order.model.js         # Esquema Mongoose de Pedidos (cliente, total, estado)
│   │   └── delivery.model.js      # Esquema Mongoose de Entregas (pedido, repartidor)
│   ├── repositories/
│   │   ├── product.repository.js  # Mongoose de Productos (proyecciones y orden)
│   │   ├── user.repository.js     # Mongoose de Usuarios (oculta passwords, bulk)
│   │   ├── order.repository.js    # Mongoose de Pedidos (populates y bulk)
│   │   └── delivery.repository.js # Mongoose de Entregas (populates y bulk)
│   ├── services/
│   │   ├── product.service.js     # Lógica de inventario y estados
│   │   ├── user.service.js        # Lógica de usuarios y validaciones
│   │   └── mock.service.js        # Lógica de simulación en memoria y seeding relacional
│   ├── controllers/
│   │   ├── product.controller.js  # HTTP para Productos
│   │   ├── user.controller.js     # HTTP para Usuarios
│   │   └── mock.controller.js     # HTTP para Mocks y Carga de datos
│   ├── routes/
│   │   ├── product.routes.js      # Router mínimo de Productos
│   │   ├── user.routes.js         # Router mínimo de Usuarios
│   │   ├── mock.routes.js         # Router mínimo de Mocks (/api/mocks)
│   │   └── index.js               # Enrutador principal (/api)
│   ├── app.js                       # Express, middlewares y manejo de errores
│   └── server.js                    # Punto de entrada de la aplicación
├── .env.example                     # Plantilla de variables de entorno requeridas
├── .gitignore                       # Ignora node_modules y .env
├── package.json
└── README.md
```

---

## 🔒 Constantes Inmutables Centralizadas

Se definen constantes protegidas con `Object.freeze` en `src/constants/index.js` para erradicar strings mágicos:

```javascript
// Roles de usuario
export const USER_ROLES = Object.freeze({
  CLIENTE: 'cliente',
  REPARTIDOR: 'repartidor',
  ADMIN: 'admin',
  USER: 'cliente',
});

// Estados y prioridades de pedidos
export const ORDER_STATUS = Object.freeze({
  PENDIENTE: 'pendiente',
  EN_PREPARACION: 'en_preparacion',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
});

export const ORDER_PRIORITY = Object.freeze({
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente',
});

// Estados de entrega
export const DELIVERY_STATUS = Object.freeze({
  ASIGNADA: 'asignada',
  EN_CAMINO: 'en_camino',
  ENTREGADA: 'entregada',
  FALLIDA: 'fallida',
});

// Estados de producto
export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});
```

---

## ⚙️ Configuración y Variables de Entorno

La configuración está centralizada en `src/config/env.config.js`. Si falta alguna variable obligatoria (`PORT`, `MONGODB_URI` o `NODE_ENV`), la aplicación se detiene arrojando un error descriptivo:

```text
[ERROR DE CONFIGURACIÓN] Faltan las siguientes variables de entorno requeridas en el archivo .env: MONGODB_URI. Por favor, revisa el archivo .env.example para configurarlas.
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB corriendo localmente (`mongodb://localhost:27017/shipnow`) o conexión en la nube (MongoDB Atlas).

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Verifica los valores dentro de `.env`:
   ```env
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/shipnow
   ```

3. **Iniciar el servidor**:
   - En desarrollo (con recarga automática):
     ```bash
     npm run dev
     ```
   - En producción:
     ```bash
     npm start
     ```

---

## 🧪 Módulo de Mocking y Carga de Datos (`/api/mocks`)

El módulo de mocking permite generar datos simulados realistas usando `@faker-js/faker` en español y sembrar la base de datos de manera controlada garantizando relaciones de integridad entre **Usuarios (Clientes / Repartidores)**, **Pedidos** y **Entregas**.

### 1. Datos Simulados en Memoria (SIN guardar en MongoDB)

| Método | Endpoint | Parámetros Query | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mocks/users` | `?qty=2` (default: 10) | Devuelve usuarios simulados con roles válidos (`cliente`, `repartidor`). |
| `GET` | `/api/mocks/orders` | `?qty=5` (default: 10) | Devuelve pedidos simulados con estados y prioridades oficiales. |
| `GET` | `/api/mocks/deliveries` | `?qty=5` (default: 10) | Devuelve entregas simuladas con código de seguimiento y estado. |
| `GET` | `/api/mocks/all` | `?qty=5` (default: 10) | Devuelve un ecosistema simulado en memoria con relaciones interconectadas. |

#### Ejemplo de respuesta:
```http
GET /api/mocks/users?qty=2
```
```json
[
  { "nombre": "Ana Pérez", "email": "ana.perez@test.com", "rol": "cliente" },
  { "nombre": "Luis Gómez", "email": "luis.gomez@test.com", "rol": "repartidor" }
]
```

---

### 2. Carga Controlada en MongoDB (`POST /api/mocks/seed`)

Permite insertar registros de prueba directamente en MongoDB.

| Método | Endpoint | Parámetros / Body | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/mocks/seed` | `?qty=10` (default) | Inserta usuarios simulados en MongoDB. |
| `POST` | `/api/mocks/seed` | `?qty=5&collection=pedidos` | Inserta pedidos asociándolos a clientes existentes. |
| `POST` | `/api/mocks/seed` | `?qty=5&collection=entregas` | Inserta entregas asociándolas a pedidos y repartidores reales. |
| `POST` | `/api/mocks/seed` | `?qty=5&collection=all` | Inserta el ecosistema completo (usuarios + pedidos + entregas enlazadas). |
| `DELETE` | `/api/mocks/clear` | - | Limpia las colecciones de prueba en MongoDB. |

#### Ejemplo de respuesta:
```http
POST /api/mocks/seed?qty=10
```
```json
{
  "insertados": 10,
  "coleccion": "usuarios"
}
```

#### Ejemplo de siembra completa (`collection=all`):
```http
POST /api/mocks/seed?qty=5&collection=all
```
```json
{
  "insertados": 15,
  "coleccion": "completo",
  "detalle": {
    "usuarios": 5,
    "pedidos": 5,
    "entregas": 5
  }
}
```

---

## 📡 Endpoints del Sistema ShipNow

### 📦 Productos (`/api/products`)
- `GET /api/products` (opcional: `?onlyInStock=true`, `?category=...`)
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### 👥 Usuarios (`/api/users`)
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

---

## ✅ Verificación de Criterios de Aceptación (Pre-entrega 2)

- [x] **Separación por Capas**: El Router solo conecta endpoints; el Controller maneja HTTP; el Service ejecuta la lógica de mock y de seeding; los Repositories gestionan la persistencia en MongoDB.
- [x] **Router `/api/mocks`**: Todos los endpoints de simulación y carga cuelgan de este prefijo.
- [x] **Modelos y Datos Coherentes**:
  - Usuarios con roles válidos (`cliente`, `repartidor`, `admin`).
  - Pedidos con estados y prioridades permitidos por las constantes.
  - Entregas asociadas a pedidos y repartidores coherentes.
- [x] **Relaciones Respetadas**: Al sembrar entregas o pedidos, se vinculan mediante `ObjectId` y se verifican mediante `populate()`.
- [x] **Constantes Centralizadas**: Cero strings mágicos; uso estricto de `USER_ROLES`, `ORDER_STATUS`, `ORDER_PRIORITY` y `DELIVERY_STATUS`.

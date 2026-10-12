# 📦 ShipNow API — Pre-entrega Módulo 1

Bienvenido al repositorio de la API de **ShipNow**, refactorizada a una arquitectura profesional en 3 capas (Controller - Service - Repository) y con validación centralizada de variables de entorno.

---

## 🏗️ Arquitectura por Capas

El proyecto implementa una arquitectura limpia para separar responsabilidades y evitar el acoplamiento:

```
[ Cliente HTTP ]
       │
       ▼
[ Routes ] (Solo asocia el path con el Controller)
       │
       ▼
[ Controllers ] (Gestiona req, res y códigos HTTP; nunca toca Mongoose)
       │
       ▼
[ Services ] (Lógica y reglas de negocio, validaciones, estados)
       │
       ▼
[ Repositories ] (Único punto de acceso a la base de datos y Mongoose)
       │
       ▼
[ Base de Datos (MongoDB) ]
```

### 🧠 ¿Por qué separamos la lógica entre Service y Repository?

Una duda muy común al principio es: *¿por qué no llamar a Mongoose directamente desde el Service o poner las validaciones en el Repository?*

1. **Separación de Responsabilidades (SRP)**:
   - El **Repository** solo debe saber **cómo persistir y recuperar datos** (hacer consultas, aplicar proyecciones para excluir campos sensibles como contraseñas o campos internos como `__v`, ordenar por fecha, etc.). No debe opinar si un usuario tiene permiso para comprar o si el precio tiene descuento.
   - El **Service** contiene las **reglas de negocio** de la empresa (por ejemplo: si el stock llega a 0, el producto debe cambiar automáticamente a `OUT_OF_STOCK`; si se crea un usuario, no permitir emails repetidos; o validar que el rol asignado pertenezca a la lista permitida de `USER_ROLES`).
2. **Independencia de la Base de Datos**:
   - Si mañana decidimos cambiar Mongoose por PostgreSQL, Prisma o TypeORM, **la lógica de negocio del Service no cambia en absoluto**. Solo reescribimos el Repository.
3. **Mantenimiento y Testeo**:
   - Al separar capas, podemos testear la lógica de negocio del Service simulando (mockeando) el Repository sin necesidad de conectarnos a una base de datos real.

---

## 📁 Estructura del Proyecto

```text
backend3/
├── src/
│   ├── config/
│   │   ├── env.config.js       # Validación de variables de entorno con dotenv
│   │   ├── db.config.js        # Conexión centralizada a MongoDB con Mongoose
│   │   └── index.js            # Re-exportación de configuración
│   ├── constants/
│   │   └── index.js            # Constantes inmutables congeladas (Object.freeze)
│   ├── utils/
│   │   └── constants.js        # Re-exportación de constantes
│   ├── models/
│   │   ├── product.model.js    # Esquema Mongoose de Productos
│   │   └── user.model.js       # Esquema Mongoose de Usuarios
│   ├── repositories/
│   │   ├── product.repository.js # Operaciones Mongoose de Productos y proyecciones
│   │   └── user.repository.js    # Operaciones Mongoose de Usuarios (oculta passwords)
│   ├── services/
│   │   ├── product.service.js    # Reglas de negocio de inventario y validaciones
│   │   └── user.service.js       # Reglas de negocio de usuarios, roles y correos
│   ├── controllers/
│   │   ├── product.controller.js # Manejo de req/res y códigos HTTP para Productos
│   │   └── user.controller.js    # Manejo de req/res y códigos HTTP para Usuarios
│   ├── routes/
│   │   ├── product.routes.js     # Enrutador mínimo de Productos
│   │   ├── user.routes.js        # Enrutador mínimo de Usuarios
│   │   └── index.js              # Enrutador principal (/api)
│   ├── app.js                    # Configuración de Express y middlewares
│   └── server.js                 # Punto de entrada de la aplicación
├── .env.example                  # Plantilla de variables de entorno requeridas
├── .gitignore                    # Ignora node_modules y .env
├── package.json
└── README.md
```

---

## 🔒 Constantes Inmutables

Para eliminar los **strings mágicos** y prevenir errores tipográficos, se definieron objetos congelados mediante `Object.freeze`:

```javascript
// src/constants/index.js
export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});
```

---

## ⚙️ Configuración y Variables de Entorno

La configuración está centralizada en `src/config/env.config.js`. 
Si falta alguna variable crítica al iniciar la aplicación (por ejemplo `MONGODB_URI` o `PORT`), la aplicación **lanza un error descriptivo y detiene la ejecución inmediatamente**:

```text
[ERROR DE CONFIGURACIÓN] Faltan las siguientes variables de entorno requeridas en el archivo .env: MONGODB_URI. Por favor, revisa el archivo .env.example para configurarlas.
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB instalado localmente o una instancia en MongoDB Atlas

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd backend3
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el archivo de entorno**:
   Copia el archivo `.env.example` y crea tu propio `.env`:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de que contenga las variables:
   ```env
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/shipnow
   ```

4. **Ejecutar el servidor**:
   - En modo desarrollo (con recarga automática):
     ```bash
     npm run dev
     ```
   - En modo producción:
     ```bash
     npm start
     ```

---

## 📡 Endpoints de la API

La URL base es `http://localhost:8080/api`.

### 📦 Productos (`/api/products`)

| Método | Endpoint | Descripción | Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Obtener todos los productos | Opcional: `?onlyInStock=true`, `?category=...` |
| `GET` | `/api/products/:id` | Obtener un producto por ID | - |
| `POST` | `/api/products` | Crear un nuevo producto | `{ "title": "Caja", "description": "Embalaje", "price": 1200, "stock": 10, "category": "Envíos" }` |
| `PUT` | `/api/products/:id` | Actualizar producto | `{ "stock": 0 }` (cambia estado a OUT_OF_STOCK) |
| `DELETE` | `/api/products/:id` | Eliminar un producto | - |

### 👥 Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Listar usuarios (sin password) | - |
| `GET` | `/api/users/:id` | Obtener usuario por ID (sin password) | - |
| `POST` | `/api/users` | Crear un usuario nuevo | `{ "name": "Juan", "email": "juan@shipnow.com", "password": "123", "role": "USER" }` |
| `PUT` | `/api/users/:id` | Actualizar datos de usuario | `{ "name": "Juan Carlos" }` |
| `DELETE` | `/api/users/:id` | Eliminar usuario | - |

---

## ✅ Cumplimiento de Criterios de Evaluación

- **Modularidad**: Carpetas `controllers/`, `services/`, `repositories/`, `models/`, `routes/`, `config/` y `constants/` correctamente separadas.
- **Abstracción**: Ni el Controller ni el Service importan Mongoose. La persistencia está 100% encapsulada en el Repository.
- **Robustez**: Si falta `MONGODB_URI` en el `.env`, el servidor se rehúsa a iniciar con un mensaje de error descriptivo.
- **Legibilidad**: Cero strings mágicos en roles o estados de producto gracias al uso de `USER_ROLES` y `PRODUCT_STATUS`.

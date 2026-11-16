import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
  PRODUCT_STATUS,
  USER_DOCUMENT_TYPES,
  RECEIPT_TYPES,
  ALLOWED_FILE_MIMETYPES,
  ERROR_DICTIONARY,
} from '../constants/index.js';

const uniqueUserRoles = [...new Set(Object.values(USER_ROLES))];
const orderStates = Object.values(ORDER_STATUS);
const orderPriorities = Object.values(ORDER_PRIORITY);
const deliveryStates = Object.values(DELIVERY_STATUS);
const productStates = Object.values(PRODUCT_STATUS);
const userDocumentTypes = Object.values(USER_DOCUMENT_TYPES);
const receiptDocumentTypes = Object.values(RECEIPT_TYPES);
const allDocumentTypes = [...new Set([...userDocumentTypes, ...receiptDocumentTypes])];

/**
 * Schemas reutilizables de OpenAPI 3.0 para ShipNow API:
 * Incluye: Usuario, Ítem de Pedido, Pedido, Entrega, Producto, Respuesta Exitosa y Respuesta de Error.
 */
export const swaggerSchemas = {
  // 1. USUARIO (User)
  User: {
    type: 'object',
    description: 'Representación de un usuario registrado en ShipNow (sin contraseña por seguridad)',
    required: ['_id', 'nombre', 'email', 'rol'],
    properties: {
      _id: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d1',
        description: 'Identificador único de MongoDB (ObjectId)',
      },
      nombre: {
        type: 'string',
        example: 'Ana Pérez',
        description: 'Nombre completo del usuario',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'ana.perez@test.com',
        description: 'Correo electrónico único del usuario',
      },
      rol: {
        type: 'string',
        enum: uniqueUserRoles,
        example: USER_ROLES.CLIENTE,
        description: 'Rol del usuario dentro de la plataforma logística',
      },
      documents: {
        type: 'array',
        description: 'Metadatos de los documentos y licencias subidos por el usuario',
        items: {
          $ref: '#/components/schemas/FileMetadata',
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:30:00.000Z',
      },
    },
  },

  UserInput: {
    type: 'object',
    description: 'Datos esperados para registrar un nuevo usuario',
    required: ['nombre', 'email'],
    properties: {
      nombre: {
        type: 'string',
        example: 'Carlos Mendoza',
        description: 'Nombre completo del usuario (también acepta alias "name")',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'carlos.mendoza@shipnow.com',
        description: 'Correo electrónico único',
      },
      password: {
        type: 'string',
        example: 'password123',
        default: 'password123',
        description: 'Contraseña del usuario',
      },
      rol: {
        type: 'string',
        enum: uniqueUserRoles,
        default: USER_ROLES.CLIENTE,
        example: USER_ROLES.CLIENTE,
        description: 'Rol asignado (cliente, repartidor, admin)',
      },
    },
  },

  UserUpdateInput: {
    type: 'object',
    description: 'Campos permitidos para actualizar un usuario existente',
    properties: {
      nombre: {
        type: 'string',
        example: 'Carlos A. Mendoza',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'carlos.actualizado@shipnow.com',
      },
      rol: {
        type: 'string',
        enum: uniqueUserRoles,
        example: USER_ROLES.REPARTIDOR,
      },
    },
  },

  MockUser: {
    type: 'object',
    description: 'Usuario simulado generado en memoria por el módulo de Mocks',
    required: ['nombre', 'email', 'rol'],
    properties: {
      nombre: {
        type: 'string',
        example: 'Ana Pérez',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'ana.perez.1_a9f2@test.com',
      },
      rol: {
        type: 'string',
        enum: [USER_ROLES.CLIENTE, USER_ROLES.REPARTIDOR],
        example: USER_ROLES.CLIENTE,
      },
    },
  },

  // 2. ÍTEM DE PEDIDO (OrderItem)
  OrderItem: {
    type: 'object',
    description: 'Detalle de un ítem incluido dentro de un pedido logístico',
    required: ['nombre', 'cantidad', 'precioUnitario'],
    properties: {
      nombre: {
        type: 'string',
        example: 'Auriculares Inalámbricos Pro',
        description: 'Nombre o descripción del artículo',
      },
      cantidad: {
        type: 'integer',
        minimum: 1,
        example: 2,
        description: 'Cantidad de unidades del ítem (entero positivo >= 1)',
      },
      precioUnitario: {
        type: 'number',
        minimum: 0,
        example: 12500,
        description: 'Precio unitario del artículo (>= 0)',
      },
    },
  },

  // 3. PEDIDO (Order)
  Order: {
    type: 'object',
    description: 'Entidad Pedido de ShipNow con cliente asociado, ítems, estado y prioridad',
    required: ['codigo', 'cliente', 'descripcion', 'total', 'direccionEntrega', 'estado', 'prioridad'],
    properties: {
      _id: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d2',
        description: 'Identificador único de MongoDB (ObjectId)',
      },
      codigo: {
        type: 'string',
        example: 'PED-1-A8F9K',
        description: 'Código único de seguimiento del pedido',
      },
      cliente: {
        oneOf: [
          { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          { $ref: '#/components/schemas/User' },
        ],
        description: 'ID del usuario cliente o documento poblado del cliente',
      },
      descripcion: {
        type: 'string',
        example: 'Envío de equipamiento electrónico',
        description: 'Descripción general del pedido',
      },
      items: {
        type: 'array',
        description: 'Lista de ítems que componen el pedido',
        items: {
          $ref: '#/components/schemas/OrderItem',
        },
      },
      total: {
        type: 'number',
        minimum: 0,
        example: 25000,
        description: 'Monto total del pedido (no negativo)',
      },
      direccionEntrega: {
        type: 'string',
        example: 'Av. Libertador 1450, Buenos Aires',
        description: 'Dirección física de destino del pedido',
      },
      estado: {
        type: 'string',
        enum: orderStates,
        example: ORDER_STATUS.PENDIENTE,
        description: 'Estado actual del pedido',
      },
      prioridad: {
        type: 'string',
        enum: orderPriorities,
        example: ORDER_PRIORITY.ALTA,
        description: 'Nivel de prioridad logística',
      },
      comprobantes: {
        type: 'array',
        description: 'Metadatos de los comprobantes asociados al pedido',
        items: {
          $ref: '#/components/schemas/FileMetadata',
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:35:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:35:00.000Z',
      },
    },
  },

  OrderInput: {
    type: 'object',
    description: 'Payload esperado para crear un nuevo pedido',
    required: ['cliente', 'descripcion', 'total', 'direccionEntrega'],
    properties: {
      codigo: {
        type: 'string',
        example: 'PED-CUSTOM-101',
        description: 'Código único opcional (si se omite, se autogenera)',
      },
      cliente: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d1',
        description: 'ObjectId válido de un usuario existente en la colección Users',
      },
      descripcion: {
        type: 'string',
        example: 'Caja de repuestos industriales',
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/OrderItem',
        },
      },
      total: {
        type: 'number',
        minimum: 0,
        example: 25000,
      },
      direccionEntrega: {
        type: 'string',
        example: 'Calle Falsa 123, Córdoba',
      },
      estado: {
        type: 'string',
        enum: orderStates,
        default: ORDER_STATUS.PENDIENTE,
        example: ORDER_STATUS.PENDIENTE,
      },
      prioridad: {
        type: 'string',
        enum: orderPriorities,
        default: ORDER_PRIORITY.MEDIA,
        example: ORDER_PRIORITY.MEDIA,
      },
    },
  },

  OrderUpdateInput: {
    type: 'object',
    description: 'Campos permitidos para actualizar un pedido existente',
    properties: {
      descripcion: {
        type: 'string',
        example: 'Caja de repuestos industriales (fragil)',
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/OrderItem',
        },
      },
      total: {
        type: 'number',
        minimum: 0,
        example: 28000,
      },
      direccionEntrega: {
        type: 'string',
        example: 'Av. Colón 850, Córdoba',
      },
      estado: {
        type: 'string',
        enum: orderStates,
        example: ORDER_STATUS.EN_PREPARACION,
      },
      prioridad: {
        type: 'string',
        enum: orderPriorities,
        example: ORDER_PRIORITY.URGENTE,
      },
    },
  },

  OrderStatusInput: {
    type: 'object',
    description: 'Payload para actualizar únicamente el estado de un pedido',
    required: ['estado'],
    properties: {
      estado: {
        type: 'string',
        enum: orderStates,
        example: ORDER_STATUS.ENVIADO,
        description: 'Nuevo estado válido del pedido',
      },
    },
  },

  // 4. ENTREGA (Delivery)
  Delivery: {
    type: 'object',
    description: 'Entidad Entrega logística vinculada a un pedido y a un usuario con rol repartidor',
    required: ['codigoSeguimiento', 'pedido', 'repartidor', 'estado', 'fechaEstimada', 'direccion'],
    properties: {
      _id: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d3',
      },
      codigoSeguimiento: {
        type: 'string',
        example: 'ENT-1-Z9X8C',
        description: 'Código único de seguimiento de la entrega',
      },
      pedido: {
        oneOf: [
          { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
          { $ref: '#/components/schemas/Order' },
        ],
        description: 'ID o documento poblado del pedido asociado',
      },
      repartidor: {
        oneOf: [
          { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d4' },
          { $ref: '#/components/schemas/User' },
        ],
        description: 'ID o documento poblado del usuario con rol repartidor',
      },
      estado: {
        type: 'string',
        enum: deliveryStates,
        example: DELIVERY_STATUS.ASIGNADA,
        description: 'Estado operativo de la entrega',
      },
      fechaEstimada: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-18T14:00:00.000Z',
        description: 'Fecha estimada de arribo al destino',
      },
      direccion: {
        type: 'string',
        example: 'Av. Libertador 1450, Buenos Aires',
      },
      comprobantes: {
        type: 'array',
        description: 'Metadatos de los comprobantes de entrega asociados',
        items: {
          $ref: '#/components/schemas/FileMetadata',
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:40:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T18:40:00.000Z',
      },
    },
  },

  DeliveryInput: {
    type: 'object',
    description: 'Payload esperado para registrar una nueva entrega logística',
    required: ['pedido', 'repartidor', 'direccion'],
    properties: {
      codigoSeguimiento: {
        type: 'string',
        example: 'ENT-CUSTOM-500',
        description: 'Código opcional (si se omite, se genera automáticamente)',
      },
      pedido: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d2',
        description: 'ObjectId válido de un pedido existente',
      },
      repartidor: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d4',
        description: 'ObjectId válido de un usuario con rol "repartidor"',
      },
      estado: {
        type: 'string',
        enum: deliveryStates,
        default: DELIVERY_STATUS.ASIGNADA,
        example: DELIVERY_STATUS.ASIGNADA,
      },
      fechaEstimada: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-18T14:00:00.000Z',
      },
      direccion: {
        type: 'string',
        example: 'Av. Libertador 1450, Buenos Aires',
      },
    },
  },

  DeliveryUpdateInput: {
    type: 'object',
    description: 'Campos permitidos para actualizar el estado o repartidor de una entrega',
    properties: {
      estado: {
        type: 'string',
        enum: deliveryStates,
        example: DELIVERY_STATUS.EN_CAMINO,
      },
      repartidor: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d4',
      },
      direccion: {
        type: 'string',
        example: 'Av. Libertador 1500, Piso 2',
      },
    },
  },

  // 5. PRODUCTO (Product)
  Product: {
    type: 'object',
    description: 'Producto del catálogo de inventario de ShipNow',
    required: ['title', 'description', 'price', 'stock', 'status', 'category'],
    properties: {
      _id: {
        type: 'string',
        example: '65f1a2b3c4d5e6f7a8b9c0d5',
      },
      title: {
        type: 'string',
        example: 'Caja Reforzada Triple Capa',
      },
      description: {
        type: 'string',
        example: 'Caja de embalaje de alta resistencia para envíos internacionales',
      },
      price: {
        type: 'number',
        minimum: 0,
        example: 3500,
      },
      stock: {
        type: 'integer',
        minimum: 0,
        example: 50,
      },
      status: {
        type: 'string',
        enum: productStates,
        example: PRODUCT_STATUS.AVAILABLE,
      },
      category: {
        type: 'string',
        example: 'embalaje',
      },
    },
  },

  ProductInput: {
    type: 'object',
    required: ['title', 'description', 'price', 'stock', 'category'],
    properties: {
      title: {
        type: 'string',
        example: 'Caja Reforzada Triple Capa',
      },
      description: {
        type: 'string',
        example: 'Caja de embalaje de alta resistencia',
      },
      price: {
        type: 'number',
        minimum: 0,
        example: 3500,
      },
      stock: {
        type: 'integer',
        minimum: 0,
        example: 50,
      },
      category: {
        type: 'string',
        example: 'embalaje',
      },
    },
  },

  // 5.5 METADATOS DE ARCHIVO SUBIDO (FileMetadata)
  FileMetadata: {
    type: 'object',
    description: 'Metadatos registrados en MongoDB de un documento o comprobante almacenado en el servidor',
    required: ['originalName', 'generatedName', 'path', 'mimeType', 'size', 'documentType', 'uploadedAt'],
    properties: {
      originalName: {
        type: 'string',
        example: 'dni_frente.pdf',
        description: 'Nombre original del archivo enviado por el cliente',
      },
      generatedName: {
        type: 'string',
        example: '1763314800000-482910-dni_frente.pdf',
        description: 'Nombre único generado por Multer en el servidor',
      },
      path: {
        type: 'string',
        example: 'uploads/documents/1763314800000-482910-dni_frente.pdf',
        description: 'Ruta relativa dentro del servidor donde se almacenó el archivo',
      },
      mimeType: {
        type: 'string',
        enum: ALLOWED_FILE_MIMETYPES,
        example: 'application/pdf',
        description: 'Tipo MIME validado del archivo',
      },
      size: {
        type: 'integer',
        minimum: 0,
        example: 145280,
        description: 'Tamaño del archivo en bytes (máximo 5 MB)',
      },
      documentType: {
        type: 'string',
        enum: allDocumentTypes,
        example: USER_DOCUMENT_TYPES.IDENTIFICACION,
        description: 'Categoría o tipo de documento/comprobante asociado',
      },
      uploadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-16T17:40:00.000Z',
        description: 'Fecha y hora de carga del archivo',
      },
    },
  },

  // 6. RESPUESTA EXITOSA (SuccessResponse y variantes)
  SuccessResponse: {
    type: 'object',
    description: 'Estructura estándar de respuesta exitosa de ShipNow API',
    required: ['success'],
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Operación completada exitosamente',
      },
      data: {
        type: 'object',
        nullable: true,
        description: 'Datos devueltos por el endpoint (entidad o listado)',
      },
    },
  },

  MockSeedInput: {
    type: 'object',
    description: 'Body opcional para insertar datos simulados en MongoDB mediante POST /api/mocks/seed',
    properties: {
      qty: {
        type: 'integer',
        minimum: 1,
        maximum: 1000,
        default: 10,
        example: 10,
        description: 'Cantidad de registros a generar e insertar (entre 1 y 1000)',
      },
      collection: {
        type: 'string',
        enum: ['usuarios', 'users', 'pedidos', 'orders', 'entregas', 'deliveries', 'all', 'completo'],
        default: 'usuarios',
        example: 'usuarios',
        description: 'Colección destino donde se insertarán los registros simulados',
      },
    },
  },

  MockSeedResponse: {
    type: 'object',
    description: 'Respuesta exitosa al sembrar datos de prueba en MongoDB',
    required: ['insertados', 'coleccion'],
    properties: {
      insertados: {
        type: 'integer',
        example: 10,
        description: 'Cantidad total de documentos insertados en MongoDB',
      },
      coleccion: {
        type: 'string',
        example: 'usuarios',
        description: 'Nombre de la colección sembrada (usuarios, pedidos, entregas, completo)',
      },
      detalle: {
        type: 'object',
        description: 'Desglose por colección cuando se siembra collection=all',
        properties: {
          usuarios: { type: 'integer', example: 5 },
          pedidos: { type: 'integer', example: 5 },
          entregas: { type: 'integer', example: 5 },
        },
      },
    },
  },

  MockAllResponse: {
    type: 'object',
    description: 'Ecosistema completo de datos simulados en memoria con relaciones coherentes',
    properties: {
      usuarios: {
        type: 'array',
        items: { $ref: '#/components/schemas/MockUser' },
      },
      pedidos: {
        type: 'array',
        items: { $ref: '#/components/schemas/Order' },
      },
      entregas: {
        type: 'array',
        items: { $ref: '#/components/schemas/Delivery' },
      },
    },
  },

  LoggerTestResponse: {
    type: 'object',
    description: 'Respuesta del endpoint interno de verificación del sistema de logging con Winston',
    required: ['success', 'message', 'environment', 'activeLevel', 'testedLevels', 'files'],
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Prueba de todos los niveles del logger ejecutada exitosamente',
      },
      environment: {
        type: 'string',
        example: 'development',
      },
      activeLevel: {
        type: 'string',
        example: 'debug',
      },
      testedLevels: {
        type: 'array',
        items: { type: 'string' },
        example: ['fatal', 'error', 'warning', 'info', 'http', 'debug'],
      },
      files: {
        type: 'object',
        properties: {
          errorLog: {
            type: 'string',
            example: 'logs/error.log (solo niveles error y fatal)',
          },
          rotatedErrorLog: {
            type: 'string',
            example: 'logs/error-YYYY-MM-DD.log',
          },
          rotatedCombinedLog: {
            type: 'string',
            example: 'logs/combined-YYYY-MM-DD.log',
          },
        },
      },
    },
  },

  // 7. RESPUESTA DE ERROR UNIFORME (ErrorResponse)
  ErrorDetail: {
    type: 'object',
    required: ['code', 'name', 'message', 'statusCode', 'path', 'method', 'timestamp'],
    properties: {
      code: {
        type: 'string',
        enum: Object.keys(ERROR_DICTIONARY),
        example: ERROR_DICTIONARY.ORDER_NOT_FOUND.code,
        description: 'Código único estandarizado en el diccionario de errores (ERROR_DICTIONARY)',
      },
      name: {
        type: 'string',
        example: 'OrderNotFoundError',
        description: 'Clase del error personalizado del dominio',
      },
      message: {
        type: 'string',
        example: 'No se encontró el pedido con identificador: 65f1a2b3c4d5e6f7a8b9c0d2',
      },
      statusCode: {
        type: 'integer',
        example: 404,
      },
      details: {
        type: 'object',
        nullable: true,
        example: { orderId: '65f1a2b3c4d5e6f7a8b9c0d2' },
        description: 'Metadatos adicionales sobre la causa del error',
      },
      path: {
        type: 'string',
        example: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2',
      },
      method: {
        type: 'string',
        example: 'GET',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2026-11-15T23:45:00.000Z',
      },
    },
  },

  ErrorResponse: {
    type: 'object',
    description: 'Estructura uniforme de error devuelta exclusivamente por el middleware global de ShipNow API',
    required: ['success', 'message', 'error'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example: 'No se encontró el pedido con identificador: 65f1a2b3c4d5e6f7a8b9c0d2',
      },
      error: {
        $ref: '#/components/schemas/ErrorDetail',
      },
    },
  },
};

/**
 * Respuestas de error reutilizables para referenciar en cada endpoint documentado.
 */
export const swaggerErrorResponses = {
  BadRequestError: {
    description: 'Datos de entrada inválidos, ID con formato incorrecto, valores negativos o estado/rol no permitido',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: {
          ValidationError: {
            summary: 'Faltan campos obligatorios o formato inválido',
            value: {
              success: false,
              message: 'Los campos cliente, descripcion, total y direccionEntrega son obligatorios',
              error: {
                code: 'MISSING_REQUIRED_FIELDS',
                name: 'ValidationError',
                message: 'Los campos cliente, descripcion, total y direccionEntrega son obligatorios',
                statusCode: 400,
                details: { required: ['cliente', 'descripcion', 'total', 'direccionEntrega'] },
                path: '/api/orders',
                method: 'POST',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          InvalidStateError: {
            summary: 'Estado inválido para pedido, entrega o producto',
            value: {
              success: false,
              message: "Estado inválido 'volando' para pedido. Estados permitidos: pendiente, en_preparacion, enviado, entregado, cancelado",
              error: {
                code: 'INVALID_STATE',
                name: 'InvalidStateError',
                message: "Estado inválido 'volando' para pedido. Estados permitidos: pendiente, en_preparacion, enviado, entregado, cancelado",
                statusCode: 400,
                details: {
                  entity: 'pedido',
                  receivedState: 'volando',
                  allowedStates: ['pendiente', 'en_preparacion', 'enviado', 'entregado', 'cancelado'],
                },
                path: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2/status',
                method: 'PATCH',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          NegativeValueError: {
            summary: 'Valor negativo no permitido',
            value: {
              success: false,
              message: 'El total del pedido no puede ser negativo',
              error: {
                code: 'NEGATIVE_VALUE',
                name: 'NegativeValueError',
                message: 'El total del pedido no puede ser negativo',
                statusCode: 400,
                details: { field: 'total', receivedValue: -500 },
                path: '/api/orders',
                method: 'POST',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          InvalidObjectIdError: {
            summary: 'Formato de ObjectId inválido',
            value: {
              success: false,
              message: "El ID '123' proporcionado para pedido no tiene un formato válido de MongoDB",
              error: {
                code: 'INVALID_OBJECT_ID',
                name: 'InvalidIdError',
                message: "El ID '123' proporcionado para pedido no tiene un formato válido de MongoDB",
                statusCode: 400,
                details: { id: '123', entity: 'pedido' },
                path: '/api/orders/123',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
        },
      },
    },
  },

  MockBadRequestError: {
    description: 'Cantidad inválida (qty), valor negativo o colección no permitida en el módulo de Mocks',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: {
          InvalidMockQuantityError: {
            summary: 'Cantidad de mocks no numérica, cero, decimal o mayor a 1000',
            value: {
              success: false,
              message: "La cantidad de mocks ('abc') debe ser un valor numérico válido",
              error: {
                code: 'INVALID_MOCK_QUANTITY',
                name: 'InvalidMockQuantityError',
                message: "La cantidad de mocks ('abc') debe ser un valor numérico válido",
                statusCode: 400,
                details: { receivedQty: 'abc', min: 1, max: 1000 },
                path: '/api/mocks/users?qty=abc',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          NegativeMockQuantityError: {
            summary: 'Cantidad negativa enviada al módulo de mocks',
            value: {
              success: false,
              message: 'No se permiten valores negativos para la cantidad de mocks (recibido: -5)',
              error: {
                code: 'NEGATIVE_VALUE',
                name: 'NegativeValueError',
                message: 'No se permiten valores negativos para la cantidad de mocks (recibido: -5)',
                statusCode: 400,
                details: { field: 'qty', receivedValue: -5 },
                path: '/api/mocks/users?qty=-5',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          InvalidMockCollectionError: {
            summary: 'Colección inválida en /api/mocks/seed',
            value: {
              success: false,
              message: "Colección no válida para mocking: 'facturas'. Opciones permitidas: usuarios, pedidos, entregas, all",
              error: {
                code: 'INVALID_MOCK_COLLECTION',
                name: 'InvalidMockCollectionError',
                message: "Colección no válida para mocking: 'facturas'. Opciones permitidas: usuarios, pedidos, entregas, all",
                statusCode: 400,
                details: {
                  receivedCollection: 'facturas',
                  allowedCollections: ['usuarios', 'pedidos', 'entregas', 'all'],
                },
                path: '/api/mocks/seed?collection=facturas',
                method: 'POST',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
        },
      },
    },
  },

  FileUploadBadRequestError: {
    description:
      'Error de validación en la carga de archivos: archivo faltante, tipo MIME/extensión no permitido, tamaño máximo superado (5 MB), campo de archivo inesperado o tipo de documento inválido',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: {
          FileRequiredError: {
            summary: 'Falta el archivo en la solicitud multipart/form-data',
            value: {
              success: false,
              message: "No se recibió ningún archivo. Debe adjuntar un archivo en el campo 'file'",
              error: {
                code: 'FILE_REQUIRED',
                name: 'FileRequiredError',
                message: "No se recibió ningún archivo. Debe adjuntar un archivo en el campo 'file'",
                statusCode: 400,
                details: { expectedField: 'file' },
                path: '/api/users/65f1a2b3c4d5e6f7a8b9c0d1/documents',
                method: 'POST',
                timestamp: '2026-11-16T17:40:00.000Z',
              },
            },
          },
          InvalidFileTypeError: {
            summary: 'Formato o tipo MIME de archivo no permitido',
            value: {
              success: false,
              message: "Tipo de archivo no permitido ('script.exe'). Tipos aceptados: PDF, JPG, JPEG, PNG, WEBP",
              error: {
                code: 'INVALID_FILE_TYPE',
                name: 'InvalidFileTypeError',
                message: "Tipo de archivo no permitido ('script.exe'). Tipos aceptados: PDF, JPG, JPEG, PNG, WEBP",
                statusCode: 400,
                details: {
                  originalName: 'script.exe',
                  receivedMimeType: 'application/x-msdownload',
                  receivedExtension: '.exe',
                  allowedMimeTypes: ALLOWED_FILE_MIMETYPES,
                },
                path: '/api/users/65f1a2b3c4d5e6f7a8b9c0d1/documents',
                method: 'POST',
                timestamp: '2026-11-16T17:40:00.000Z',
              },
            },
          },
          FileSizeExceededError: {
            summary: 'Archivo supera el tamaño máximo permitido (5 MB)',
            value: {
              success: false,
              message: 'El archivo supera el tamaño máximo permitido (5 MB)',
              error: {
                code: 'FILE_SIZE_EXCEEDED',
                name: 'FileSizeExceededError',
                message: 'El archivo supera el tamaño máximo permitido (5 MB)',
                statusCode: 400,
                details: { field: 'file', maxSizeBytes: 5242880 },
                path: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2/receipt',
                method: 'POST',
                timestamp: '2026-11-16T17:40:00.000Z',
              },
            },
          },
          InvalidDocumentTypeError: {
            summary: 'Tipo de documento o comprobante inválido',
            value: {
              success: false,
              message:
                "Tipo de documento inválido: 'pasaporte_falso'. Tipos de documento permitidos: identificacion, licencia, comprobante_domicilio, contrato",
              error: {
                code: 'INVALID_DOCUMENT_TYPE',
                name: 'InvalidDocumentTypeError',
                message:
                  "Tipo de documento inválido: 'pasaporte_falso'. Tipos de documento permitidos: identificacion, licencia, comprobante_domicilio, contrato",
                statusCode: 400,
                details: {
                  receivedType: 'pasaporte_falso',
                  allowedTypes: userDocumentTypes,
                },
                path: '/api/users/65f1a2b3c4d5e6f7a8b9c0d1/documents',
                method: 'POST',
                timestamp: '2026-11-16T17:40:00.000Z',
              },
            },
          },
          InvalidFileFieldError: {
            summary: 'Nombre de campo de archivo inesperado',
            value: {
              success: false,
              message: "Campo de archivo inesperado: 'avatar'. Campos permitidos: file, document, documento",
              error: {
                code: 'INVALID_FILE_FIELD',
                name: 'InvalidFileFieldError',
                message: "Campo de archivo inesperado: 'avatar'. Campos permitidos: file, document, documento",
                statusCode: 400,
                details: {
                  receivedField: 'avatar',
                  expectedFields: ['file', 'document', 'documento'],
                },
                path: '/api/users/65f1a2b3c4d5e6f7a8b9c0d1/documents',
                method: 'POST',
                timestamp: '2026-11-16T17:40:00.000Z',
              },
            },
          },
        },
      },
    },
  },

  NotFoundError: {
    description: 'Recurso solicitado no encontrado en el sistema (Usuario, Pedido, Entrega o Producto)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: {
          UserNotFound: {
            summary: 'Usuario inexistente',
            value: {
              success: false,
              message: 'No se encontró el usuario con identificador: 65f1a2b3c4d5e6f7a8b9c0d1',
              error: {
                code: 'USER_NOT_FOUND',
                name: 'UserNotFoundError',
                message: 'No se encontró el usuario con identificador: 65f1a2b3c4d5e6f7a8b9c0d1',
                statusCode: 404,
                details: { userId: '65f1a2b3c4d5e6f7a8b9c0d1' },
                path: '/api/users/65f1a2b3c4d5e6f7a8b9c0d1',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          OrderNotFound: {
            summary: 'Pedido no encontrado',
            value: {
              success: false,
              message: 'No se encontró el pedido con identificador: 65f1a2b3c4d5e6f7a8b9c0d2',
              error: {
                code: 'ORDER_NOT_FOUND',
                name: 'OrderNotFoundError',
                message: 'No se encontró el pedido con identificador: 65f1a2b3c4d5e6f7a8b9c0d2',
                statusCode: 404,
                details: { orderId: '65f1a2b3c4d5e6f7a8b9c0d2' },
                path: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          DeliveryNotFound: {
            summary: 'Entrega no encontrada',
            value: {
              success: false,
              message: 'No se encontró la entrega con identificador: 65f1a2b3c4d5e6f7a8b9c0d3',
              error: {
                code: 'DELIVERY_NOT_FOUND',
                name: 'DeliveryNotFoundError',
                message: 'No se encontró la entrega con identificador: 65f1a2b3c4d5e6f7a8b9c0d3',
                statusCode: 404,
                details: { deliveryId: '65f1a2b3c4d5e6f7a8b9c0d3' },
                path: '/api/deliveries/65f1a2b3c4d5e6f7a8b9c0d3',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
        },
      },
    },
  },

  ConflictError: {
    description: 'Conflicto por recurso duplicado (correo electrónico o código único ya registrado)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'El correo ana.perez@test.com ya se encuentra registrado',
          error: {
            code: 'USER_ALREADY_EXISTS',
            name: 'DuplicateResourceError',
            message: 'El correo ana.perez@test.com ya se encuentra registrado',
            statusCode: 409,
            details: { field: 'email', value: 'ana.perez@test.com' },
            path: '/api/users',
            method: 'POST',
            timestamp: '2026-11-15T23:45:00.000Z',
          },
        },
      },
    },
  },

  InternalServerError: {
    description: 'Error interno del servidor o fallo controlado de persistencia en MongoDB',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: {
          InternalError: {
            summary: 'Error interno no controlado',
            value: {
              success: false,
              message: 'Error interno no controlado en el servidor',
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                name: 'AppError',
                message: 'Error interno no controlado en el servidor',
                statusCode: 500,
                details: null,
                path: '/api/orders',
                method: 'GET',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
          MockSeedFailure: {
            summary: 'Fallo durante la carga de mocks en MongoDB',
            value: {
              success: false,
              message: "Fallo durante la carga de datos simulados en MongoDB para la colección 'usuarios': connection timed out",
              error: {
                code: 'MOCK_SEED_FAILURE',
                name: 'MockSeedError',
                message: "Fallo durante la carga de datos simulados en MongoDB para la colección 'usuarios': connection timed out",
                statusCode: 500,
                details: {
                  collection: 'usuarios',
                  requestedQty: 10,
                  reason: 'connection timed out',
                },
                path: '/api/mocks/seed',
                method: 'POST',
                timestamp: '2026-11-15T23:45:00.000Z',
              },
            },
          },
        },
      },
    },
  },
};

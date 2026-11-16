Actividad
Pre-entrega Módulo 5 — Documentación de API con Swagger

Objetivo Documentar los endpoints principales de ShipNow con Swagger/OpenAPI, exponiendo una ruta de documentación interactiva donde se pueda consultar y probar la API.

Qué entregar Swagger UI accesible desde una ruta del servidor (ej. /api/docs), con la información general de la API, la documentación organizada por módulos, schemas reutilizables y errores documentados, más el README actualizado.

Criterios de aceptación

    Swagger UI se abre desde una ruta específica (ej. /api/docs), con la configuración de Swagger separada de la lógica de rutas.
    Incluye información general: nombre, versión, descripción, servidor local y propósito.
    La documentación está agrupada por tags: Users, Orders, Deliveries, Mocks, Logger.
    Cada endpoint documenta: método HTTP, ruta, descripción breve, parámetros de ruta (si aplica), body esperado (si aplica), respuesta exitosa y posibles respuestas de error.
    Hay schemas reutilizables para: usuario, pedido, entrega, item de pedido, respuesta de error y respuesta exitosa.
    Los errores documentados coinciden con los reales: datos inválidos, recurso no encontrado, autenticación (si aplica), error interno, cantidad inválida en mocks y estado inválido en pedidos/entregas.
    Los endpoints de mocks están documentados: cómo obtener users/pedidos mock, cómo insertar datos de prueba, qué body espera la carga y qué errores ocurren ante cantidades inválidas.
    El endpoint del logger está documentado, aclarando que es una herramienta de validación, no una funcionalidad de negocio.
    Lo documentado refleja la API real: rutas, métodos, nombres de parámetros, bodies, respuestas y errores.

Cómo entregar Link al repositorio de GitHub (sin node_modules), con el README explicando: la ruta de Swagger, cómo levantar el servidor, qué módulos están documentados y cualquier aclaración para probar los endpoints.

Qué evitar

    Mezclar la configuración de Swagger con la lógica de rutas.
    Dejar todos los endpoints en un solo bloque sin tags.
    Documentar respuestas o errores que la API no devuelve: la documentación debe coincidir con el comportamiento real.

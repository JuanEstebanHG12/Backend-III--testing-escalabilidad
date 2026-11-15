Actividad
Pre-entrega Módulo 3 — Manejo profesional de errores

Objetivo Centralizar el manejo de errores de ShipNow API en una capa común que devuelva respuestas HTTP consistentes, en lugar de responder errores de forma aislada en cada ruta o controller.

Qué entregar Una capa centralizada de gestión de errores compuesta por:

    Errores personalizados del dominio (usuario inexistente, pedido no encontrado, estado inválido, cantidad incorrecta de mocks, etc.).
    Un diccionario de errores.
    Un middleware global que transforme esos errores en respuestas HTTP uniformes.

Esta lógica también debe aplicarse al módulo de mocks del módulo anterior.

Criterios de aceptación

    No hay respuestas de error dispersas en rutas o controllers; todo se deriva a la capa común.
    Los errores se detectan en la capa que corresponde (especialmente en los services), pero la respuesta final al cliente sale únicamente del middleware.
    Todos los errores responden con una estructura clara, predecible y uniforme.
    Existen errores personalizados que representan casos del dominio.
    El módulo de mocks valida los datos recibidos y responde de forma controlada ante: cantidad inválida de datos, valores negativos, o fallas durante la carga en MongoDB.

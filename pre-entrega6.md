Actividad
Pre-entrega Módulo 6 — Testing funcional con Mocha, Chai y Supertest

Objetivo Implementar una suite de tests funcionales automatizados que validen los endpoints principales de ShipNow, cubriendo casos exitosos y errores esperados.

Qué entregar Una suite inicial de tests funcionales integrada al repositorio, con el entorno de testing separado del de desarrollo, las herramientas configuradas, un script para ejecutarlos y el README actualizado.

Criterios de aceptación

    El entorno de testing está separado del de desarrollo: variables de entorno propias y, si corresponde, base de datos separada.
    Están instalados Mocha (organizar/ejecutar), Chai (validar) y Supertest (peticiones HTTP), con un script de test en el proyecto.
    La app Express está separada del levantamiento del servidor, de modo que los tests puedan importarla sin abrir manualmente un puerto.
    Hay tests para los endpoints principales: obtener usuarios; obtener, crear y consultar pedidos por ID; actualizar estados (si aplica); endpoints de mocks; endpoint de logger; ruta de Swagger.
    Se cubren casos exitosos (listados correctos, crear pedido con datos válidos, generar mocks, acceder a logger y a Swagger).
    Se cubren casos de error (datos incompletos, recurso inexistente, estado inválido, mocks con cantidades inválidas, ruta inexistente), validando el status HTTP correcto y el formato de error definido en el módulo de errores.
    Cada test valida no solo que el endpoint responde, sino la estructura del body y sus propiedades importantes.
    Los datos de prueba son controlados y repetibles (apoyados en mocks o creados dentro del entorno de testing; ej. crear un usuario válido antes de un pedido), sin depender de datos cargados manualmente.
    Existe una estrategia de limpieza de los datos generados por los tests (antes o después de cada grupo).
    Coherencia con Swagger: los comportamientos documentados (ej. un 404 ante recurso inexistente) tienen su test correspondiente.

Cómo entregar Link al repositorio de GitHub (sin node_modules), con una sección de testing en el README que indique: qué herramientas se usan, cómo ejecutar los tests, qué módulos están cubiertos, si se requiere una base de datos de testing y qué variables de entorno son necesarias.

Qué evitar

    Usar datos reales o importantes para correr pruebas: deben ser datos controlados y descartables.
    Quedarte en verificar que "responde" o que "falla": hay que comprobar que lo hace de la manera esperada (status + formato de respuesta).
    Tests que dependan del estado previo de la base o del orden de ejecución.


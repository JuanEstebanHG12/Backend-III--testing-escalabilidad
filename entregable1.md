Actividad
Pre-entrega Módulo 1 — Estructura profesional de ShipNow

Objetivo Refactorizar la API base de ShipNow a una arquitectura por capas y agregar un sistema de configuración de entorno validado.

Qué entregar Refactorización de los endpoints de Usuarios y Productos en arquitectura de 3 capas:

    Controller: única puerta de entrada HTTP.
    Service: lógica de negocio.
    Repository: único lugar que conoce Mongoose/MongoDB.

Más una capa de configuración de entorno que valide variables al arranque y un diccionario de constantes para estados y roles.

Criterios de aceptación

    Existen las carpetas controllers/, services/, repositories/, models/ y config/.
    Flujo de dependencias: Controller → Service → Repository. El Controller nunca importa Mongoose directamente.
    .env no está en el repo; existe un .env.example.
    Si falta una variable crítica (ej. MONGODB_URI), la app lanza un error descriptivo y no arranca.
    Los roles de usuario (ADMIN, USER) se usan vía un objeto de constantes, no como strings sueltos.
    Los archivos de routes/ quedan mínimos: solo conectan el path con el método del Controller.

Pasos

    src/config/index.js: usar dotenv para exportar un objeto con las variables ya validadas.
    src/utils/constants.js: definir los valores inmutables del dominio (estados, roles).
    Refactorizar una entidad por vez (empezá por Products): Repository → Service → Controller, verificando que la ruta funcione antes de seguir.

Qué evitar

    Repository "pasamanos": que solo haga return model.find(). Debe encapsular acceso (filtros por defecto, proyecciones).
    Lógica de negocio en el Repository: cálculos de totales o validación de permisos van en el Service. El Repository solo busca y guarda datos.

Repositorio de GitHub con la estructura inicial de la API ShipNow refactorizada por capas y configuración de entorno implementada.

Entregable
Pre-entrega Módulo 1: Briefing de Pre-entrega: Estructura Profesional de ShipNow
Objetivo

Refactorizar la API ShipNow para pasar de un modelo monolítico a una arquitectura profesional por capas (Controller-Service-Repository), asegurando que la configuración de entorno sea robusta.
Tareas Paso a Paso

    Inicialización y Configuración de Entorno:
        Configura dotenv en un módulo centralizado dentro de src/config/env.config.js.
        Exporta un objeto de configuración que valide la presencia de: PORT, MONGODB_URI y NODE_ENV.
        Crea un archivo .env.example con las claves necesarias pero sin valores reales.
    Centralización de Constantes:
        Crea src/constants/index.js.
        Define objetos congelados (Object.freeze) para los estados del producto (ej. AVAILABLE, OUT_OF_STOCK) y roles de usuario.
    Refactorización a 3 Capas (Entidades: Products y Users):
        Repository: Mueve todas las llamadas a Mongoose/MongoDB aquí. Ejemplo: ProductRepository.getAll().
        Service: Implementa la lógica de negocio. Debe llamar al Repository. Aquí es donde podrías, por ejemplo, filtrar productos que no tengan stock antes de enviarlos.
        Controller: Gestiona el req y res. Llama al Service y retorna el status code apropiado.
        Router: Actualiza las rutas para que solo invoquen el método correspondiente del Controller.
    Limpieza de Código:
        Asegúrate de que no existan llamadas directas a process.env fuera del archivo de configuración.
        Verifica que los modelos solo definan el esquema y no contengan lógica de controladores.

Formato de Entrega

Sube tu código a un repositorio de GitHub. El README debe incluir:

    Instrucciones para correr el proyecto localmente.
    Una breve explicación de por qué elegiste separar cierta lógica entre Service y Repository.
    El link al repositorio debe ser enviado a través de la plataforma.

Criterios de Evaluación

    Modularidad: ¿Están las carpetas correctamente separadas?
    Abstracción: ¿El Controller conoce detalles de la base de datos? (No debería).
    Robustez: ¿La app falla con un error claro si borro la URI de la base de datos del .env?
    Legibilidad: ¿Se eliminaron los strings mágicos por el uso de constantes?

Actividad
Pre-entrega Módulo 4: Logging y monitoreo básico
Descripción detallada de la actividad

En esta pre-entrega vas a incorporar un sistema de logging profesional dentro de ShipNow API, conectándolo con lo trabajado en los módulos anteriores.

Hasta ahora el proyecto ya cuenta con una arquitectura por capas, un sistema de mocks para generar datos de prueba y una capa centralizada de manejo de errores. En este nuevo checkpoint, el objetivo es que la API no solo responda correctamente ante errores, sino que también deje registros internos que permitan entender qué está ocurriendo dentro del servidor.

La actividad consiste en reemplazar el uso desordenado de console.log() por un logger centralizado utilizando Winston. Este logger deberá permitir registrar eventos con distintos niveles de importancia, como información general, advertencias, errores y fallas críticas.

La implementación debe respetar la estructura profesional del proyecto. El logger debe estar configurado en un módulo propio y luego ser utilizado en puntos relevantes de la aplicación, especialmente en el arranque del servidor, la conexión a MongoDB, el middleware global de errores, el módulo de mocks y operaciones importantes como creación de pedidos o generación de datos de prueba.

También deberás configurar la persistencia de logs en archivos. Los errores importantes deben guardarse en una carpeta específica de logs, evitando que esos archivos se suban al repositorio. Además, se debe incorporar una estrategia de rotación de archivos para que los registros no crezcan sin control.

Finalmente, deberás agregar un endpoint de prueba del logger que permita verificar rápidamente que todos los niveles funcionan correctamente. Este endpoint no representa una funcionalidad real del negocio, sino una herramienta interna para validar la configuración del sistema de logs.

📎 Ejemplo del output esperado

Al iniciar el servidor y disparar el endpoint de prueba, tus logs deberían verse así (consola y archivo), con nivel + timestamp + mensaje:

2026-08-01 10:12:03 [info]    Servidor ShipNow escuchando en el puerto 3000
2026-08-01 10:12:03 [info]    Conexión a MongoDB establecida
2026-08-01 10:14:21 [warning] Pedido #A-102 sin repartidor asignado
2026-08-01 10:15:09 [error]   Falló la creación del pedido: ValidationError (campo "destino" requerido)

Y en /logs/error.log solo deben quedar los niveles error y fatal (no info ni debug).
Paso a paso de la actividad
1. Revisar el manejo actual de mensajes en consola

Antes de agregar Winston, revisá si el proyecto tiene mensajes con console.log(), console.error() o similares.

La idea no es borrar todos sin criterio, sino identificar cuáles deberían transformarse en logs profesionales.

Por ejemplo:

    inicio del servidor;
    conexión exitosa o fallida a MongoDB;
    errores capturados por el middleware;
    generación de datos mock;
    creación o actualización de entidades importantes.

2. Crear una configuración centralizada del logger

Agregá una configuración única para el logger dentro del proyecto.

Esta configuración debe definir:

    niveles de log;
    formato del mensaje;
    salida por consola;
    salida por archivo;
    comportamiento distinto según el entorno.

Los niveles esperados son:

debug
http
info
warning
error
fatal

La aplicación debe poder usar este logger desde distintos archivos sin repetir configuración.
3. Diferenciar desarrollo y producción

El logger debe comportarse de manera distinta según el entorno.

En desarrollo puede mostrar más información, incluyendo logs de nivel debug.

En producción debe ser más controlado, registrando desde niveles más relevantes, como info, warning, error y fatal.

Esta lógica debe apoyarse en las variables de entorno trabajadas en el módulo 1.
4. Integrar el logger con el middleware de errores

El módulo anterior incorporó una capa centralizada de errores.

Ahora esa capa debe registrar los errores usando Winston.

Los errores esperados o de negocio pueden registrarse como advertencias.

Los errores inesperados del servidor deben registrarse como errores.

Las fallas críticas, como problemas graves de configuración o conexión inicial, pueden registrarse como fatales.

La respuesta al cliente debe seguir siendo clara y consistente. El logger no reemplaza al manejo de errores: lo complementa.
5. Registrar eventos importantes del proyecto

El logger debe utilizarse en puntos relevantes de ShipNow.

Algunos ejemplos esperados:

    servidor iniciado correctamente;
    conexión exitosa a MongoDB;
    error al conectar con MongoDB;
    generación de datos mock;
    cantidad inválida enviada al endpoint de mocks;
    pedido creado correctamente;
    pedido no encontrado;
    ruta inexistente;
    error inesperado del servidor.

No es necesario loguear absolutamente todo. La idea es registrar eventos que ayuden a investigar problemas reales.
6. Persistir errores en archivos

Configurá el logger para guardar errores importantes en archivos dentro de una carpeta de logs.

Los logs persistidos deben permitir consultar errores después de que ocurrieron.

También se debe evitar que estos archivos se suban a GitHub, agregándolos al .gitignore.

La carpeta puede quedar documentada, pero los archivos generados por la aplicación no deben formar parte del repositorio.
7. Incorporar rotación de archivos

Para evitar que los archivos de logs crezcan sin control, incorporá una estrategia de rotación.

La rotación puede organizar los archivos por fecha o limitar la cantidad de días conservados.

La idea es que el sistema pueda mantener un historial ordenado sin generar archivos gigantes.
8. Crear un endpoint de prueba del logger

Agregá un endpoint de prueba para verificar que el logger funciona.

Este endpoint debe generar logs en todos los niveles definidos:

debug
http
info
warning
error
fatal

Su objetivo es facilitar la revisión del proyecto y comprobar que los logs aparecen donde corresponde: consola, archivo de errores y archivos rotados si corresponde.
9. Actualizar el README

El README debe explicar brevemente:

    qué herramienta de logging se usa;
    qué niveles de log existen;
    cómo probar el endpoint del logger;
    dónde se guardan los archivos de logs;
    qué archivos o carpetas se ignoran en Git;
    cómo varía el comportamiento según el entorno.

Objetivos del entregable

    Incorporar logging profesional en ShipNow API Reemplazar mensajes sueltos por un logger centralizado que permita registrar eventos importantes del servidor.
    Clasificar eventos mediante niveles de log Utilizar niveles como debug, http, info, warning, error y fatal para diferenciar la importancia de cada registro.
    Integrar el logger con el manejo de errores Conectar Winston con el middleware global de errores para registrar advertencias, errores inesperados y fallas críticas.
    Persistir logs importantes en archivos Guardar errores relevantes en archivos y aplicar rotación para mantener un historial ordenado y controlado.
    Mejorar la observabilidad del proyecto final Permitir que ShipNow pueda ser investigada y monitoreada de forma básica, facilitando debugging, testing y revisión técnica.

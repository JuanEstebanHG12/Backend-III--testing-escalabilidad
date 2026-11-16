Actividad
Pre-entrega Módulo 7 — Carga de archivos, documentos y comprobantes

Objetivo Incorporar a ShipNow la carga y gestión de archivos con Multer: subir documentos vía multipart/form-data, validarlos, almacenarlos en el servidor y asociarlos a entidades del sistema.

Qué entregar Endpoints que reciben archivos, los validan, los guardan en carpetas del servidor y registran sus metadatos en la base, integrados al flujo del proyecto (errores, logging, Swagger y tests).

Criterios de aceptación

    Multer instalado con una configuración centralizada (separada de los routers) que define: dónde se guardan los archivos, cómo se nombran, tipos aceptados, tamaño máximo y manejo de errores de carga.
    Existe una estructura clara de carpetas para uploads (ej. subcarpetas por tipo: documentos de usuario, licencias, comprobantes de entrega), y esa carpeta está en .gitignore (los archivos subidos no van al repo).
    Validaciones, conectadas al sistema de errores centralizado: que el archivo exista, que el tipo sea permitido, que no supere el tamaño máximo, que el campo enviado coincida con lo esperado y que el tipo de documento sea válido (si se envía).
    Endpoint para documentos de usuario: recibe ID de usuario, archivo y tipo de documento; verifica que el usuario exista; valida el archivo; lo guarda en la carpeta correspondiente; registra los metadatos en la entidad usuario.
    Endpoint para comprobantes asociados a una operación (pedido/entrega): recibe el ID de la entidad y el archivo; valida que la entidad exista; guarda el archivo; registra metadatos; devuelve una respuesta clara con la info actualizada.
    En la base se guardan solo metadatos, no el archivo: nombre original, nombre generado, ruta, tipo, tamaño, tipo de documento y fecha de carga.
    Hay errores específicos de archivos (archivo requerido, tipo inválido, tamaño superado, tipo de documento inválido, entidad no encontrada, error al guardar) que responden con el formato general del proyecto.
    El logger registra eventos relevantes (carga exitosa, error al subir, intento de tipo no permitido, comprobante asociado a una entidad).
    Los endpoints están documentados en Swagger como multipart/form-data, indicando: nombre del campo de archivo, campos adicionales requeridos, tipos de documento permitidos, respuesta exitosa y posibles errores.
    Hay tests funcionales: carga correcta de un documento, error cuando falta el archivo, error con tipo de documento inválido y error cuando la entidad no existe (comprobantes, si el flujo está implementado).

Cómo entregar Link al repositorio de GitHub, sin node_modules ni la carpeta de uploads (debe estar en .gitignore).

Qué evitar

    Mezclar la configuración de Multer dentro de los routers.
    Subir los archivos cargados al repositorio.
    Guardar el archivo completo dentro de MongoDB (solo van los metadatos).
    Dejar el archivo aislado en una carpeta sin asociarlo a su entidad.
    Respuestas de error aisladas o distintas al resto de la API.

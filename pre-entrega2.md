Pre-entrega Módulo 2 — Mocking y carga de datos de prueba en ShipNow

Objetivo Incorporar a ShipNow API un sistema de mocking que genere datos simulados (usuarios, repartidores, pedidos y entregas) sin depender de datos reales cargados a mano, respetando la arquitectura por capas.

Qué entregar Un módulo de mocking integrado en la estructura por capas (rutas, controladores, servicios, repositorios, modelos), con un router bajo /api/mocks que exponga:

    Endpoint(s) que devuelvan datos simulados sin guardarlos en la base.
    Endpoint que inserte registros de prueba en MongoDB de forma controlada.

Criterios de aceptación

    La lógica de mocking respeta la separación por capas; no queda mezclada en los archivos de rutas.
    Existe un router específico bajo /api/mocks.
    Los datos simulados tienen una estructura similar a los modelos reales:
        Usuarios con roles válidos.
        Pedidos con estados y prioridades permitidos.
        Entregas asociadas correctamente a pedidos y, cuando corresponda, a repartidores.
    Se respetan las relaciones: pedido ↔ usuario, entrega ↔ pedido, repartidor con rol coherente.
    Se usan las constantes del módulo anterior para roles, estados y prioridades (sin strings sueltos ni valores escritos a mano).

Cómo entregar

    Link al repositorio de GitHub, sin node_modules.
    README que explique cómo probar los endpoints de mocking, qué datos se pueden generar y cómo usar la carga de datos de prueba.

📎 Ejemplo del output esperado

GET /api/mocks/users?qty=2 devuelve datos simulados sin guardarlos:

json

[
  { "nombre": "Ana Pérez",  "email": "ana.perez@test.com",  "rol": "cliente" },
  { "nombre": "Luis Gómez", "email": "luis.gomez@test.com", "rol": "repartidor" }
]

POST /api/mocks/seed?qty=10 inserta los registros en MongoDB y responde:

json

{ "insertados": 10, "coleccion": "usuarios" }

Tu entrega tiene que comportarse así (los datos respetan los modelos y las constantes de roles/estados del proyecto).
Incorporar un sistema de mocking en ShipNow API para generar usuarios, repartidores, pedidos y entregas de prueba, respetando la arquitectura por capas creada en el módulo anterior.

Entregable
Pre-entrega Módulo 2 : Mocking y carga de datos

Crear un módulo de mocking para ShipNow API que permita generar usuarios, repartidores, pedidos y entregas de prueba.

El proyecto debe incluir un router /api/mocks con endpoints para devolver datos simulados y para insertar registros de prueba en MongoDB.

La implementación debe respetar la arquitectura por capas trabajada en el módulo anterior. Los datos generados deben respetar los modelos reales del proyecto, mantener relaciones básicas entre entidades y usar las constantes definidas para roles, estados y prioridades.

Entregar link al repositorio de GitHub sin node_modules, incluyendo un README con instrucciones para probar los endpoints de mocks.
# Taller (1 hora): Node.js + MongoDB + Postman

Backend de un catalogo de productos que demuestra el enfoque **schemaless** de MongoDB:
una misma coleccion guarda documentos con estructuras distintas y se consultan de forma dinamica.

## Idea principal

En MongoDB no se necesita una estructura fija. En la coleccion `productos` un laptop tiene
`specs.cpu`, un libro tiene `autor` y una camiseta tiene `talla`, todos juntos. Usamos el driver
nativo `mongodb` (no Mongoose) para que nada obligue una forma a los documentos.

## Requisitos

- Node.js y MongoDB corriendo en `localhost:27017` (la conexion esta en `src/config/db.js`).
- Postman.

## Estructura

```
src/
  config/db.js        conexion a MongoDB
  server.js           servidor Express
  seed.js             carga 10 productos de ejemplo
  queryBuilder.js     query params -> filtro de MongoDB
  routes/productos.js endpoints
postman/              coleccion para importar
```

## Pasos (lo que se hace en clase)

```bash
npm install
npm run seed     # carga los datos de ejemplo
npm start        # http://localhost:3000
```

En Postman: Import -> `postman/TallerMongo.postman_collection.json`. Ejecutar primero
**CRUD > Crear producto**: guarda el `_id` en la variable `productoId` para las demas peticiones.

## Consultas dinamicas

`queryBuilder.js` convierte los parametros de la URL en un filtro de MongoDB segun el sufijo:

| URL                       | Operador               | Ejemplo                      |
|---------------------------|------------------------|------------------------------|
| `campo=valor`             | igualdad               | `?categoria=laptop`          |
| `campo_min` / `campo_max` | `$gte` / `$lte`        | `?precio_min=100`            |
| `campo_like`              | `$regex`               | `?nombre_like=cafe`          |
| `campo_in=a,b`            | `$in`                  | `?categoria_in=libro,cafe`   |
| `campo_exists=true|false` | `$exists`              | `?marca_exists=false`        |
| `q`                       | busqueda en varios campos | `?q=apple`                |
| `sort` + `order`          | orden                  | `?sort=precio&order=desc`    |
| `page` + `limit`          | paginacion             | `?page=1&limit=3`            |
| `fields`                  | proyeccion             | `?fields=nombre,precio`      |

Campos anidados con dot notation: `?specs.ram_gb_min=8`.

## Endpoints

| Metodo | Ruta                              | Que hace                                  |
|--------|-----------------------------------|-------------------------------------------|
| GET    | `/productos`                      | consulta dinamica (tabla de arriba)       |
| GET    | `/productos/:id`                  | uno por id                                |
| POST   | `/productos`                      | crear con cualquier estructura            |
| PUT    | `/productos/:id`                  | actualizar/agregar campos                 |
| DELETE | `/productos/:id`                  | eliminar                                  |
| GET    | `/productos/stats/categoria`      | agregacion: agrupa por categoria          |
| GET    | `/productos/stats/campos`         | que campos existen y en cuantos docs      |
| GET    | `/productos/buscar/existe/:campo` | quien tiene (y quien no) un campo         |

## Demostrar el schemaless

1. `GET /productos/stats/campos`: `nombre/precio/categoria` estan en los 10 docs, pero `specs`
   solo en 4 y `autor` en 2. Misma coleccion, campos distintos.
2. `POST /productos` con un JSON inventado: se inserta aunque ningun otro documento tenga esos campos.

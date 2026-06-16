const express = require('express');
const { connect } = require('./config/db');
const productosRouter = require('./routes/productos');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    taller: 'Node + MongoDB (schemaless) + Postman',
    endpoints: {
      'GET /productos': 'consulta dinamica (filtros, rango, like, in, exists, sort, paginacion, fields)',
      'GET /productos/:id': 'obtener uno por id',
      'POST /productos': 'crear producto con cualquier estructura',
      'PUT /productos/:id': 'actualizar campos',
      'DELETE /productos/:id': 'eliminar',
      'GET /productos/stats/categoria': 'agregacion: agrupar por categoria',
      'GET /productos/stats/campos': 'que campos existen y en cuantos documentos',
      'GET /productos/buscar/existe/:campo': 'documentos que tienen (o no) un campo',
    },
  });
});

app.use('/productos', productosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'error interno', detalle: err.message });
});

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });

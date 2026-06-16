const express = require('express');
const Producto = require('../models/producto');
const { construirFiltro, construirOpciones } = require('../queryBuilder');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filtro = construirFiltro(req.query);
    const opciones = construirOpciones(req.query);
    const { total, items } = await Producto.buscar(filtro, opciones);
    res.json({ filtro, opciones, total, count: items.length, items });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/categoria', async (req, res, next) => {
  try {
    const resultado = await Producto.agruparPorCategoria();
    res.json({ resultado });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/campos', async (req, res, next) => {
  try {
    const resultado = await Producto.mapaDeCampos();
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

router.get('/buscar/existe/:campo', async (req, res, next) => {
  try {
    const resultado = await Producto.porExistenciaDeCampo(req.params.campo);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!Producto.esIdValido(req.params.id)) return res.status(400).json({ error: 'id invalido' });
    const doc = await Producto.buscarPorId(req.params.id);
    if (!doc) return res.status(404).json({ error: 'producto no encontrado' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const doc = req.body;
    if (!doc || typeof doc !== 'object' || Array.isArray(doc) || Object.keys(doc).length === 0) {
      return res.status(400).json({ error: 'el body debe ser un objeto JSON con al menos un campo' });
    }
    const creado = await Producto.crear(doc);
    res.status(201).json(creado);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!Producto.esIdValido(req.params.id)) return res.status(400).json({ error: 'id invalido' });
    const actualizado = await Producto.actualizar(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'producto no encontrado' });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!Producto.esIdValido(req.params.id)) return res.status(400).json({ error: 'id invalido' });
    const eliminado = await Producto.eliminar(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'producto no encontrado' });
    res.json({ eliminado: true, _id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

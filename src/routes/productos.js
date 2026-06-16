const express = require('express');
const { ObjectId } = require('mongodb');
const { productos } = require('../config/db');
const { construirFiltro, construirOpciones } = require('../queryBuilder');

const router = express.Router();

function aObjectId(id, res) {
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'id invalido' });
    return null;
  }
  return new ObjectId(id);
}

router.get('/', async (req, res, next) => {
  try {
    const filtro = construirFiltro(req.query);
    const opciones = construirOpciones(req.query);

    const cursor = productos().find(filtro, opciones);
    const items = await cursor.toArray();
    const total = await productos().countDocuments(filtro);

    res.json({ filtro, opciones, total, count: items.length, items });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/categoria', async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$categoria',
          cantidad: { $sum: 1 },
          precio_promedio: { $avg: '$precio' },
          precio_min: { $min: '$precio' },
          precio_max: { $max: '$precio' },
        },
      },
      { $sort: { cantidad: -1 } },
    ];
    const resultado = await productos().aggregate(pipeline).toArray();
    res.json({ resultado });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/campos', async (req, res, next) => {
  try {
    const pipeline = [
      { $project: { campos: { $objectToArray: '$$ROOT' } } },
      { $unwind: '$campos' },
      { $group: { _id: '$campos.k', documentos: { $sum: 1 } } },
      { $sort: { documentos: -1 } },
    ];
    const resultado = await productos().aggregate(pipeline).toArray();
    const total = await productos().countDocuments({});
    res.json({ total_documentos: total, campos: resultado });
  } catch (err) {
    next(err);
  }
});

router.get('/buscar/existe/:campo', async (req, res, next) => {
  try {
    const campo = req.params.campo;
    const tiene = await productos().find({ [campo]: { $exists: true } }).toArray();
    const noTiene = await productos().countDocuments({ [campo]: { $exists: false } });
    res.json({
      campo,
      documentos_con_el_campo: tiene.length,
      documentos_sin_el_campo: noTiene,
      items: tiene,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const _id = aObjectId(req.params.id, res);
    if (!_id) return;
    const doc = await productos().findOne({ _id });
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
    const resultado = await productos().insertOne(doc);
    res.status(201).json({ _id: resultado.insertedId, ...doc });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const _id = aObjectId(req.params.id, res);
    if (!_id) return;
    const resultado = await productos().findOneAndUpdate(
      { _id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!resultado) return res.status(404).json({ error: 'producto no encontrado' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const _id = aObjectId(req.params.id, res);
    if (!_id) return;
    const resultado = await productos().deleteOne({ _id });
    if (resultado.deletedCount === 0) return res.status(404).json({ error: 'producto no encontrado' });
    res.json({ eliminado: true, _id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

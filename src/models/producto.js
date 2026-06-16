const { ObjectId } = require('mongodb');
const { productos } = require('../config/db');

function esIdValido(id) {
  return ObjectId.isValid(id);
}

async function buscar(filtro, opciones) {
  const items = await productos().find(filtro, opciones).toArray();
  const total = await productos().countDocuments(filtro);
  return { total, items };
}

async function buscarPorId(id) {
  return productos().findOne({ _id: new ObjectId(id) });
}

async function crear(doc) {
  const resultado = await productos().insertOne(doc);
  return { _id: resultado.insertedId, ...doc };
}

async function actualizar(id, cambios) {
  return productos().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: cambios },
    { returnDocument: 'after' }
  );
}

async function eliminar(id) {
  const resultado = await productos().deleteOne({ _id: new ObjectId(id) });
  return resultado.deletedCount > 0;
}

async function agruparPorCategoria() {
  return productos()
    .aggregate([
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
    ])
    .toArray();
}

async function mapaDeCampos() {
  const campos = await productos()
    .aggregate([
      { $project: { campos: { $objectToArray: '$$ROOT' } } },
      { $unwind: '$campos' },
      { $group: { _id: '$campos.k', documentos: { $sum: 1 } } },
      { $sort: { documentos: -1 } },
    ])
    .toArray();
  const total = await productos().countDocuments({});
  return { total_documentos: total, campos };
}

async function porExistenciaDeCampo(campo) {
  const conElCampo = await productos().find({ [campo]: { $exists: true } }).toArray();
  const sinElCampo = await productos().countDocuments({ [campo]: { $exists: false } });
  return {
    campo,
    documentos_con_el_campo: conElCampo.length,
    documentos_sin_el_campo: sinElCampo,
    items: conElCampo,
  };
}

module.exports = {
  esIdValido,
  buscar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  agruparPorCategoria,
  mapaDeCampos,
  porExistenciaDeCampo,
};

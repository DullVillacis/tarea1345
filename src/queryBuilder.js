const RESERVADOS = new Set(['sort', 'order', 'page', 'limit', 'fields', 'q']);

function parseValor(valor) {
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  if (valor === 'null') return null;
  if (valor.trim() !== '' && !isNaN(Number(valor))) return Number(valor);
  return valor;
}

function construirFiltro(query) {
  const filtro = {};

  for (const clave of Object.keys(query)) {
    if (RESERVADOS.has(clave)) continue;

    const valor = query[clave];

    if (clave.endsWith('_min')) {
      const campo = clave.slice(0, -4);
      filtro[campo] = { ...(filtro[campo] || {}), $gte: parseValor(valor) };
      continue;
    }

    if (clave.endsWith('_max')) {
      const campo = clave.slice(0, -4);
      filtro[campo] = { ...(filtro[campo] || {}), $lte: parseValor(valor) };
      continue;
    }

    if (clave.endsWith('_like')) {
      const campo = clave.slice(0, -5);
      filtro[campo] = { $regex: String(valor), $options: 'i' };
      continue;
    }

    if (clave.endsWith('_in')) {
      const campo = clave.slice(0, -3);
      const lista = String(valor).split(',').map((v) => parseValor(v.trim()));
      filtro[campo] = { $in: lista };
      continue;
    }

    if (clave.endsWith('_exists')) {
      const campo = clave.slice(0, -7);
      filtro[campo] = { $exists: parseValor(valor) === true };
      continue;
    }

    filtro[clave] = parseValor(valor);
  }

  if (query.q) {
    const texto = String(query.q);
    filtro.$or = [
      { nombre: { $regex: texto, $options: 'i' } },
      { descripcion: { $regex: texto, $options: 'i' } },
      { categoria: { $regex: texto, $options: 'i' } },
      { marca: { $regex: texto, $options: 'i' } },
    ];
  }

  return filtro;
}

function construirOpciones(query) {
  const opciones = {};

  if (query.sort) {
    const direccion = String(query.order).toLowerCase() === 'desc' ? -1 : 1;
    opciones.sort = { [query.sort]: direccion };
  }

  const limit = parseInt(query.limit, 10);
  const page = parseInt(query.page, 10);

  if (!isNaN(limit) && limit > 0) {
    opciones.limit = limit;
    if (!isNaN(page) && page > 1) {
      opciones.skip = (page - 1) * limit;
    }
  }

  if (query.fields) {
    const projection = {};
    String(query.fields)
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .forEach((f) => {
        projection[f] = 1;
      });
    opciones.projection = projection;
  }

  return opciones;
}

module.exports = { construirFiltro, construirOpciones, parseValor };

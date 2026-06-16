const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'taller_tienda';

const client = new MongoClient(MONGO_URI);

let db = null;

async function connect() {
  if (db) return db;
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[db] Conectado a MongoDB -> base de datos "${DB_NAME}"`);
  return db;
}

function productos() {
  if (!db) throw new Error('La base de datos no esta conectada. Llama a connect() primero.');
  return db.collection('productos');
}

async function close() {
  await client.close();
  db = null;
}

module.exports = { connect, productos, close, client };

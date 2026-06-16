const { connect, productos, close } = require('./config/db');

const datos = [
  {
    categoria: 'laptop',
    nombre: 'Laptop Gamer X15',
    marca: 'Acer',
    precio: 1450,
    stock: 8,
    specs: {
      cpu: 'Intel i7-13700H',
      ram_gb: 16,
      almacenamiento_gb: 512,
      gpu: 'RTX 4060',
    },
    puertos: ['USB-C', 'HDMI', 'USB-A', 'Ethernet'],
  },
  {
    categoria: 'laptop',
    nombre: 'Ultrabook Air',
    marca: 'Apple',
    precio: 1999,
    stock: 3,
    specs: {
      cpu: 'M3',
      ram_gb: 8,
      almacenamiento_gb: 256,
    },
    color: 'gris espacial',
  },
  {
    categoria: 'camiseta',
    nombre: 'Camiseta basica algodon',
    marca: 'Nike',
    precio: 25,
    talla: 'M',
    color: 'negro',
    material: '100% algodon',
    tallas_disponibles: ['S', 'M', 'L', 'XL'],
  },
  {
    categoria: 'camiseta',
    nombre: 'Polo deportivo',
    precio: 32,
    talla: 'L',
    color: 'azul',
    transpirable: true,
  },
  {
    categoria: 'libro',
    nombre: 'Cien anios de soledad',
    autor: 'Gabriel Garcia Marquez',
    paginas: 471,
    isbn: '978-0307474728',
    editorial: 'Sudamericana',
    precio: 18,
    tapa: 'blanda',
  },
  {
    categoria: 'libro',
    nombre: 'Clean Code',
    autor: 'Robert C. Martin',
    paginas: 464,
    precio: 45,
    idioma: 'ingles',
    temas: ['programacion', 'buenas practicas'],
  },
  {
    categoria: 'smartphone',
    nombre: 'Galaxy S24',
    marca: 'Samsung',
    precio: 899,
    stock: 20,
    specs: {
      pantalla_pulgadas: 6.2,
      ram_gb: 8,
      almacenamiento_gb: 256,
      camara_mp: 50,
    },
    colores: ['negro', 'violeta', 'crema'],
    cinco_g: true,
  },
  {
    categoria: 'smartphone',
    nombre: 'Pixel 8',
    marca: 'Google',
    precio: 699,
    specs: {
      pantalla_pulgadas: 6.1,
      ram_gb: 8,
    },
    garantia_meses: 24,
  },
  {
    categoria: 'cafe',
    nombre: 'Cafe organico de altura',
    origen: 'Loja, Ecuador',
    precio: 12,
    peso_gramos: 500,
    tueste: 'medio',
    organico: true,
  },
  {
    categoria: 'accesorio',
    nombre: 'Mouse inalambrico',
    marca: 'Logitech',
    precio: 29,
    stock: 50,
    inalambrico: true,
    dpi: 1600,
    pilas: '1 x AA',
  },
];

async function seed() {
  await connect();
  const col = productos();

  await col.deleteMany({});
  const resultado = await col.insertMany(datos);

  console.log(`[seed] Insertados ${resultado.insertedCount} productos en la coleccion "productos".`);
  console.log('[seed] Cada documento tiene campos distintos: eso es schemaless.');

  await close();
}

seed().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});

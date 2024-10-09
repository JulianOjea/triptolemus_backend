require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const questionRoutes = require('./routes/questions');
const categoryRoutes = require('./routes/category');

// Configurar la conexión con la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware para leer JSON en las peticiones
app.use(express.json());

// Middleware para manejo de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");  // Permitir peticiones desde el cliente Angular
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Permitir métodos HTTP
  next();
});

// Comprobar conexión
pool.connect()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos', err));

// Rutas
app.use('/questions', questionRoutes(pool));
app.use('/category', categoryRoutes(pool));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});




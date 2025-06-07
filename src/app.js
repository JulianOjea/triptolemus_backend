import dotenv from 'dotenv';
dotenv.config();
import { PORT } from './config.js'; 

import express from 'express';

import pkg from 'pg';
const { Pool } = pkg;

import {questionRoutes} from './routes/questions.js';
import {categoryRoutes} from './routes/category.js';
import {userRoutes} from './routes/userRoutes.js';
import {publicCategoryRoutes} from './routes/publicCategory.js';
import {publicQuestionRoutes} from './routes/publicQuestion.js';
import {fcmRoutes} from './routes/fcm.js';

import { verifyToken } from './auth.js';


const app = express();
app.use(express.json());


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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Permitir métodos HTTP

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Comprobar conexión
pool.connect()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos', err));

// Rutas
app.use('/questions', verifyToken, questionRoutes(pool));
app.use('/category', verifyToken, categoryRoutes(pool));
app.use('/users', userRoutes(pool));

app.use('/public/category', publicCategoryRoutes(pool));
app.use('/public/question', publicQuestionRoutes(pool));

app.use('/fcm', fcmRoutes(pool));


app.post("/send-notification", async (req, res) => {
  const { token, data } = req.body;

  if (!token || !data) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const message = {
    token,
    data ,
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


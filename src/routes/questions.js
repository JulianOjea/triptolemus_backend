const express = require('express');
const router = express.Router();

// Exportar el router con el pool
module.exports = (pool) => {
  // Obtener todas las preguntas
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM question');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error en el servidor');
    }
  });

  return router; // Devuelve el router
};

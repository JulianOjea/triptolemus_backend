const express = require('express');
const router = express.Router();


module.exports = (pool) => {
    // Obtener todas las categorías
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM category');
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
      }
    });

    return router; // Devuelve el router
}
import express from 'express';
const router = express.Router();

// Exportar el router con el pool
export const questionRoutes = (pool) => {
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

  // Question Post
  router.post('/', async (req, res) => {
    const { text, category_name } = req.body; // Recibimos el nombre de la categoría en lugar del id_categoria
    if (!text || !category_name) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    try {
      // Buscar el id de la categoría a partir de su nombre
      const categoriaResult = await pool.query('SELECT id FROM category WHERE name = $1', [category_name]);
      
      if (categoriaResult.rowCount === 0) {
        return res.status(400).send('La categoría no existe'); // Si no encuentra la categoría, devuelve un error
      }

      const id_categoria = categoriaResult.rows[0].id; // Obtener el id de la categoría

      // Insertar la nueva pregunta con el id de la categoría
      const result = await pool.query(
        'INSERT INTO question (text, category_id) VALUES ($1, $2) RETURNING *',
        [text, id_categoria]
      );

      res.status(201).json(result.rows[0]); // Devolvemos la pregunta creada con código 201 (creado)
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al insertar en la base de datos');
    }
  });

  return router; // Devuelve el router
};
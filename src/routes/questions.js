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
    const { text_es, text_eng, category_name, user_name } = req.body; // Recibimos el nombre de la categoría en lugar del id_categoria
    if (!text_eng || !text_es || !category_name || !user_name) {
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
        'INSERT INTO question (text_es, text_eng, category_id, user_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [text_es, text_eng, id_categoria, user_name]
      );

      res.status(201).json(result.rows[0]); // Devolvemos la pregunta creada con código 201 (creado)
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al insertar en la base de datos');
    }
  });

  // Ruta para eliminar una pregunta por ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Obtener el ID de la pregunta a eliminar

    try {
      // Realizar la consulta para eliminar la pregunta
      const result = await pool.query('DELETE FROM question WHERE id = $1 RETURNING *', [id]);
      
      // Verificar si se eliminó alguna fila
      if (result.rowCount === 0) {
        return res.status(404).send('Pregunta no encontrada'); // Si no se eliminó ninguna fila, devolver un error
      }

      res.status(200).json(result.rows[0]); // Enviar respuesta 204 No Content
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al eliminar la pregunta');
    }
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { text_es, text_eng, category_name } = req.body;

    if (!text_es || !text_eng || !category_name) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    try {
      const categoriaResult = await pool.query('SELECT id FROM category WHERE name = $1', [category_name]);
      if (categoriaResult.rowCount === 0) {
        return res.status(400).send('La categoría no existe');
      }

      const id_categoria = categoriaResult.rows[0].id;

      const result = await pool.query(
        'UPDATE question SET text_es = $1, text_eng = $2 , category_id = $3 WHERE id = $4 RETURNING *',
        [text_es, text_eng, id_categoria, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).send('Pregunta no encontrada');
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al actualizar la pregunta');
    }
  });
  
  return router; // Devuelve el router
};
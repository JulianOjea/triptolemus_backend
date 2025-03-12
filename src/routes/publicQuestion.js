import express from 'express';
const router = express.Router();

export const publicQuestionRoutes = (pool) => {
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT id, text_es, text_eng, category_id FROM question');
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
      }
    });

    return router;
}
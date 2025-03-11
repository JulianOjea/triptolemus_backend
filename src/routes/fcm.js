import express from 'express';
const router = express.Router();
import admin from "firebase-admin";
import serviceAccount from '../triptolemuspushnotifications-firebase.json' assert { type: 'json' };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

export const fcmRoutes = (pool) => {

    router.post('/save-token', async (req, res) => {
        const { token_fcm } = req.body;
      
        if (!token_fcm) {
          return res.status(400).send('No FCM token');
        }

        try {
            const result = await pool.query(
              'INSERT INTO token_fcm (token) VALUES ($1) RETURNING *',
            [token_fcm],
            );
      
            res.status(200).send('Token guardado exitosamente');
          } catch (error) {
            console.error(error);
            return res.status(500).send('Error al guardar el token');
          }
      });

    router.post('/notify-user', async (req, res) => {
        try{
            const getTokensResult = await pool.query('SELECT * FROM token_fcm;');

        if (getTokensResult.rows.length === 0) {
            return res.status(404).send('No tokens found');
        }

        const tokens = getTokensResult.rows.map(row => row.token);

        const message = {
            data: {
              download_data: 'true',
            },
            tokens: tokens,
          };

          const response = await admin.messaging().sendEachForMulticast(message);

    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    console.log(`✅ Notificaciones enviadas correctamente: ${response.successCount}`);
    if (failedTokens.length > 0) {
      console.warn('⚠️ Algunos tokens han fallado:', failedTokens);
    }

          res.status(200).send('Datos enviados a todos los usuarios');
        }catch(error){
            console.error('Error al enviar los datos:', error);
            res.status(500).send('Error al enviar los datos');
        }
    }

    )
    return router;
}
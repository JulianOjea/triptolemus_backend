import express from 'express';
const router = express.Router();
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
//import serviceAccount from '../triptolemuspushnotifications-firebase.json' assert { type: 'json' };

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

export default admin;

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
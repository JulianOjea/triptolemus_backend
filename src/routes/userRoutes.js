import express from 'express';
import { User } from '../models/user.js';

const router = express.Router();

export const userRoutes = (pool) => {

     router.post('/register', async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await User.create({ username, password }, pool);
            res.status(201).send({ user });
        } catch (error) {
            res.status(400).send(error.message);
        }
    });

    // Ruta para iniciar sesión
    router.post('/login', async (req, res) => {
        const { username, password} = req.body;
        try{
            const user = await User.login({username, password}, pool);
            res.send({user})
        }catch (error){
            res.status(401).send(error.message);
        }
    });
    //app.post('/logout', (req, res) => {});
    //app.post('/protected', (req, res) => {});

    return router;
};
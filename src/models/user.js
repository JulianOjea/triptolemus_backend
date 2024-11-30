import bcrypt from 'bcrypt';
import {z} from 'zod';
import jwt from 'jsonwebtoken';

import { SALT_ROUNDS } from '../config.js';

export class User{
    static async create({username, password}, pool){

        //using zod to validate
        Validation.validateCredentials(username, password);

        //validate username doesnt exist
        const userExists = await pool.query('SELECT * FROM user_admin WHERE user_name = $1', [username]);
        if (userExists.rowCount > 0) throw new Error('Username already exists')
        
        //bcrypt hashing
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            'INSERT INTO user_admin (user_name, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        return result.rows[0];
    }
    static async login({username, password}, pool){
        Validation.validateCredentials(username, password);

        const result = await pool.query('SELECT * FROM user_admin WHERE user_name = $1', [username]);
        if (result.rowCount === 0) throw new Error('Invalid credentials');

        const user = result.rows[0]; 

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: user.user_id, email: user.user_name },
            process.env.JWT_SECRET,           
            { expiresIn: '1h' }   
          );

        //deleting password from user
        const {password: _, ...publicUser} = user;

        return { user: publicUser, token};
    }
}

class Validation {
    static validateCredentials(username, password){
        const userSchema = z.object({
            username: z.string().min(3, { message: "username must be at least 3 characters long" }),
            password: z.string().min(6, { message: "password must be at least 6 characters long" })
        });
        try {
            userSchema.parse({ username, password });
        } catch (error) {
            throw new Error(error.errors[0].message);
        }
    }
}
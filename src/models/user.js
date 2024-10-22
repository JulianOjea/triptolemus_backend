export class User{
    static async create({username, password}, pool){
        //using zod to validate
        if (typeof username !== 'string') throw new Error('username must be a string')
        if (username.length < 3 ) throw new Error('username must be at least 3 characters long')

        if (typeof password !== 'string') throw new Error('password must be a string')
        if (password.length < 6 ) throw new Error('password must be at least 6 characters long')

        //validate username doesnt exist
        const userExists = await pool.query('SELECT * FROM user_admin WHERE user_name = $1', [username]);
        if (userExists.rowCount > 0) throw new Error('Username already exists')

        const result = await pool.query(
            'INSERT INTO user_admin (user_name, password) VALUES ($1, $2) RETURNING *',
            [username, password]
        );

        return result.rows[0];
    }
    static login({username, password}){}
}
import argon2 from 'argon2';

export class AuthService {
    constructor(private db: any) { }

    async registerUser(user_name: string, pass: string) {
        const hash = await argon2.hash(pass);
        try {
            const result = await this.db.query(
                'INSERT INTO auth (user_name, password_hash) VALUES ($1, $2) RETURNING id',
                [user_name, hash]
            );
            return result.rows[0];
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error('Username already taken');
            }
            throw err;
        }
    }

    async loginUser(user_name: string, pass: string) {
        const result = await this.db.query(
            'SELECT * FROM auth WHERE user_name = $1',
            [user_name]
        );
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = result.rows[0];
        const isValid = await argon2.verify(user.password_hash, pass);
        if (!isValid) {
            throw new Error('Invalid password');
        }
        // console.log("Signed In : ", user);
        return user;
    }

}
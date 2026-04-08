import argon2 from 'argon2';

export class AuthService {
    constructor(private db: any) { }

    async registerUser(user_name: string, pass: string, name: string, email: string, phone: string) {
        const hash = await argon2.hash(pass);
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            
            const authResult = await client.query(
                'INSERT INTO auth (user_name, password_hash) VALUES ($1, $2) RETURNING id',
                [user_name, hash]
            );
            const user_id = authResult.rows[0].id;

            await client.query(
                'INSERT INTO users (id, user_name, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
                [user_id, user_name, name, email, phone]
            );

            await client.query('COMMIT');
            return { id: user_id, user_name };
        } catch (err: any) {
            await client.query('ROLLBACK');
            if (err.code === '23505') {
                throw new Error('Username, email or phone already taken');
            }
            throw err;
        } finally {
            client.release();
        }
    }

    async loginUser(user_name: string, pass: string) {
        const result = await this.db.query(
            `SELECT a.*, u.name, u.email, u.phone, u.user_role 
             FROM auth a 
             LEFT JOIN users u ON a.id = u.id 
             WHERE a.user_name = $1`,
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
        return {
            id: user.id,
            user_name: user.user_name,
            name: user.name,
            email: user.email,
            phone: user.phone,
            user_role: user.user_role
        };
    }

    async getUserById(id: string) {
        const result = await this.db.query(
            `SELECT a.id, a.user_name, u.name, u.email, u.phone, u.user_role
             FROM auth a 
             LEFT JOIN users u ON a.id = u.id 
             WHERE a.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        
        let userOutput = result.rows[0];
        if (userOutput.user_role === 'student') {
            const studentData = await this.db.query(
                `SELECT roll_no, hostel_name, room_id FROM student WHERE student_id = $1`, [id]
            );
            if (studentData.rows.length > 0) {
                userOutput = { ...userOutput, ...studentData.rows[0] };
            }
        }
        
        return userOutput;
    }

    async updateUser(id: string, data: { name?: string, email?: string, phone?: string }) {
        const { name, email, phone } = data;
        const result = await this.db.query(
            `UPDATE users SET 
                name = COALESCE($1, name), 
                email = COALESCE($2, email), 
                phone = COALESCE($3, phone) 
             WHERE id = $4 RETURNING *`,
            [name, email, phone, id]
        );
        return result.rows[0];
    }
}
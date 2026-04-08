import { AuthService } from './auth.service.js';

export default async function authRoutes(fastify: any) {
    const service = new AuthService(fastify.db);

    fastify.post('/register', async (request: any, response: any) => {
        const { user_name, password, name, email, phone } = request.body;
        const user = await service.registerUser(user_name, password, name, email, phone);
        return response.code(201).send({ success: true, ...user, message: "User Registered Successfully" });
    });

    fastify.post('/login', async (request: any, response: any) => {
        const { user_name, password } = request.body;
        const user = await service.loginUser(user_name, password);

        // exp: 1 hour, include profile
        const payload = { 
            id: user.id, 
            user_name: user.user_name, 
            user_role: user.user_role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };
        
        const token = fastify.jwt.sign(payload);
        response.code(200)
        response.setCookie('token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 60 * 60 * 1000),
            signed: true
        });
        
        return response.send({ success: true, ...user, message: "Login Successful" });
    });

    fastify.patch('/profile', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        const { name, email, phone } = request.body;
        const updatedUser = await service.updateUser(request.user.id, { name, email, phone });
        
        return response.code(200).send({ success: true, user: updatedUser, message: "Profile Updated" });
    });

    fastify.post('/logout', async (request: any, response: any) => {
        response.clearCookie("token");
        return response.code(200).send({ success: true, message: "Logout Successful" });
    });

    fastify.get('/me', {
        onRequest: [fastify.authenticate]
    }, async (request: any, response: any) => {
        try {
            const user = await service.getUserById(request.user.id);
            return response.send(user);
        } catch (error) {
            return response.code(404).send({ success: false, message: 'User not found' });
        }
    });
}
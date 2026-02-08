import { AuthService } from './auth.service.js';

export default async function authRoutes(fastify: any) {
    const service = new AuthService(fastify.db);

    fastify.post('/register', async (request: any, response: any) => {
        const { user_name, password } = request.body;
        const user = await service.registerUser(user_name, password);
        return response.code(201).send({ success: true, ...user, message: "User Registered Successfully" });
    });

    fastify.post('/login', async (request: any, response: any) => {
        const { user_name, password } = request.body;
        const user = await service.loginUser(user_name, password);

        // exp: 1 hour
        const token = fastify.jwt.sign({ id: user.id, user_name: user.user_name, role: user.role, exp: Date.now() + 60 * 60 * 1000 });
        response.code(200)
        response.setCookie('token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 60 * 60 * 1000),
            signed: true
        });
        // console.log("Cookie set!", token);
        response.send({ success: true, ...user, message: "Login Successful" });
    });

    fastify.post('/logout', async (request: any, response: any) => {
        response.clearCookie("token");
        return response.code(200).send({ success: true, message: "Logout Successful" });
    });

    fastify.get('/me', {
        onRequest: [fastify.authenticate]
    }, async (request: any, response: any) => {
        return request.user;
    });
}
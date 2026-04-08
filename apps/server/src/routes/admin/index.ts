import { FastifyPluginAsync } from 'fastify';
import { AdminService } from './admin.service.js';

const adminRoutes: FastifyPluginAsync = async (fastify, opts) => {
    const adminService = new AdminService(fastify.db);

    fastify.get('/students', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const students = await adminService.getStudents();
            return response.code(200).send({ success: true, students });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

    fastify.post('/students/:id/verify', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        
        const { id } = request.params;
        const { roll_no, hostel_name, room_id } = request.body as { roll_no: string, hostel_name: string, room_id: string };

        if (!roll_no || !hostel_name || !room_id) {
            return response.code(400).send({ success: false, message: "Missing required fields" });
        }

        try {
            const student = await adminService.verifyStudent(id, roll_no, hostel_name, room_id);
            return response.code(200).send({ success: true, student });
        } catch (err: any) {
            fastify.log.error(err);
            if (err.code === '23505') {
                return response.code(400).send({ success: false, message: "Roll number already exists in verification" });
            }
            return response.code(500).send({ success: false, message: err.message || "Internal Server Error" });
        }
    });

    fastify.get('/hostels', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const hostels = await adminService.getHostels();
            return response.code(200).send({ success: true, hostels });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });
};

export default adminRoutes;

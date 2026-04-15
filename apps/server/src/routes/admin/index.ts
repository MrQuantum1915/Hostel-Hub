import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { AdminService } from './admin.service.js';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

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

    fastify.get('/users', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const users = await adminService.getUsers();
            return response.code(200).send({ success: true, users });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

    fastify.patch('/users/:id/role', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        const { id } = request.params;
        const { role } = request.body as { role: string };
        
        if (!['admin', 'staff', 'student'].includes(role)) {
            return response.code(400).send({ success: false, message: "Invalid role" });
        }

        try {
            const result = await adminService.updateUserRole(id, role);
            return response.code(200).send({ success: true, result });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

    fastify.get('/staff', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const staff = await adminService.getStaff();
            return response.code(200).send({ success: true, staff });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

    fastify.patch('/complaints/:id/assign', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        const { id } = request.params;
        const { staff_id } = request.body as { staff_id: string };

        if (staff_id === undefined) {
            return response.code(400).send({ success: false, message: "Missing staff_id" });
        }

        try {
            const complaint = await adminService.assignComplaint(id, staff_id);
            return response.code(200).send({ success: true, complaint });
        } catch (err: any) {
            fastify.log.error(err);
            if (err.message === "Invalid staff ID" || err.message === "Complaint not found") {
                return response.code(400).send({ success: false, message: err.message });
            }
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

    // use views
    fastify.get('/complaint-report', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const report = await adminService.getComplaintDashboard();
            return response.code(200).send({ success: true, report });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

  
    fastify.get('/mess-report', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const report = await adminService.getMessReport();
            return response.code(200).send({ success: true, report });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });

  
    fastify.get('/hostel-complaints/:hostelName', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        try {
            const { hostelName } = request.params as { hostelName: string };
            const report = await adminService.getHostelComplaintReport(hostelName);
            return response.code(200).send({ success: true, report });
        } catch (err: any) {
            fastify.log.error(err);
            return response.code(500).send({ success: false, message: "Internal Server Error" });
        }
    });
};

export default adminRoutes;

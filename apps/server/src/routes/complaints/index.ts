import { ComplaintsService } from "./complaints.service.js";

export default async function complaintRoutes(fastify: any) {
    const complaintsService = new ComplaintsService(fastify.db);

    fastify.post('/complaint', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        let { title, details, category, urgency_level, image } = request.body;
        if (!urgency_level) {
            urgency_level = 'normal';
        }
        const student_id = request.user.id;
        const complaint = await complaintsService.createComplaint(student_id, title, details, category, urgency_level, image);
        
        return response.code(201).send({ success: true, ...complaint, message: "Complaint Created Successfully" });
    });

    fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        const student_id = request.user.id;
        const complaints = await complaintsService.getComplaintsByStudent(student_id);
        return response.code(200).send({ success: true, complaints });
    });

    fastify.get('/all', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role === 'student') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        const complaints = await complaintsService.getAllComplaints();
        return response.code(200).send({ success: true, complaints });
    });

    fastify.patch('/:id/status', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role === 'student') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        const { id } = request.params;
        const { status } = request.body;
        const complaint = await complaintsService.updateComplaintStatus(id, status);
        if (!complaint) {
            return response.code(404).send({ success: false, message: "Complaint not found" });
        }
        return response.code(200).send({ success: true, ...complaint, message: "Status Updated" });
    });

    fastify.get('/image/:id', async (request: any, response: any) => {
        const { id } = request.params;
        const imageBuffer = await complaintsService.getComplaintImage(id);
        if (!imageBuffer) {
            return response.code(404).send({ success: false, message: "Image not found" });
        }
        return response.type('image/jpeg').send(imageBuffer);
    });
}
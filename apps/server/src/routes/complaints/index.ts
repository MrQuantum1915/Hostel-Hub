import { ComplaintsService } from "./complaints.service.js";

export default async function complaintRoutes(fastify: any) {
    const complaintsService = new ComplaintsService(fastify.db);

    fastify.post('/complaint', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        let { title, details, category, urgency_level, image } = request.body;
        if (!urgency_level) {
            urgency_level = 'normal';
        }
        const student_id = request.user.id;
        try {
            const complaint = await complaintsService.createComplaint(student_id, title, details, category, urgency_level, image);
            return response.code(201).send({ success: true, ...complaint, message: "Complaint Created Successfully" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
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
        const staff_id = request.user.user_role === 'staff' ? request.user.id : null;
        const complaints = await complaintsService.getAllComplaints(staff_id);
        return response.code(200).send({ success: true, complaints });
    });

    fastify.patch('/:id/status', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role === 'student') {
            return response.code(403).send({ success: false, message: "Unauthorized" });
        }
        const { id } = request.params;
        const { status } = request.body;
        const staff_id = request.user.user_role === 'staff' ? request.user.id : null;
        try {
            const complaint = await complaintsService.updateComplaintStatus(id, status, staff_id);
            if (!complaint) {
                return response.code(404).send({ success: false, message: "Complaint not found" });
            }
            return response.code(200).send({ success: true, ...complaint, message: "Status Updated" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });


    fastify.post('/:id/rate', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        const { id } = request.params;
        const { rating } = request.body;
        const student_id = request.user.id;
        try {
            const complaint = await complaintsService.rateComplaint(id, student_id, rating);
            return response.code(200).send({ success: true, ...complaint, message: "Complaint Rated" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });

    fastify.post('/:id/reopen', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        const { id } = request.params;
        const student_id = request.user.id;
        try {
            const complaint = await complaintsService.reopenComplaint(id, student_id);
            return response.code(200).send({ success: true, ...complaint, message: "Complaint Reopened" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
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
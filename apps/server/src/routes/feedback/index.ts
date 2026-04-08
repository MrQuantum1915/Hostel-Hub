import { FeedbackService } from "./feedback.service.js";

export default async function feedbackRoutes(fastify: any) {
    const feedbackService = new FeedbackService(fastify.db);

    fastify.post('/submit', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        const { rating, comments } = request.body;
        const student_id = request.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return response.code(400).send({ success: false, message: "Valid rating (1-5) is required." });
        }

        try {
            const feedback = await feedbackService.submitFeedback(student_id, rating, comments);
            return response.code(201).send({ success: true, ...feedback, message: "Feedback Submitted Successfully" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });

    fastify.get('/reports', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized: Admin only" });
        }

        try {
            const reports = await feedbackService.getFeedbackReports();
            return response.code(200).send({ success: true, reports });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });
}

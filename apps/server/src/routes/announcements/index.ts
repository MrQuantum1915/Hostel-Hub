import { AnnouncementsService } from "./announcements.service.js";

export default async function announcementRoutes(fastify: any) {
    const announcementsService = new AnnouncementsService(fastify.db);

    fastify.post('/create', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        if (request.user.user_role !== 'admin') {
            return response.code(403).send({ success: false, message: "Unauthorized: Admin only" });
        }
        
        const { title, content, announcement_type } = request.body;
        const admin_id = request.user.id;

        try {
            const announcement = await announcementsService.createAnnouncement(admin_id, title, content, announcement_type);
            return response.code(201).send({ success: true, ...announcement, message: "Announcement Published" });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });

    fastify.get('/all', { onRequest: [fastify.authenticate] }, async (request: any, response: any) => {
        try {
            const announcements = await announcementsService.getAllAnnouncements();
            return response.code(200).send({ success: true, announcements });
        } catch (err: any) {
            return response.code(400).send({ success: false, message: err.message });
        }
    });
}

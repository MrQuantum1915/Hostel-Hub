export class AnnouncementsService {
    constructor(private db: any) { }

    async createAnnouncement(admin_id: string, title: string, content: string, announcement_type: string) {
        const result = await this.db.query(
            `INSERT INTO announcements (admin_id, title, content, announcement_type) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [admin_id, title, content, announcement_type]
        );
        return result.rows[0];
    }

    async getAllAnnouncements() {
        const result = await this.db.query(
            `SELECT a.*, u.name as author_name 
             FROM announcements a
             LEFT JOIN users u ON a.admin_id = u.id
             ORDER BY posted_date DESC`
        );
        return result.rows;
    }
}

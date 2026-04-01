

export class ComplaintsService {
    constructor(private db: any) { }

    async createComplaint(student_id: string, title: string, details: string, category: string, urgency_level: string, image: string) {
        let image_id = null;

        if (image) {
            try {
                // frontend sends base64 string including data url
                const base64Data = image.split(',')[1] || image;
                const buffer = Buffer.from(base64Data, 'base64');
                const imageResult = await this.db.query(
                    'INSERT INTO complaint_images (image) VALUES ($1) RETURNING image_id',
                    [buffer]
                );
                image_id = imageResult.rows[0].image_id;
            } catch (err) {
                console.error("Error processing image:", err);
                throw new Error("Failed to process image attachment");
            }
        }

        const result = await this.db.query(
            `INSERT INTO complaints (student_id, title, details, category, urgency_level, image_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [student_id || null, title, details, category, urgency_level, image_id]
        );

        return result.rows[0];
    }

    async getComplaintsByStudent(student_id: string) {
        // fetch complaints, without fetching the raw image bytes to save bandwidth initially
        const result = await this.db.query(
            `SELECT complaint_id, title, details, category, urgency_level, status, created_at, updated_at, image_id 
             FROM complaints WHERe student_id = $1 ORDER BY created_at DESC`,
            [student_id]
        );
        return result.rows;
    }

    async getAllComplaints() {
        // including detailed student info via JOIN on student and users tables
        const result = await this.db.query(
            `SELECT c.complaint_id, c.title, c.details, c.category, c.urgency_level, c.status, c.created_at, c.updated_at, c.image_id, 
                    u.name as student_name, u.email as student_email, u.phone as student_phone,
                    s.roll_no, s.hostel_name, s.room_id
             FROM complaints c
             LEFT JOIN student s ON c.student_id = s.student_id
             LEFT JOIN users u ON c.student_id = u.id
             ORDER BY c.created_at DESC`
        );
        return result.rows;
    }

    async getComplaintImage(image_id: string) {
        const result = await this.db.query(
            'SELECT image FROM complaint_images WHERE image_id = $1',
            [image_id]
        );
        return result.rows[0]?.image || null;
    }

    async updateComplaintStatus(complaint_id: string, status: string) {
        const result = await this.db.query(
            `UPDATE complaints SET status = $1, updated_at = current_timestamp WHERE complaint_id = $2 RETURNING *`,
            [status, complaint_id]
        );
        if (result.rowCount === 0) return null;
        return result.rows[0];
    }
}
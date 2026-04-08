

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

        try {
            const result = await this.db.query(
                `INSERT INTO complaints (student_id, title, details, category, urgency_level, image_id) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [student_id || null, title, details, category, urgency_level, image_id]
            );

            return result.rows[0];
        } catch (err: any) {
            if (err.code === '23503') { // PostgreSQL foreign key violation
                throw new Error("Only verified students can submit complaints. Ensure you have a valid Roll Number.");
            }
            throw err;
        }
    }

    async getComplaintsByStudent(student_id: string) {
        // fetch complaints, without fetching the raw image bytes to save bandwidth initially
        const result = await this.db.query(
            `SELECT complaint_id, title, details, category, urgency_level, status, created_at, updated_at, image_id, rating 
             FROM complaints WHERE student_id = $1 ORDER BY created_at DESC`,
            [student_id]
        );
        return result.rows;
    }

    async getAllComplaints(staff_id?: string) {
        let query = `SELECT c.complaint_id, c.title, c.details, c.category, c.urgency_level, c.status, c.created_at, c.updated_at, c.image_id, c.rating,
                    u.name as student_name, u.email as student_email, u.phone as student_phone,
                    s.roll_no, s.hostel_name, s.room_id
             FROM complaints c
             LEFT JOIN student s ON c.student_id = s.student_id
             LEFT JOIN users u ON c.student_id = u.id`;
        
        let params: any[] = [];
        if (staff_id) {
            query += ` WHERE c.assigned_staff_id = $1`;
            params.push(staff_id);
        }
        
        query += ` ORDER BY c.created_at DESC`;
        
        const result = await this.db.query(query, params);
        return result.rows;
    }

    async getComplaintImage(image_id: string) {
        const result = await this.db.query(
            'SELECT image FROM complaint_images WHERE image_id = $1',
            [image_id]
        );
        return result.rows[0]?.image || null;
    }

    async updateComplaintStatus(complaint_id: string, status: string, staff_id?: string) {
        const result = await this.db.query(
            `UPDATE complaints SET status = $1, assigned_staff_id = COALESCE($2, assigned_staff_id), updated_at = current_timestamp WHERE complaint_id = $3 RETURNING *`,
            [status, staff_id || null, complaint_id]
        );
        if (result.rowCount === 0) return null;
        return result.rows[0];
    }

    async rateComplaint(complaint_id: string, student_id: string, rating: number) {
        const result = await this.db.query(
            `UPDATE complaints SET rating = $1 WHERE complaint_id = $2 AND student_id = $3 RETURNING *`,
            [rating, complaint_id, student_id]
        );
        if (result.rowCount === 0) throw new Error("Complaint not found or unauthorized");
        return result.rows[0];
    }

    async reopenComplaint(complaint_id: string, student_id: string) {
        const result = await this.db.query(
            `UPDATE complaints SET status = 'pending', updated_at = current_timestamp WHERE complaint_id = $1 AND student_id = $2 AND status = 'resolved' RETURNING *`,
            [complaint_id, student_id]
        );
        if (result.rowCount === 0) throw new Error("Complaint not found or cannot be reopened");
        return result.rows[0];
    }
}
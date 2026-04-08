export class FeedbackService {
    constructor(private db: any) { }

    async submitFeedback(student_id: string, rating: number, comments: string) {
        // Check if feedback already exists for today
        const existingResult = await this.db.query(
            `SELECT * FROM mess_feedback 
             WHERE student_id = $1 AND date_trunc('day', created_at) = date_trunc('day', current_timestamp)`,
            [student_id]
        );

        if (existingResult.rowCount > 0) {
            throw new Error("You have already submitted feedback for today.");
        }

        const result = await this.db.query(
            `INSERT INTO mess_feedback (student_id, rating, comments) 
             VALUES ($1, $2, $3) RETURNING *`,
            [student_id, rating, comments]
        );
        return result.rows[0];
    }

    async getFeedbackReports() {
        const statsResult = await this.db.query(
            `SELECT 
                COUNT(*) as total_feedback,
                AVG(rating)::numeric(10,2) as average_rating
             FROM mess_feedback`
        );

        const recentFeedback = await this.db.query(
            `SELECT f.*, u.name as student_name 
             FROM mess_feedback f
             LEFT JOIN users u ON f.student_id = u.id
             ORDER BY created_at DESC
             LIMIT 50`
        );

        const dailyStats = await this.db.query(
            `SELECT 
                date_trunc('day', created_at) as date,
                AVG(rating)::numeric(10,2) as avg_rating,
                COUNT(*) as count
             FROM mess_feedback
             GROUP BY date_trunc('day', created_at)
             ORDER BY date DESC
             LIMIT 7`
        );

        return {
            summary: statsResult.rows[0],
            recent: recentFeedback.rows,
            dailyTrends: dailyStats.rows
        };
    }
}

export class FeedbackService {
    constructor(private db: any) { }

    async submitFeedback(student_id: string, rating: number, comments: string) {
        
        try {
            const result = await this.db.query(
                `INSERT INTO mess_feedback (student_id, rating, comments) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [student_id, rating, comments]
            );
            return result.rows[0];
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error("You have already submitted feedback for today.");
            }
            if (err.code === '23514') {
                throw new Error("Rating must be between 1 and 5.");
            }
            if (err.code === '23503') {
                throw new Error("Only verified students can submit feedback.");
            }
            throw err;
        }
    }

    async checkAlreadySubmittedToday(student_id: string): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM mess_feedback 
             WHERE student_id = $1 AND created_at::date = current_date`,
            [student_id]
        );
        return result.rowCount > 0;
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
             ORDER BY f.created_at DESC
             LIMIT 50`
        );

        let dailyRows: any[] = [];
        try {
            const dailyStats = await this.db.query(
                `SELECT * FROM v_daily_mess_report LIMIT 7`
            );
            dailyRows = dailyStats.rows;
        } catch {
            const fallback = await this.db.query(
                `SELECT 
                    created_at::date AS date,
                    COUNT(*) AS count,
                    AVG(rating)::numeric(10,2) AS avg_rating
                 FROM mess_feedback
                 GROUP BY created_at::date
                 ORDER BY date DESC
                 LIMIT 7`
            );
            dailyRows = fallback.rows;
        }

        return {
            summary: statsResult.rows[0],
            recent: recentFeedback.rows,
            dailyTrends: dailyRows
        };
    }
}

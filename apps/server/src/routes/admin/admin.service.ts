export class AdminService {
    constructor(private db: any) { }

    async getStudents() {
        const result = await this.db.query(
            `SELECT u.id, u.user_name, u.name, u.email, u.phone, 
                    s.roll_no, s.hostel_name, s.room_id
             FROM users u
             LEFT JOIN student s ON u.id = s.student_id
             WHERE u.user_role = 'student'
             ORDER BY u.name ASC`
        );
        return result.rows;
    }

    async verifyStudent(student_id: string, roll_no: string, hostel_name: string, room_id: string) {
        // Only insert if doesn't exist to prevent PK collision
        const check = await this.db.query('SELECT student_id FROM student WHERE student_id = $1', [student_id]);
        if (check.rows.length > 0) {
            throw new Error("Student is already verified.");
        }

        const result = await this.db.query(
            `INSERT INTO student (student_id, roll_no, hostel_name, room_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [student_id, roll_no, hostel_name, room_id]
        );
        return result.rows[0];
    }

    async getHostels() {
        const hostelRes = await this.db.query(`SELECT hostel_id, hostel_name, capacity FROM hostels`);
        const roomRes = await this.db.query(`SELECT room_id, hostel_name, room_number, room_capacity, status FROM rooms`);
        
        const hostels = hostelRes.rows.map((h: any) => {
            return {
                ...h,
                rooms: roomRes.rows.filter((r: any) => r.hostel_name === h.hostel_name)
            };
        });

        return hostels;
    }
}

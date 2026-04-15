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

    async getUsers() {
        const result = await this.db.query(
            `SELECT id, user_name, name, email, phone, user_role FROM users ORDER BY name ASC`
        );
        return result.rows;
    }

    async updateUserRole(user_id: string, role: string) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            
            await client.query('UPDATE users SET user_role = $1 WHERE id = $2', [role, user_id]);
            
            if (role === 'admin') {
                await client.query('INSERT INTO admin (admin_id) VALUES ($1) ON CONFLICT DO NOTHING', [user_id]);
                await client.query('DELETE FROM maintenance_staff WHERE staff_id = $1', [user_id]);
            } else if (role === 'staff') {
                await client.query('INSERT INTO maintenance_staff (staff_id, designation) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user_id, 'General']);
                await client.query('DELETE FROM admin WHERE admin_id = $1', [user_id]);
            } else if (role === 'student') {
                await client.query('DELETE FROM admin WHERE admin_id = $1', [user_id]);
                await client.query('DELETE FROM maintenance_staff WHERE staff_id = $1', [user_id]);
            }
            
            await client.query('COMMIT');
            return { id: user_id, role };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getStaff() {
        const result = await this.db.query(
            `SELECT u.id, u.name, u.email, m.designation 
             FROM users u 
             JOIN maintenance_staff m ON u.id = m.staff_id`
        );
        return result.rows;
    }

    async assignComplaint(complaint_id: string, staff_id: string) {
        if (staff_id) {
            const check = await this.db.query('SELECT staff_id FROM maintenance_staff WHERE staff_id = $1', [staff_id]);
            if (check.rows.length === 0) {
                throw new Error("Invalid staff ID");
            }
        }
        
        const result = await this.db.query(
            `UPDATE complaints SET assigned_staff_id = $1 WHERE complaint_id = $2 RETURNING *`,
            [staff_id || null, complaint_id]
        );
        if (result.rowCount === 0) throw new Error("Complaint not found");
        return result.rows[0];
    }

    // use views
    async getComplaintDashboard() {
        const result = await this.db.query(`SELECT * FROM v_complaint_dashboard`);
        return result.rows;
    }

    async getMessReport() {
        const result = await this.db.query(`SELECT * FROM v_daily_mess_report LIMIT 30`);
        return result.rows;
    }

    async getHostelComplaintReport(hostelName: string) {
        const result = await this.db.query(
            `SELECT * FROM get_hostel_complaint_report($1)`,
            [hostelName]
        );
        return result.rows;
    }
}

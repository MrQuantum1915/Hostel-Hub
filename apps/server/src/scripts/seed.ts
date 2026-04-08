import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import argon2 from 'argon2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple manual .env loading for the seed script
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["'](.+)["']$/, '$1');
        }
    });
}

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/hostel_db"
});

async function seed() {
    const passwordHash = await argon2.hash('password123');
    const client = await pool.connect();

    try {
        console.log("Cleaning database...");
        await client.query('TRUNCATE auth, users, hostels, rooms CASCADE');

        console.log("Seeding Hostels...");
        const hostels = await client.query(`
            INSERT INTO hostels (hostel_name, location, capacity) VALUES 
            ('Aryabhatta Bhavan', 'North Campus', 500),
            ('Savitribai Phule Hall', 'South Campus', 400),
            ('Bhaskara Residency', 'East Campus', 300)
            RETURNING *
        `);

        console.log("Seeding Rooms...");
        let roomIds: string[] = [];
        for (let h_idx = 0; h_idx < hostels.rows.length; h_idx++) {
            const hostel = hostels.rows[h_idx];
            const blockNames = ['A', 'B', 'C'];
            const blockName = blockNames[h_idx];
            
            for (let i = 1; i <= 10; i++) {
                const room_number = `${blockName}${100 + i}`;
                // randomize capacity 1, 2, 3
                const capacity = Math.floor(Math.random() * 3) + 1;
                // randomize status
                const statuses = ['available', 'available', 'available', 'full', 'maintenance'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                const res = await client.query(`
                    INSERT INTO rooms (hostel_name, room_number, room_capacity, status) VALUES ($1, $2, $3, $4) RETURNING room_id`,
                    [hostel.hostel_name, room_number, capacity, status]
                );
                roomIds.push(res.rows[0].room_id);
            }
        }

        console.log("Seeding Users...");

        const usersData = [
            { user_name: 'admin_darshan', name: 'Darshan Sharma', email: 'darshan.admin@hostelhub.edu', role: 'admin', phone: '9876543210' },
            { user_name: 'staff_amit', name: 'Amit Kumar', email: 'amit.maintenance@hostelhub.edu', role: 'staff', phone: '9876543211', designation: 'Electrician' },
            { user_name: 'staff_rajesh', name: 'Rajesh Singh', email: 'rajesh.plumber@hostelhub.edu', role: 'staff', phone: '9876543212', designation: 'Plumber' },
            { user_name: 'staff_sunil', name: 'Sunil Yadav', email: 'sunil.carpenter@hostelhub.edu', role: 'staff', phone: '9876543219', designation: 'Carpenter' },
            { user_name: 'student_rahul', name: 'Rahul Verma', email: 'rahul.verma@student.edu', role: 'student', phone: '9123456701', roll: '2023CS01', hostel: 'Aryabhatta Bhavan' },
            { user_name: 'student_priya', name: 'Priya Iyer', email: 'priya.iyer@student.edu', role: 'student', phone: '9123456702', roll: '2023EE05', hostel: 'Savitribai Phule Hall' },
            { user_name: 'student_aniket', name: 'Aniket Gupta', email: 'aniket.gupta@student.edu', role: 'student', phone: '9123456703', roll: '2023ME12', hostel: 'Bhaskara Residency' },
            { user_name: 'student_sneha', name: 'Sneha Patel', email: 'sneha.patel@student.edu', role: 'student', phone: '9123456704', roll: '2023CE08', hostel: 'Savitribai Phule Hall' },
            { user_name: 'student_vikram', name: 'Vikram Singh', email: 'vikram.singh@student.edu', role: 'student', phone: '9123456705', roll: '2023IT15', hostel: 'Aryabhatta Bhavan' },
            { user_name: 'student_neha', name: 'Neha Sharma', email: 'neha.sharma@student.edu', role: 'student', phone: '9123456706', roll: '2023EC22', hostel: 'Savitribai Phule Hall' },
            { user_name: 'student_rohit', name: 'Rohit Desai', email: 'rohit.desai@student.edu', role: 'student', phone: '9123456707', roll: '2023CH09', hostel: 'Bhaskara Residency' },
            { user_name: 'student_kavya', name: 'Kavya Reddy', email: 'kavya.reddy@student.edu', role: 'student', phone: '9123456708', roll: '2023BT04', hostel: 'Savitribai Phule Hall' },
            { user_name: 'student_arjun', name: 'Arjun Menon', email: 'arjun.menon@student.edu', role: 'student', phone: '9123456709', roll: '2023AE11', hostel: 'Aryabhatta Bhavan' },
            { user_name: 'student_divya', name: 'Divya Nair', email: 'divya.nair@student.edu', role: 'student', phone: '9123456710', roll: '2023MT18', hostel: 'Bhaskara Residency' }
        ];

        for (const u of usersData) {
            const authRes = await client.query(
                'INSERT INTO auth (user_name, password_hash) VALUES ($1, $2) RETURNING id',
                [u.user_name, passwordHash]
            );
            const userId = authRes.rows[0].id;

            await client.query(
                'INSERT INTO users (id, user_name, name, email, user_role, phone) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, u.user_name, u.name, u.email, u.role, u.phone]
            );

            if (u.role === 'staff') {
                await client.query('INSERT INTO maintenance_staff (staff_id, designation) VALUES ($1, $2)', [userId, u.designation]);
            } else if (u.role === 'student') {
                await client.query(
                    'INSERT INTO student (student_id, roll_no, hostel_name, room_id) VALUES ($1, $2, $3, $4)',
                    [userId, u.roll, u.hostel, roomIds[Math.floor(Math.random() * roomIds.length)]]
                );
            } else if (u.role === 'admin') {
                await client.query('INSERT INTO admin (admin_id) VALUES ($1)', [userId]);
            }
        }

        console.log("Seeding Announcements...");
        const adminId = (await client.query("SELECT id FROM users WHERE user_role = 'admin' LIMIT 1")).rows[0].id;
        await client.query(`
            INSERT INTO announcements (admin_id, title, content, announcement_type) VALUES 
            ($1, 'Water Shutdown Notice', 'Scheduled maintenance of water tanks on Sunday from 10 AM to 2 PM.', 'Maintenance'),
            ($1, 'Holi Celebration', 'Join us for the Holi celebration in the central courtyard this Thursday.', 'Event'),
            ($1, 'Mess Timing Change', 'Dinner timings will be extended by 30 minutes during exams.', 'Mess Notice')
        `, [adminId]);

        console.log("Seeding Feedback...");
        const studentIds = (await client.query("SELECT student_id FROM student")).rows.map((s: any) => s.student_id);
        for (const sid of studentIds) {
            await client.query(`
                INSERT INTO mess_feedback (student_id, rating, comments) VALUES 
                ($1, $2, $3)
            `, [sid, 4, 'Better than last week, loved the paneer today.']);
        }

        console.log("Seeding Complaints...");
        const staffIds = (await client.query("SELECT staff_id FROM maintenance_staff")).rows.map((s: any) => s.staff_id);
        await client.query(`
            INSERT INTO complaints (student_id, title, details, category, urgency_level, status, assigned_staff_id) VALUES 
            ($1, 'Leaking Tap', 'The tap in the common washroom is leaking continuously.', 'Plumbing', 'normal', 'pending', $2),
            ($3, 'Fan not working', 'My room fan is making weird noise and stopped spinning.', 'Electrical', 'high', 'in progress', $4),
            ($1, 'No Internet', 'WiFi is down since morning.', 'Other', 'normal', 'resolved', $2)
        `, [studentIds[0], staffIds[1], studentIds[1], staffIds[0]]);

        console.log("Seed successful!");
    } catch (err) {
        console.error("Seed failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();

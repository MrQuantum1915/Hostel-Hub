import assert from 'node:assert';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
import { AuthService } from '../apps/server/src/routes/auth/auth.service.js';
import { ComplaintsService } from '../apps/server/src/routes/complaints/complaints.service.js';

async function testAuthService() {
    console.log("Testing AuthService...");

    let queries: any[] = [];
    const mockDb = {
        query: async (sql: string, params: any[]) => {
            queries.push({ sql, params });
            if (sql.includes('SELECT') && sql.includes('auth')) {
                return { rows: [{ id: '1', user_name: 'testuser', password_hash: 'mock_hash', user_role: 'student', name: 'Test User', email: 'test@example.com', phone: '1234567890' }] };
            }
            if (sql.includes('SELECT') && sql.includes('users')) {
                return { rows: [{ id: '1', name: 'Test User', email: 'test@example.com', phone: '1234567890', user_role: 'student' }] };
            }
            if (sql.includes('UPDATE')) {
                return { rows: [{ id: '1', name: 'Updated User' }], rowCount: 1 };
            }
            return { rows: [], rowCount: 0 };
        },
        connect: async () => ({
            query: async (sql: string, params: any[]) => {
                queries.push({ sql, params });
                return { rows: [{ id: '1' }] };
            },
            release: () => {}
        })
    };

    const authService = new AuthService(mockDb);

    // Test getUserById
    const user = await authService.getUserById('1');
    assert.strictEqual(user.user_name, 'testuser');
    assert.strictEqual(user.name, 'Test User');

    // Test updateUser
    const updated = await authService.updateUser('1', { name: 'Updated User' });
    assert.strictEqual(updated.name, 'Updated User');
    assert.ok(queries.some(q => q.sql.includes('UPDATE users')));

    console.log(`${GREEN}AuthService tests passed!${RESET}`);
}

async function testComplaintsService() {
    console.log("Testing ComplaintsService...");

    let queries: any[] = [];
    const mockDb = {
        query: async (sql: string, params: any[]) => {
            queries.push({ sql, params });
            if (sql.includes('INSERT INTO complaints')) {
                return { rows: [{ complaint_id: 'c1', title: 'Test' }] };
            }
            if (sql.includes('INSERT INTO complaint_images')) {
                return { rows: [{ image_id: 'i1' }] };
            }
            return { rows: [] };
        }
    };

    const complaintsService = new ComplaintsService(mockDb);

    // Test createComplaint
    const complaint = await complaintsService.createComplaint('s1', 'Title', 'Details', 'Category', 'normal', '');
    assert.strictEqual(complaint.complaint_id, 'c1');
    assert.ok(queries.some(q => q.sql.includes('INSERT INTO complaints')));

    // Test createComplaint with image
    queries = [];
    const complaintWithImg = await complaintsService.createComplaint('s1', 'Title', 'Details', 'Category', 'normal', 'data:image/png;base64,AAAA');
    assert.ok(queries.some(q => q.sql.includes('INSERT INTO complaint_images')));
    assert.ok(queries.some(q => q.sql.includes('INSERT INTO complaints')));

    console.log(`${GREEN}ComplaintsService tests passed!${RESET}`);
}

import { AdminService } from '../apps/server/src/routes/admin/admin.service.js';

async function testAdminService() {
    console.log("Testing AdminService...");

    let queries: any[] = [];
    const mockDb = {
        query: async (sql: string, params: any[]) => {
            queries.push({ sql, params });
            if (sql.includes('SELECT u.id, u.user_name')) {
                return { rows: [{ id: 'u1', user_name: 'teststudent', roll_no: null }] };
            }
            if (sql.includes('SELECT student_id FROM student')) {
                // mock unverified check
                if (params && params[0] === 'mock_unverified') return { rows: [] };
                if (params && params[0] === 'mock_verified') return { rows: [{ student_id: 'mock_verified' }] };
            }
            if (sql.includes('INSERT INTO student')) {
                return { rows: [{ student_id: params[0], roll_no: params[1], hostel_name: params[2], room_id: params[3] }] };
            }
            return { rows: [] };
        }
    };

    const adminService = new AdminService(mockDb);

    // Test getStudents
    const students = await adminService.getStudents();
    assert.strictEqual(students.length, 1);
    assert.strictEqual(students[0].id, 'u1');

    // Test verifyStudent
    const newStudent = await adminService.verifyStudent('mock_unverified', 'R101', 'HostelA', 'room1');
    assert.strictEqual(newStudent.roll_no, 'R101');
    assert.ok(queries.some(q => q.sql.includes('INSERT INTO student')));

    // Test already verified student
    let caught = false;
    try {
        await adminService.verifyStudent('mock_verified', 'R102', 'HostelA', 'room2');
    } catch (err: any) {
        caught = true;
        assert.strictEqual(err.message, "Student is already verified.");
    }
    assert.ok(caught);

    console.log(`${GREEN}AdminService tests passed!${RESET}`);
}

async function runWhiteBox() {
    try {
        await testAuthService();
        await testComplaintsService();
        await testAdminService();
    } catch (err) {
        console.error(`${RED}WhiteBox Test Failed:${RESET}`);
        console.error(err);
        process.exit(1);
    }
}

await runWhiteBox();

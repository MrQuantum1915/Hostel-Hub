import assert from 'node:assert';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

const BASE_URL = 'http://localhost:3000';
const RANDOM_USER = `testuser_${Math.floor(Math.random() * 10000)}`;

async function runBlackBox() {
    console.log("Testing BlackBox (API Integration)...");

    let cookies = '';

    // Helper: fetch with cookie support
    async function fetchWithAuth(url: string, options: any = {}) {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Cookie': cookies
        };
        const response = await fetch(`${BASE_URL}${url}`, options);
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            cookies = setCookie.split(';')[0];
        }
        return response;
    }

    try {
        // Registration
        console.log(`- Registering ${RANDOM_USER}...`);
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_name: RANDOM_USER,
                password: 'password123',
                name: 'Test BlackBox',
                email: `${RANDOM_USER}@example.com`,
                phone: '1234567890'
            })
        });
        assert.strictEqual(registerRes.status, 201);
        console.log(`    ${GREEN}SUCCESS: Registration passed.${RESET}`);

        // Login
        console.log("- Logging in...");
        const loginRes = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ user_name: RANDOM_USER, password: 'password123' })
        });
        assert.strictEqual(loginRes.status, 200);
        assert.ok(cookies.includes('token'), "Token cookie should be set.");
        console.log(`    ${GREEN}SUCCESS: Login passed.${RESET}`);

        // Profile session check
        console.log("- Verifying session...");
        const meRes = await fetchWithAuth('/auth/me');
        assert.strictEqual(meRes.status, 200);
        const user = await meRes.json();
        assert.strictEqual(user.user_name, RANDOM_USER);
        console.log(`    ${GREEN}SUCCESS: Me endpoint passed.${RESET}`);

        // Update Profile
        console.log("  - Updating profile...");
        const updateRes = await fetchWithAuth('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({ name: 'Updated BlackBox' })
        });
        assert.strictEqual(updateRes.status, 200);
        console.log(`    ${GREEN}SUCCESS: Profile update passed.${RESET}`);

        // Complaint submission (Expected failure for unverified student)
        console.log("- Submitting complaint...");
        const complaintRes = await fetchWithAuth('/complaints/complaint', {
            method: 'POST',
            body: JSON.stringify({
                title: 'No water in Block A',
                details: 'Testing the blackbox system.',
                category: 'Plumbing',
                urgency_level: 'normal'
            })
        });
        assert.strictEqual(complaintRes.status, 400); // Because foreign key violation handled properly
        const complaint = await complaintRes.json();
        assert.ok(!complaint.success);
        console.log(`    ${GREEN}SUCCESS: Complaint rejection passed (Unverified Student).${RESET}`);

        // Admin Workflow Test
        console.log("  - Logging in as Admin...");
        const adminLoginRes = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ user_name: 'admin_darshan', password: 'password123' })
        });
        assert.strictEqual(adminLoginRes.status, 200);
        console.log(`    ${GREEN}SUCCESS: Admin Login passed.${RESET}`);

        // Admin: Fetch unverified students
        console.log("- Admin: Fetching unverified students...");
        const studentsRes = await fetchWithAuth('/admin/students');
        assert.strictEqual(studentsRes.status, 200);
        let studentsData = await studentsRes.json();
        const unverifiedStudent = studentsData.students.find((s: any) => s.user_name === RANDOM_USER);
        assert.ok(unverifiedStudent, "Unverified student should be listed");
        console.log(`    ${GREEN}SUCCESS: Fetching students passed.${RESET}`);

        // Admin: Student verification
        console.log("- Admin: Verifying student...");
        const hostelsRes = await fetchWithAuth('/admin/hostels');
        const hostelsData = await hostelsRes.json();
        const validRoomId = hostelsData.hostels[0].rooms[0].room_id;

        const verifyResReal = await fetchWithAuth(`/admin/students/${unverifiedStudent.id}/verify`, {
            method: 'POST',
            body: JSON.stringify({
                roll_no: 'BB_' + Math.floor(Math.random() * 10000),
                hostel_name: hostelsData.hostels[0].hostel_name,
                room_id: validRoomId
            })
        });
        assert.strictEqual(verifyResReal.status, 200);
        console.log(`    ${GREEN}SUCCESS: Student verification passed.${RESET}`);

        console.log(`${GREEN}BlackBox tests passed!${RESET}`);
    } catch (err) {
        console.error(`${RED}BlackBox Test Failed:${RESET}`);
        console.error(err);
        process.exit(1);
    }
}

await runBlackBox();

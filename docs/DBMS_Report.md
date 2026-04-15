# Hostel-Hub: DBMS Concepts & Technical Report

> **Course**: Database Management Systems  
> **Project**: Hostel Management System (Hostel-Hub)  
> **Tech Stack**: PostgreSQL 18 · Node.js (Fastify) · React · Docker  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [ER Model & Schema Design](#2-er-model--schema-design)
3. [Normalization Analysis](#3-normalization-analysis)
4. [Referential Integrity & CASCADE Behavior](#4-referential-integrity--cascade-behavior)
5. [Domain Integrity — CHECK Constraints](#5-domain-integrity--check-constraints)
6. [Indexing Strategy](#6-indexing-strategy)
7. [Views (Logical Data Independence)](#7-views-logical-data-independence)
8. [Stored Procedures & Functions (PL/pgSQL)](#8-stored-procedures--functions-plpgsql)
9. [Triggers (DML Event Automation)](#9-triggers-dml-event-automation)
10. [Transaction Management & ACID Properties](#10-transaction-management--acid-properties)
11. [Concurrency Control — MVCC & Functional Indexes](#11-concurrency-control--mvcc--functional-indexes)
12. [Architectural Decisions](#12-architectural-decisions)
13. [Summary of DBMS Concepts Used](#13-summary-of-dbms-concepts-used)

---

## 1. System Overview

Hostel-Hub is a hostel management system with three actors:

| Actor | Capabilities |
|-------|-------------|
| **Student** | Register complaints (with image), reopen complaints, rate resolved complaints, submit daily mess feedback, view announcements |
| **Admin** | Verify students, create announcements, view aggregated reports (complaint dashboard, mess feedback trends, hostel-level reports) |
| **Maintenance Staff** | View assigned complaints, update complaint status (pending → in progress → resolved) |

### Core Modules
1. **Authentication** — JWT + signed cookies, argon2 password hashing
2. **Complaint & Maintenance Management** — Full lifecycle with image support
3. **Hostel Announcements & Notices** — Admin-published, categorized notices
4. **Mess Feedback & Meal Reporting** — Daily feedback with aggregate analytics

---

## 2. ER Model & Schema Design

### 2.1 Entities and Their Attributes

| Entity | Primary Key | Key Attributes |
|--------|-------------|----------------|
| `auth` | `id` (UUIDv7) | user_name (UNIQUE), password_hash, timestamps |
| `users` | `id` (FK → auth) | name, email (UNIQUE), user_role, phone |
| `admin` | `admin_id` (FK → users) | — |
| `student` | `student_id` (FK → users) | roll_no (UNIQUE), hostel_name (FK), room_id (FK) |
| `maintenance_staff` | `staff_id` (FK → users) | designation |
| `hostels` | `hostel_id` (UUIDv7) | hostel_name (UNIQUE), location, capacity |
| `rooms` | `room_id` (UUIDv7) | hostel_name (FK), room_number, room_capacity, status |
| `complaints` | `complaint_id` (UUIDv7) | student_id (FK), title, details, category, urgency_level, status, image_id (FK), assigned_staff_id (FK), rating, timestamps |
| `complaint_images` | `image_id` (UUIDv7) | image (BYTEA) |
| `announcements` | `announcement_id` (UUIDv7) | admin_id (FK), title, content, type, posted_date |
| `mess_feedback` | `feedback_id` (UUIDv7) | student_id (FK), rating, comments, created_at |

### 2.2 Relationships

```
auth ──────── 1:1 ──────── users
users ─────── 1:1 ──────── admin           (ISA / Specialization)
users ─────── 1:1 ──────── student          (ISA / Specialization)
users ─────── 1:1 ──────── maintenance_staff (ISA / Specialization)
hostels ───── 1:N ──────── rooms
hostels ───── 1:N ──────── student          (hostel_name FK)
rooms ─────── 1:N ──────── student          (room_id FK)
student ───── 1:N ──────── complaints
student ───── 1:N ──────── mess_feedback
maintenance_staff ── 1:N ── complaints      (assigned_staff_id)
admin ─────── 1:N ──────── announcements
complaint_images ── 1:1 ── complaints       (image_id FK)
```

### 2.3 Schema Design Pattern: ISA Hierarchy (Specialization)

The `users` table is the **supertype**. The subtypes are `admin`, `student`, and `maintenance_staff`. Each subtype table uses the `users.id` as its own primary key with a foreign key reference. This is the **table-per-subclass** inheritance pattern.

**Why this pattern?**
- Shared attributes (name, email, phone) live in one place (no redundancy).
- Subtype-specific attributes (roll_no, designation) are isolated.
- The `user_role` column in `users` acts as a **discriminator**.

---

## 3. Normalization Analysis

### 3.1 First Normal Form (1NF)
✅ All tables satisfy 1NF:
- Every column contains atomic (indivisible) values.
- No repeating groups or arrays.
- Each row is uniquely identified by a primary key.

### 3.2 Second Normal Form (2NF)
✅ All tables satisfy 2NF:
- Every table has a single-column primary key (UUID).
- Therefore, there are no partial dependencies (partial dependency can only occur with composite keys).

### 3.3 Third Normal Form (3NF)
✅ All tables satisfy 3NF — no transitive dependencies:

| Table | Analysis |
|-------|----------|
| `users` | All non-key attributes (name, email, phone, user_role) depend directly on `id`, not on each other. |
| `complaints` | `title`, `details`, `category` etc. all depend on `complaint_id`, not on `student_id`. The `student_id` is a FK, not a determinant for other columns. |
| `rooms` | `room_number`, `room_capacity`, `status` depend on `room_id`. `hostel_name` is a FK for the relationship, not a transitive path. |
| `mess_feedback` | `rating`, `comments` depend on `feedback_id`. `student_id` is FK only. |

### 3.4 BCNF (Boyce-Codd Normal Form)
✅ All tables are in BCNF because:
- For every functional dependency X → Y, X is a superkey.
- No non-trivial FD where the left side is not a candidate key.

**Example for `complaints` table**:
- `complaint_id → {title, details, category, urgency_level, status, ...}` ✅ (complaint_id is PK)
- No other FD exists that could violate BCNF.

---

## 4. Referential Integrity & CASCADE Behavior

### 4.1 Foreign Key Constraints

Every relationship is enforced via Foreign Key constraints at the DDL level:

```sql
-- Student references both users (id) and hostels (hostel_name)
student_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
hostel_name text NOT NULL REFERENCES hostels(hostel_name) ON DELETE CASCADE
room_id uuid REFERENCES rooms(room_id) ON DELETE SET NULL
```

### 4.2 CASCADE Strategy

| Relationship | ON DELETE | Rationale |
|-------------|-----------|-----------|
| `auth → users` | CASCADE | Deleting auth record should remove user profile |
| `users → student/admin/staff` | CASCADE | Subtype row has no meaning without the supertype |
| `hostels → rooms` | CASCADE | Rooms belong to a hostel; if hostel is removed, its rooms go too |
| `hostels → student` | CASCADE | Student is tied to a hostel |
| `rooms → student` | SET NULL | If a room is deleted, student isn't deleted, just unassigned |
| `student → complaints` | SET NULL | Complaints are historical records; preserved even if student leaves |
| `admin → announcements` | SET NULL | Announcements persist even if admin account is removed |
| `complaint_images → complaints` | SET NULL | If image is removed, complaint still exists |

### 4.3 Why These Choices Matter

- **CASCADE** is used for strong ownership (parent controls child lifecycle).
- **SET NULL** is used for weak associations where history must be preserved.
- This prevents **dangling references** (orphan data) while maintaining **historical integrity**.

---

## 5. Domain Integrity — CHECK Constraints

CHECK constraints enforce that column values fall within a valid domain. This is enforced at the **database level**, not the application level — meaning no buggy code can ever insert invalid data.

```sql
-- Status lifecycle: only these three states are valid
ALTER TABLE complaints ADD CONSTRAINT chk_complaint_status
  CHECK (status IN ('pending', 'in progress', 'resolved'));

-- Urgency levels
ALTER TABLE complaints ADD CONSTRAINT chk_urgency
  CHECK (urgency_level IN ('low', 'normal', 'high', 'critical'));

-- Rating scale: 1 to 5
ALTER TABLE mess_feedback ADD CONSTRAINT chk_rating
  CHECK (rating BETWEEN 1 AND 5);

-- User roles: discriminator column restricted
ALTER TABLE users ADD CONSTRAINT chk_user_role
  CHECK (user_role IN ('student', 'admin', 'staff'));

-- Room status
ALTER TABLE rooms ADD CONSTRAINT chk_room_status
  CHECK (status IN ('available', 'full', 'maintenance'));
```

**Key Insight**: Application-level validation can have bugs. Database-level CHECK constraints are the **last line of defense** for data integrity. If an application tries `INSERT ... status = 'invalid'`, PostgreSQL will reject it with error code `23514`.

---

## 6. Indexing Strategy

### 6.1 Index Types Used

All indexes are **B-tree** (PostgreSQL default), which provides O(log n) lookup for equality and range operations.

### 6.2 Index Selection Rationale

| Index | Table.Column | Query Pattern | Justification |
|-------|-------------|---------------|---------------|
| `idx_complaints_student` | complaints(student_id) | `WHERE student_id = $1` | Students view their own complaints |
| `idx_complaints_status` | complaints(status) | `WHERE status = 'pending'` | Staff filter by status |
| `idx_complaints_staff` | complaints(assigned_staff_id) | `WHERE assigned_staff_id = $1` | Staff view assigned complaints |
| `idx_complaints_created` | complaints(created_at DESC) | `ORDER BY created_at DESC` | Sorting by recency |
| `idx_feedback_student` | mess_feedback(student_id) | `WHERE student_id = $1` | Duplicate check |
| `idx_feedback_date` | mess_feedback(created_at DESC) | `GROUP BY date_trunc(...)` | Aggregation by date |
| `idx_announcements_date` | announcements(posted_date DESC) | `ORDER BY posted_date DESC` | Chronological listing |
| `idx_student_hostel` | student(hostel_name) | `WHERE hostel_name = $1` | Hostel-level reports |

### 6.3 Functional (Expression-Based) Unique Index

```sql
CREATE UNIQUE INDEX idx_unique_feedback_per_day
  ON mess_feedback (student_id, (created_at::date));
```

This is a **functional index** — it indexes the result of an *expression* (`created_at::date`), not a raw column. This is a PostgreSQL-specific feature that allows uniqueness enforcement on computed values.

**Why not a regular UNIQUE constraint?**
- A regular UNIQUE constraint works on raw columns only.
- We need uniqueness on `(student_id, DATE(created_at))`, where the date is extracted from a timestamp.
- This requires an expression index.

---

## 7. Views (Logical Data Independence)

### 7.1 What Are Views?

A **view** is a virtual table defined by a stored `SELECT` query. It does not store data itself — it computes the result on each access. Views provide **logical data independence**: the application queries a stable interface, even if the underlying tables change.

### 7.2 Views Created

#### v_complaint_dashboard
```sql
CREATE OR REPLACE VIEW v_complaint_dashboard AS
SELECT status, COUNT(*) AS total_count, AVG(rating)::numeric(10,2) AS avg_rating
FROM complaints GROUP BY status;
```
**Purpose**: Aggregated complaint statistics per status. Used by the admin dashboard endpoint (`GET /admin/complaint-report`).

#### v_student_complaints
```sql
CREATE OR REPLACE VIEW v_student_complaints AS
SELECT c.*, u.name AS student_name, s.roll_no, s.hostel_name
FROM complaints c
JOIN student s ON c.student_id = s.student_id
JOIN users u ON c.student_id = u.id;
```
**Purpose**: Enriched complaint view with student details. Replaces repeated JOIN logic in application code.

#### v_daily_mess_report
```sql
CREATE OR REPLACE VIEW v_daily_mess_report AS
SELECT created_at::date AS report_date, COUNT(*) AS total_responses,
       AVG(rating)::numeric(10,2) AS avg_rating, MIN(rating), MAX(rating)
FROM mess_feedback GROUP BY created_at::date ORDER BY report_date DESC;
```
**Purpose**: Daily aggregated mess feedback. Used by `GET /admin/mess-report` and `GET /feedback/reports`.

### 7.3 Benefits of Views in This Project
1. **Simplified queries** — Application code queries `SELECT * FROM v_daily_mess_report` instead of writing complex GROUP BY.
2. **Logical data independence** — If we rename a column in `mess_feedback`, we only update the view definition, not every query in the app.
3. **Security** — Views can restrict which columns are exposed (e.g., hiding raw image bytes).

---

## 8. Stored Procedures & Functions (PL/pgSQL)

### 8.1 What Is PL/pgSQL?

PL/pgSQL (Procedural Language/PostgreSQL) is PostgreSQL's built-in procedural language. It allows writing server-side functions with control flow (IF, LOOP, etc.), variables, and exception handling.

### 8.2 Function: `get_hostel_complaint_report()`

```sql
CREATE OR REPLACE FUNCTION get_hostel_complaint_report(p_hostel_name TEXT)
RETURNS TABLE (
  category TEXT, total BIGINT, pending BIGINT, in_progress BIGINT,
  resolved BIGINT, avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.category, COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE c.status = 'pending')::BIGINT,
    COUNT(*) FILTER (WHERE c.status = 'in progress')::BIGINT,
    COUNT(*) FILTER (WHERE c.status = 'resolved')::BIGINT,
    AVG(c.rating)::numeric(10,2)
  FROM complaints c JOIN student s ON c.student_id = s.student_id
  WHERE s.hostel_name = p_hostel_name GROUP BY c.category;
END;
$$ LANGUAGE plpgsql;
```

### 8.3 Invocation from Application
```typescript
// In admin.service.ts
const result = await this.db.query(
  `SELECT * FROM get_hostel_complaint_report($1)`, [hostelName]
);
```

### 8.4 Why Use a Stored Procedure?
1. **Reduced network round-trips** — Instead of fetching raw rows and aggregating in Node.js, the database does it in one call.
2. **Server-side computation** — The PostgreSQL engine has optimized aggregation operators. Computing `COUNT(*) FILTER(...)` is faster inside the DB than in application code.
3. **Reusability** — The function can be called from any client (psql, another service, a BI tool) without duplicating logic.
4. **The `FILTER` clause** — A PostgreSQL-specific feature for conditional aggregation. More readable than `CASE WHEN ... END`.

---

## 9. Triggers (DML Event Automation)

### 9.1 What Are Triggers?

A **trigger** is a database object that automatically executes a function when a DML event (INSERT, UPDATE, DELETE) occurs on a table. Triggers can fire BEFORE or AFTER the event, and operate at row-level or statement-level.

### 9.2 Triggers in This Project

#### Auto-Update `updated_at` Timestamp

```sql
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaints_updated
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER trg_auth_updated
  BEFORE UPDATE ON auth
  FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();
```

### 9.3 Trigger Characteristics

| Property | Value | Explanation |
|----------|-------|-------------|
| Timing | `BEFORE UPDATE` | Fires before the row is written, so we can modify `NEW` |
| Granularity | `FOR EACH ROW` | Fires once per affected row (not once per statement) |
| Return | `RETURN NEW` | For BEFORE triggers, returning NEW allows the modified row to be written |

### 9.4 Why Use Triggers?

**Without trigger** (old code):
```sql
UPDATE complaints SET status = $1, updated_at = current_timestamp WHERE ...
```
The application must remember to set `updated_at` in every UPDATE query. If any code path forgets, `updated_at` becomes stale.

**With trigger** (new code):
```sql
UPDATE complaints SET status = $1 WHERE ...
-- updated_at is automatically set by the trigger
```
The timestamp is **guaranteed** to update regardless of which code path performs the UPDATE. This is an example of **DRY (Don't Repeat Yourself)** at the database level.

---

## 10. Transaction Management & ACID Properties

### 10.1 ACID in This Project

| Property | Implementation |
|----------|---------------|
| **Atomicity** | User registration inserts into both `auth` and `users` within a single `BEGIN...COMMIT` block. If either fails, `ROLLBACK` undoes both. Same for complaint creation (image + complaint). |
| **Consistency** | CHECK constraints, FK constraints, and UNIQUE constraints ensure the database never enters an invalid state. |
| **Isolation** | PostgreSQL uses **MVCC** (Multi-Version Concurrency Control) — each transaction sees a snapshot, preventing dirty reads. Default isolation level is **Read Committed**. |
| **Durability** | PostgreSQL writes WAL (Write-Ahead Log) before confirming a COMMIT. Even after a crash, committed data survives. Docker volume (`postgres_data`) persists data across container restarts. |

### 10.2 Explicit Transaction: User Registration

```typescript
const client = await this.db.connect();
try {
    await client.query('BEGIN');                                    // Start transaction
    const authResult = await client.query(
        'INSERT INTO auth (...) VALUES (...) RETURNING id', [...]
    );
    await client.query(
        'INSERT INTO users (...) VALUES (...)', [...]
    );
    await client.query('COMMIT');                                  // Both succeed → commit
} catch (err) {
    await client.query('ROLLBACK');                                // Any failure → undo all
    throw err;
} finally {
    client.release();                                              // Return connection to pool
}
```

### 10.3 Explicit Transaction: Complaint Creation

```typescript
// Atomicity: image upload + complaint creation are a single unit of work
await client.query('BEGIN');
// 1. Insert image into complaint_images
// 2. Insert complaint referencing image_id
await client.query('COMMIT');
// If step 2 fails, step 1 is also rolled back — no orphan images
```

### 10.4 Why Explicit Transactions Matter

Without transactions, a crash between step 1 and step 2 would leave:
- An `auth` row without a corresponding `users` row (broken user)
- A `complaint_images` row with no complaint referencing it (orphan image)

Transactions guarantee **all-or-nothing** semantics.

---

## 11. Concurrency Control — MVCC & Functional Indexes

### 11.1 MVCC (Multi-Version Concurrency Control)

PostgreSQL uses MVCC as its concurrency control mechanism. Instead of locking rows during reads, it maintains multiple versions of each row. Each transaction sees a consistent snapshot.

**Practical impact**: When a student submits a complaint (write), it doesn't block other students from reading their complaints (read). Reads never block writes and vice versa.

### 11.2 Race Condition: Duplicate Feedback

**Problem**: Two concurrent requests from the same student:
```
T1: SELECT * FROM mess_feedback WHERE student_id = $1 AND date = today  → 0 rows
T2: SELECT * FROM mess_feedback WHERE student_id = $1 AND date = today  → 0 rows
T1: INSERT INTO mess_feedback (...)  → succeeds
T2: INSERT INTO mess_feedback (...)  → succeeds ← DUPLICATE!
```

**Solution**: The functional unique index `idx_unique_feedback_per_day` is enforced atomically by PostgreSQL at the storage engine level. Even under concurrent inserts, the database guarantees that T2's INSERT will fail with error code `23505` (unique violation).

```sql
CREATE UNIQUE INDEX idx_unique_feedback_per_day
  ON mess_feedback (student_id, (created_at::date));
```

This moves correctness from application code (fragile) to the database engine (robust).

---

## 12. Architectural Decisions

### 12.1 Raw SQL vs ORM

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB Interaction | **Raw SQL** (node-postgres) | No ORM (Prisma, Drizzle, etc.) used. This was a deliberate choice for a DBMS course project to demonstrate manual query writing, explicit JOIN operations, transaction management, and understanding of SQL semantics. An ORM would abstract away the concepts being evaluated. |

### 12.2 PostgreSQL vs MySQL

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| ACID Compliance | Full (all storage engines) | Depends on engine (InnoDB yes, MyISAM no) |
| MVCC | Native | InnoDB only |
| Functional Indexes | ✅ Supported | ❌ Not supported (until 8.0 virtual columns) |
| CHECK Constraints | ✅ Enforced | ✅ Enforced (since 8.0.16; earlier versions parsed but ignored) |
| FILTER Clause | ✅ Supported | ❌ Must use CASE WHEN |
| Stored Procedures | ✅ PL/pgSQL | ✅ SQL/PSM |
| BYTEA (binary) | ✅ Native type | BLOB (different semantics) |

### 12.3 UUIDv7 as Primary Key

UUIDv7 is a **time-sorted UUID** (RFC 9562). The first 48 bits encode a Unix timestamp.

**Advantages over auto-increment (SERIAL)**:
1. **No ID enumeration attacks** — Users can't guess valid IDs by incrementing.
2. **Merge-friendly** — No collision risk when merging data across environments.
3. **Roughly time-ordered** — B-tree index insertion is sequential (reduces page splits).

**Advantages over UUIDv4**:
1. **Time-sortable** — `ORDER BY id` gives roughly chronological order.
2. **Better index locality** — v4 is random, causing more random I/O on B-tree inserts.

### 12.4 Separation of `auth` and `users` Tables

```
auth: id, user_name, password_hash, timestamps
users: id (FK → auth), name, email, phone, user_role
```

**Why not a single table?**
1. **Security isolation** — Queries that display user profiles never touch `password_hash`. No accidental exposure via `SELECT *`.
2. **Single Responsibility** — `auth` handles authentication data. `users` handles identity data.
3. **Different update patterns** — Password changes update `auth.updated_at`. Profile changes update `users` columns. Separating them avoids unnecessary row versioning in MVCC.

### 12.5 Image Storage: BYTEA vs Filesystem

Images are stored as `BYTEA` in the `complaint_images` table.

**Why BYTEA (in-database)?**
1. **Consistency** — The image is part of the same transaction as the complaint. `ROLLBACK` removes both.
2. **Referential integrity** — FK from `complaints.image_id` to `complaint_images.image_id` ensures no orphan files.
3. **Backup simplicity** — `pg_dump` captures everything.

**Trade-off**: For large-scale production systems, object storage (S3/MinIO) is preferred. BYTEA is appropriate for a project-scale system where transactional consistency is more valued than storage efficiency.

### 12.6 Docker for Database

The PostgreSQL instance runs in a Docker container (`docker-compose.yml`). This ensures:
1. **Environment reproducibility** — Same PostgreSQL version, same config, everywhere.
2. **Isolation** — No conflict with any host-installed PostgreSQL instance.
3. **Easy reset** — `docker compose down -v && docker compose up` gives a fresh database.

---

## 13. Summary of DBMS Concepts Used

| # | Concept | Where Applied |
|---|---------|--------------|
| 1 | **ER Modeling** | 11 entities with 1:1, 1:N relationships, ISA hierarchy |
| 2 | **Normalization (3NF/BCNF)** | All tables analyzed; no partial or transitive dependencies |
| 3 | **DDL** | CREATE TABLE, ALTER TABLE, CREATE INDEX, CREATE VIEW, CREATE FUNCTION, CREATE TRIGGER |
| 4 | **DML** | SELECT, INSERT, UPDATE with parameterized queries (SQL injection prevention) |
| 5 | **Referential Integrity (FK)** | 14 foreign key constraints with CASCADE/SET NULL strategies |
| 6 | **Domain Integrity (CHECK)** | 7 CHECK constraints on status, roles, ratings |
| 7 | **Entity Integrity (PK)** | UUIDv7 primary keys on all tables |
| 8 | **UNIQUE Constraints** | user_name, email, roll_no, functional index for feedback dedup |
| 9 | **B-tree Indexes** | 8 indexes for query optimization |
| 10 | **Functional Index** | Expression index on `(student_id, created_at::date)` |
| 11 | **Views** | 3 views for logical data independence |
| 12 | **Stored Procedure** | `get_hostel_complaint_report()` in PL/pgSQL |
| 13 | **Triggers** | 2 BEFORE UPDATE triggers for automatic timestamp management |
| 14 | **Transactions (ACID)** | Explicit BEGIN/COMMIT/ROLLBACK in registration and complaint creation |
| 15 | **MVCC** | PostgreSQL's native concurrency model; Read Committed isolation |
| 16 | **Aggregate Functions** | COUNT, AVG, MIN, MAX, COUNT(*) FILTER (...) |
| 17 | **JOINs** | INNER JOIN, LEFT JOIN across multi-table queries |
| 18 | **Parameterized Queries** | `$1, $2, ...` placeholders prevent SQL injection |
| 19 | **Connection Pooling** | `pg.Pool` reuses connections; `client.release()` returns to pool |
| 20 | **Type Casting** | `::numeric(10,2)`, `::date`, `::BIGINT` for explicit type control |

---

*This report was authored as part of the Hostel-Hub DBMS project documentation.*

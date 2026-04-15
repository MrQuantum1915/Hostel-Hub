-- check constraints
ALTER TABLE complaints    DROP CONSTRAINT IF EXISTS chk_complaint_status;
ALTER TABLE complaints    ADD  CONSTRAINT chk_complaint_status
  CHECK (status IN ('pending', 'in progress', 'resolved'));

ALTER TABLE complaints    DROP CONSTRAINT IF EXISTS chk_urgency;
ALTER TABLE complaints    ADD  CONSTRAINT chk_urgency
  CHECK (urgency_level IN ('low', 'normal', 'high', 'critical'));

ALTER TABLE mess_feedback DROP CONSTRAINT IF EXISTS chk_rating;
ALTER TABLE mess_feedback ADD  CONSTRAINT chk_rating
  CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE complaints    DROP CONSTRAINT IF EXISTS chk_complaint_rating;
ALTER TABLE complaints    ADD  CONSTRAINT chk_complaint_rating
  CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE rooms         DROP CONSTRAINT IF EXISTS chk_room_status;
ALTER TABLE rooms         ADD  CONSTRAINT chk_room_status
  CHECK (status IN ('available', 'full', 'maintenance'));

ALTER TABLE users         DROP CONSTRAINT IF EXISTS chk_user_role;
ALTER TABLE users         ADD  CONSTRAINT chk_user_role
  CHECK (user_role IN ('student', 'admin', 'staff'));

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS chk_announcement_type;
ALTER TABLE announcements ADD  CONSTRAINT chk_announcement_type
  CHECK (announcement_type IN ('Maintenance', 'Event', 'Mess Notice', 'Holiday', 'General', 'Emergency'));



-- use UTC, caused issue due to local time ig
CREATE OR REPLACE FUNCTION immutable_ts_to_date(ts TIMESTAMPTZ)
  RETURNS DATE AS $$ SELECT ($1 AT TIME ZONE 'UTC')::DATE $$ LANGUAGE SQL IMMUTABLE;


-- fxnal index for 1 feedback per day per student
DROP INDEX IF EXISTS idx_unique_feedback_per_day;

-- temp cleanup 
DELETE FROM mess_feedback
WHERE feedback_id NOT IN (
    SELECT DISTINCT ON (student_id, immutable_ts_to_date(created_at)) feedback_id
    FROM mess_feedback
    ORDER BY student_id, immutable_ts_to_date(created_at), created_at ASC
);

CREATE UNIQUE INDEX idx_unique_feedback_per_day
  ON mess_feedback (student_id, immutable_ts_to_date(created_at));



-- indexing (btree)
-- complaints: gen freq filtered by student/status/assigned staff
CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status  ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_staff   ON complaints(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);

-- query by student, aggregate by date
CREATE INDEX IF NOT EXISTS idx_feedback_student   ON mess_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_date      ON mess_feedback(created_at DESC);

-- sorted by posting date
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(posted_date DESC);

CREATE INDEX IF NOT EXISTS idx_student_hostel     ON student(hostel_name);


-- views

-- aggregate per status
DROP VIEW IF EXISTS v_complaint_dashboard CASCADE;
CREATE VIEW v_complaint_dashboard AS
SELECT
  status,
  COUNT(*)                   AS total_count,
  AVG(rating)::numeric(10,2) AS avg_rating
FROM complaints
GROUP BY sta  tus;


-- enriched complaint data = complaint + student + user info
DROP VIEW IF EXISTS v_student_complaints CASCADE;
CREATE VIEW v_student_complaints AS
SELECT
  c.complaint_id, c.title, c.details, c.category, c.urgency_level,
  c.status, c.rating, c.created_at, c.updated_at, c.image_id,
  u.name  AS student_name,
  s.roll_no,
  s.hostel_name
FROM complaints c
JOIN student s ON c.student_id = s.student_id
JOIN users   u ON c.student_id = u.id;


-- per day aggregated feeedback
DROP VIEW IF EXISTS v_daily_mess_report CASCADE;
CREATE VIEW v_daily_mess_report AS
SELECT
  created_at::date           AS date,
  COUNT(*)                   AS count,
  AVG(rating)::numeric(10,2) AS avg_rating,
  MIN(rating)                AS min_rating,
  MAX(rating)                AS max_rating
FROM mess_feedback
GROUP BY created_at::date
ORDER BY date DESC;



-- stored procedure
CREATE OR REPLACE FUNCTION get_hostel_complaint_report(p_hostel_name TEXT)
RETURNS TABLE (
  category    TEXT,
  total       BIGINT,
  pending     BIGINT,
  in_progress BIGINT,
  resolved    BIGINT,
  avg_rating  NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.category,
    COUNT(*)::BIGINT                                         AS total,
    COUNT(*) FILTER (WHERE c.status = 'pending')::BIGINT    AS pending,
    COUNT(*) FILTER (WHERE c.status = 'in progress')::BIGINT AS in_progress,
    COUNT(*) FILTER (WHERE c.status = 'resolved')::BIGINT   AS resolved,
    AVG(c.rating)::numeric(10,2)                            AS avg_rating
  FROM complaints c
  JOIN student s ON c.student_id = s.student_id
  WHERE s.hostel_name = p_hostel_name
  GROUP BY c.category;
END;
$$ LANGUAGE plpgsql;


-- triggers

CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_complaints_updated ON complaints;
CREATE TRIGGER trg_complaints_updated
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();

DROP TRIGGER IF EXISTS trg_auth_updated ON auth;
CREATE TRIGGER trg_auth_updated
  BEFORE UPDATE ON auth
  FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();

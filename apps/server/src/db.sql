create table if not exists auth(
    id uuid primary key default uuidv7(),
    user_name text unique not null,
    password_hash text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

create table if not exists users(
    id uuid primary key references auth(id) on delete cascade,
    user_name text unique references auth(user_name) on delete cascade,
    name varchar(20) not null,
    email text unique not null,
    user_role text not null default 'student',
    phone text not null
);

create table if not exists admin(
    admin_id uuid primary key references users(id) on delete cascade
);

create table if not exists hostels(
    hostel_id uuid primary key default uuidv7(),
    hostel_name text unique not null,
    location text not null,
    capacity integer not null
);

create table if not exists rooms(
    room_id uuid primary key default uuidv7(),
    hostel_name text not null references hostels(hostel_name) on delete cascade,
    room_capacity integer not null,
    status text not null default 'available'
);

create table if not exists student(
    student_id uuid primary key references users(id) on delete cascade, 
    roll_no varchar(20) unique not null,
    hostel_name text not null references hostels(hostel_name) on delete cascade,
    room_id uuid references rooms(room_id) on delete set null
);

create table if not exists maintenance_staff(
    staff_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    designation TEXT NOT NULL
);

create table if not exists assets(
    asset_id uuid primary key default uuidv7(),
    name text not null,
    condition text not null,
    room_id uuid references rooms(room_id) on delete set null
);

create table if not exists complaint_images(
    image_id uuid primary key default uuidv7(),
    image bytea not null
);

create table if not exists complaints(
    complaint_id uuid primary key default uuidv7(),
    student_id uuid references student(student_id) on delete set null, 
    title text not null,
    details text not null,
    image_id uuid references complaint_images(image_id) on delete set null,
    category text not null,
    urgency_level text not null default 'normal',
    status text not null default 'pending',
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    assigned_staff_id uuid references maintenance_staff(staff_id) on delete set null,
    rating integer default null
);

create table if not exists announcements(
    announcement_id uuid primary key default uuidv7(),
    admin_id uuid references admin(admin_id) on delete set null,
    title text not null,
    content text not null,
    announcement_type text not null,
    posted_date timestamp with time zone default current_timestamp
);

create table if not exists mess_feedback(
    feedback_id uuid primary key default uuidv7(),
    student_id uuid references student(student_id) on delete set null,
    rating integer not null,
    comments text default null,
    created_at timestamp with time zone default current_timestamp
);
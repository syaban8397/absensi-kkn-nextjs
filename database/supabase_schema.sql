-- Skema untuk Supabase (PostgreSQL)
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> New query -> Run

drop table if exists attendances;
drop table if exists users;

create type user_role as enum ('admin', 'peserta');
create type attendance_period as enum ('pagi', 'sore');
create type attendance_status as enum ('hadir', 'izin', 'sakit', 'alfa', 'pulang');

create table users (
    id bigint generated always as identity primary key,
    name varchar(255) not null,
    username varchar(255) not null unique,
    email varchar(255) unique,
    password varchar(255) not null,
    role user_role not null default 'peserta',
    division varchar(255),
    position varchar(255),
    photo_path varchar(255),
    created_at timestamp,
    updated_at timestamp
);

create table attendances (
    id bigint generated always as identity primary key,
    user_id bigint not null references users(id) on delete cascade,
    attendance_date date not null,
    period attendance_period not null,
    status attendance_status not null default 'alfa',
    note text,
    attendance_at timestamp,
    created_at timestamp,
    updated_at timestamp,
    constraint attendances_user_date_period_unique unique (user_id, attendance_date, period)
);

create index attendances_attendance_date_index on attendances (attendance_date);
create index attendances_period_index on attendances (period);
create index attendances_status_index on attendances (status);

insert into users
    (name, username, email, password, role, division, position, photo_path, created_at, updated_at)
values
    ('Admin KKN', 'admin', 'admin@kkn.local', '$2y$12$UB6dcDefR2r3BQvjw7uhZOZsWBZZAQ0EfDHxyhZrXe3G9bn8eipZ6', 'admin', NULL, 'Admin', NULL, now(), now()),
    ('Rizky Syaban Faudi', 'rizky.syaban', 'rizky.syaban@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Ketua', NULL, now(), now()),
    ('Azzahra Salsabila', 'azzahra.salsabila', 'azzahra.salsabila@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Wakil Ketua', NULL, now(), now()),
    ('Sundawi Sabina', 'sundawi.sabina', 'sundawi.sabina@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Sekretaris 1', NULL, now(), now()),
    ('Nazma Malihah', 'nazma.malihah', 'nazma.malihah@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Sekretaris 2', NULL, now(), now()),
    ('Widya Amelia R', 'widya.amelia', 'widya.amelia@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Bendahara', NULL, now(), now()),
    ('Rini Nurjanah', 'rini.nurjanah', 'rini.nurjanah@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Ketua Divisi', NULL, now(), now()),
    ('Agus Alan Maolana', 'agus.alan', 'agus.alan@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, now(), now()),
    ('Alsina Yulistia Salsabila', 'alsina.yulistia', 'alsina.yulistia@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, now(), now()),
    ('Charlee', 'charlee', 'charlee@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, now(), now()),
    ('Azzahra Nurhaliza', 'azzahra.nurhaliza', 'azzahra.nurhaliza@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, now(), now()),
    ('Fajar Muhammad', 'fajar.muhammad', 'fajar.muhammad@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Ketua Divisi', NULL, now(), now()),
    ('Syabrina Reva', 'syabrina.reva', 'syabrina.reva@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Anggota', NULL, now(), now()),
    ('Ayu Lestari', 'ayu.lestari', 'ayu.lestari@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Anggota', NULL, now(), now()),
    ('Ziad Haqqinnazili Ridh', 'ziad.haqqinnazili', 'ziad.haqqinnazili@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Ketua Divisi', NULL, now(), now()),
    ('Sri Justikan Wulandari', 'sri.justikan', 'sri.justikan@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Anggota', NULL, now(), now()),
    ('Nabil Musyafa', 'nabil.musyafa', 'nabil.musyafa@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Anggota', NULL, now(), now()),
    ('Arif Indi Fauzi', 'arif.indi', 'arif.indi@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Logistik', 'Ketua Divisi', NULL, now(), now()),
    ('Muhammad Rizky Firdaus', 'muhammad.rizky', 'muhammad.rizky@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Logistik', 'Anggota', NULL, now(), now());

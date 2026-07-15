CREATE DATABASE IF NOT EXISTS absensi_kkn_nextjs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE absensi_kkn_nextjs;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'peserta') NOT NULL DEFAULT 'peserta',
    division VARCHAR(255) NULL,
    position VARCHAR(255) NULL,
    photo_path VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendances (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    attendance_date DATE NOT NULL,
    period ENUM('pagi', 'sore') NOT NULL,
    status ENUM('hadir', 'izin', 'sakit', 'alfa', 'pulang') NOT NULL DEFAULT 'alfa',
    note TEXT NULL,
    attendance_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    INDEX attendances_attendance_date_index (attendance_date),
    INDEX attendances_period_index (period),
    INDEX attendances_status_index (status),
    UNIQUE KEY attendances_user_date_period_unique (user_id, attendance_date, period),
    CONSTRAINT attendances_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users
    (name, username, email, password, role, division, position, photo_path, created_at, updated_at)
VALUES
    ('Admin KKN', 'admin', 'admin@kkn.local', '$2y$12$UB6dcDefR2r3BQvjw7uhZOZsWBZZAQ0EfDHxyhZrXe3G9bn8eipZ6', 'admin', NULL, 'Admin', NULL, NOW(), NOW()),
    ('Rizky Syaban Faudi', 'rizky.syaban', 'rizky.syaban@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Ketua', NULL, NOW(), NOW()),
    ('Azzahra Salsabila', 'azzahra.salsabila', 'azzahra.salsabila@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Wakil Ketua', NULL, NOW(), NOW()),
    ('Sundawi Sabina', 'sundawi.sabina', 'sundawi.sabina@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Sekretaris 1', NULL, NOW(), NOW()),
    ('Nazma Malihah', 'nazma.malihah', 'nazma.malihah@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Sekretaris 2', NULL, NOW(), NOW()),
    ('Widya Amelia R', 'widya.amelia', 'widya.amelia@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Pengurus Inti', 'Bendahara', NULL, NOW(), NOW()),
    ('Rini Nurjanah', 'rini.nurjanah', 'rini.nurjanah@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Ketua Divisi', NULL, NOW(), NOW()),
    ('Agus Alan Maolana', 'agus.alan', 'agus.alan@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, NOW(), NOW()),
    ('Alsina Yulistia Salsabila', 'alsina.yulistia', 'alsina.yulistia@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, NOW(), NOW()),
    ('Charlee', 'charlee', 'charlee@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, NOW(), NOW()),
    ('Azzahra Nurhaliza', 'azzahra.nurhaliza', 'azzahra.nurhaliza@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Acara', 'Anggota', NULL, NOW(), NOW()),
    ('Fajar Muhammad', 'fajar.muhammad', 'fajar.muhammad@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Ketua Divisi', NULL, NOW(), NOW()),
    ('Syabrina Reva', 'syabrina.reva', 'syabrina.reva@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Anggota', NULL, NOW(), NOW()),
    ('Ayu Lestari', 'ayu.lestari', 'ayu.lestari@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Humas', 'Anggota', NULL, NOW(), NOW()),
    ('Ziad Haqqinnazili Ridh', 'ziad.haqqinnazili', 'ziad.haqqinnazili@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Ketua Divisi', NULL, NOW(), NOW()),
    ('Sri Justikan Wulandari', 'sri.justikan', 'sri.justikan@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Anggota', NULL, NOW(), NOW()),
    ('Nabil Musyafa', 'nabil.musyafa', 'nabil.musyafa@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi PDD', 'Anggota', NULL, NOW(), NOW()),
    ('Arif Indi Fauzi', 'arif.indi', 'arif.indi@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Logistik', 'Ketua Divisi', NULL, NOW(), NOW()),
    ('Muhammad Rizky Firdaus', 'muhammad.rizky', 'muhammad.rizky@kkn.local', '$2y$12$.oAWyCAemsEXXP0d4TcJ2.Bo/kD0/k5UwpKbywHesAOgX4M8jd1aS', 'peserta', 'Divisi Logistik', 'Anggota', NULL, NOW(), NOW());

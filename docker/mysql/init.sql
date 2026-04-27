-- 初始化数据库

CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_db;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dingtalk_user_id` VARCHAR(64) NOT NULL UNIQUE,
  `union_id` VARCHAR(64),
  `name` VARCHAR(64) NOT NULL,
  `avatar` VARCHAR(512),
  `mobile` VARCHAR(20),
  `email` VARCHAR(128),
  `department_id` INT,
  `department_name` VARCHAR(128),
  `role` ENUM('super_admin', 'admin', 'department_manager', 'employee') DEFAULT 'employee',
  `status` ENUM('active', 'disabled', 'resigned') DEFAULT 'active',
  `hire_date` DATE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dingtalk_user_id` (`dingtalk_user_id`),
  INDEX `idx_department_id` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dingtalk_user_id` VARCHAR(64) NOT NULL,
  `work_date` DATE NOT NULL,
  `check_in_time` DATETIME,
  `check_out_time` DATETIME,
  `check_in_result` VARCHAR(32),
  `check_out_result` VARCHAR(32),
  `time_result` VARCHAR(32),
  `location_result` VARCHAR(32),
  `source_type` VARCHAR(32),
  `is_late` BOOLEAN DEFAULT FALSE,
  `is_early_leave` BOOLEAN DEFAULT FALSE,
  `is_absent` BOOLEAN DEFAULT FALSE,
  `late_minutes` INT DEFAULT 0,
  `early_minutes` INT DEFAULT 0,
  `sync_batch_id` VARCHAR(64),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_work_date` (`user_id`, `work_date`),
  INDEX `idx_work_date` (`work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leave_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dingtalk_user_id` VARCHAR(64) NOT NULL,
  `leave_type` ENUM('annual', 'sick', 'personal', 'marriage', 'maternity', 'paternity', 'bereavement', 'compensatory', 'other') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `start_time_period` VARCHAR(16) DEFAULT 'am',
  `end_time_period` VARCHAR(16) DEFAULT 'pm',
  `duration_days` DECIMAL(4, 2) DEFAULT 0,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  `approval_instance_id` VARCHAR(128),
  `approval_result` VARCHAR(32),
  `approver` VARCHAR(64),
  `approved_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_dates` (`user_id`, `start_date`),
  INDEX `idx_approval_instance` (`approval_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `overtime_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dingtalk_user_id` VARCHAR(64) NOT NULL,
  `overtime_date` DATE NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `duration_hours` DECIMAL(4, 2) DEFAULT 0,
  `day_type` ENUM('workday', 'weekend', 'holiday') NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  `approval_instance_id` VARCHAR(128),
  `approval_result` VARCHAR(32),
  `approver` VARCHAR(64),
  `approved_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_overtime_date` (`user_id`, `overtime_date`),
  INDEX `idx_approval_instance` (`approval_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patch_card_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dingtalk_user_id` VARCHAR(64) NOT NULL,
  `patch_date` DATE NOT NULL,
  `patch_type` VARCHAR(32) NOT NULL,
  `target_time` DATETIME NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  `approval_instance_id` VARCHAR(128),
  `approval_result` VARCHAR(32),
  `approver` VARCHAR(64),
  `approved_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_patch_date` (`user_id`, `patch_date`),
  INDEX `idx_approval_instance` (`approval_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance_groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `description` VARCHAR(512),
  `work_days` VARCHAR(32) DEFAULT '1,2,3,4,5',
  `flex_time` BOOLEAN DEFAULT FALSE,
  `late_grace` INT DEFAULT 0,
  `early_grace` INT DEFAULT 0,
  `absent_limit` VARCHAR(16) DEFAULT '0',
  `max_patch_card` INT DEFAULT 3,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance_locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `address` VARCHAR(512),
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `radius` INT DEFAULT 300,
  `wifi_macs` VARCHAR(1024),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `start_time` VARCHAR(8) NOT NULL,
  `end_time` VARCHAR(8) NOT NULL,
  `rest_start_time` VARCHAR(8),
  `rest_end_time` VARCHAR(8),
  `color` VARCHAR(16) DEFAULT '#409EFF',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT NOT NULL,
  `shift_id` INT NOT NULL,
  `sort_order` INT DEFAULT 0,
  UNIQUE KEY `uk_group_shift` (`group_id`, `shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `schedule_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `shift_id` INT NOT NULL,
  `work_date` DATE NOT NULL,
  `is_holiday` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_work_date` (`user_id`, `work_date`),
  INDEX `idx_work_date` (`work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `field_work_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dingtalk_user_id` VARCHAR(64) NOT NULL,
  `schedule_id` INT NOT NULL,
  `check_in_time` DATETIME NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `address` VARCHAR(512),
  `photo_url` VARCHAR(512),
  `remark` VARCHAR(1024),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `title` VARCHAR(256) NOT NULL,
  `content` TEXT,
  `is_read` BOOLEAN DEFAULT FALSE,
  `is_sent` BOOLEAN DEFAULT FALSE,
  `sent_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `title` VARCHAR(256) NOT NULL,
  `content` TEXT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `approve_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action` VARCHAR(32) NOT NULL,
  `target_type` VARCHAR(32) NOT NULL,
  `target_id` INT NOT NULL,
  `ip_address` VARCHAR(64),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `export_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `format` VARCHAR(16) DEFAULT 'xlsx',
  `params` TEXT,
  `file_url` VARCHAR(512),
  `status` VARCHAR(32) DEFAULT 'pending',
  `progress` INT DEFAULT 0,
  `error_msg` TEXT,
  `completed_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(128) NOT NULL UNIQUE,
  `value` TEXT,
  `remark` VARCHAR(512),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
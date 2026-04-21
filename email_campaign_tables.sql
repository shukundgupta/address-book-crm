-- ================================================
--  Email Campaign Tables
--  Run this in phpMyAdmin or MySQL console
-- ================================================

-- 1. Main campaign records
CREATE TABLE IF NOT EXISTS `email_campaigns` (
  `id`                INT AUTO_INCREMENT PRIMARY KEY,
  `company_id`        INT NOT NULL,
  `campaign_name`     VARCHAR(255) NOT NULL,
  `subject`           VARCHAR(500) NOT NULL,
  `html_body`         LONGTEXT NOT NULL,
  `filter_type`       ENUM('all','state','city','pincode') DEFAULT 'all',
  `filter_value`      VARCHAR(255) DEFAULT NULL,
  `total_recipients`  INT DEFAULT 0,
  `total_batches`     INT DEFAULT 0,
  `current_batch`     INT DEFAULT 0,
  `sent_count`        INT DEFAULT 0,
  `failed_count`      INT DEFAULT 0,
  `status`            ENUM('draft','sending','completed','failed') DEFAULT 'draft',
  `created_at`        DATETIME DEFAULT CURRENT_TIMESTAMP,
  `completed_at`      DATETIME DEFAULT NULL,
  INDEX `idx_company` (`company_id`),
  INDEX `idx_status`  (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Per-recipient log
CREATE TABLE IF NOT EXISTS `campaign_logs` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `campaign_id`      INT NOT NULL,
  `recipient_email`  VARCHAR(255) NOT NULL,
  `recipient_name`   VARCHAR(255) DEFAULT NULL,
  `status`           ENUM('sent','failed') NOT NULL,
  `error_message`    TEXT DEFAULT NULL,
  `sent_at`          DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_campaign_email` (`campaign_id`, `recipient_email`),
  INDEX `idx_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

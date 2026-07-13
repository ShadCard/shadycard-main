-- ShadyCard — Initial MySQL Schema (v1.0)
-- Converted from PostgreSQL (Drizzle) to MySQL 8.0+
-- Run via: pnpm --filter @workspace/db run push
-- Or import directly via phpMyAdmin / mysql CLI.

SET FOREIGN_KEY_CHECKS = 0;

-- ====== Users ======
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `telegram_id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(128) NOT NULL,
  `email` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NULL,
  `balance_usd` DECIMAL(24, 12) NOT NULL DEFAULT '0',
  `balance_syp` DECIMAL(14, 2) NOT NULL DEFAULT '0',
  `role` VARCHAR(32) NOT NULL DEFAULT 'user',
  `banned` BOOLEAN NOT NULL DEFAULT FALSE,
  `vip_level` INT NOT NULL DEFAULT 0,
  `referral_code` VARCHAR(64) NULL,
  `referred_by` INT NULL,
  `web_auth_token` VARCHAR(255) NULL,
  `web_auth_expires_at` DATETIME NULL,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_telegram_id_unique` (`telegram_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Categories ======
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(1024) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Products ======
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(1024) NOT NULL,
  `price_usd` DECIMAL(24, 12) NOT NULL,
  `price_syp` DECIMAL(14, 2) NOT NULL,
  `base_price_usd` DECIMAL(24, 12) NULL,
  `provider_unit_price` DECIMAL(16, 8) NULL,
  `store_profit_per_unit` DECIMAL(16, 8) NOT NULL DEFAULT '0',
  `final_unit_price` DECIMAL(16, 8) NULL,
  `product_type` VARCHAR(64) NOT NULL DEFAULT 'package',
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  `min_qty` DECIMAL(14, 2) NULL,
  `max_qty` DECIMAL(14, 2) NULL,
  `min_quantity` INT NULL,
  `max_quantity` INT NULL,
  `quantity_type` ENUM('fixed','range','list') NOT NULL DEFAULT 'fixed',
  `quantity_values` JSON NULL,
  `description` TEXT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `provider_id` INT NULL,
  `source` VARCHAR(32) NOT NULL DEFAULT 'manual',
  `provider_product_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_idx` (`category_id`),
  KEY `products_provider_id_idx` (`provider_id`),
  CONSTRAINT `products_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== News ======
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `type` VARCHAR(64) NOT NULL DEFAULT 'general',
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Banners ======
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `image` VARCHAR(1024) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `link` VARCHAR(1024) NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Payment Methods ======
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `subtitle` VARCHAR(255) NOT NULL,
  `instructions` TEXT NULL,
  `wallet_address` VARCHAR(512) NULL,
  `logo_image` VARCHAR(1024) NULL,
  `qr_image` VARCHAR(1024) NULL,
  `min_amount` DECIMAL(12, 2) NOT NULL DEFAULT '1',
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_methods_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Social Links ======
CREATE TABLE IF NOT EXISTS `social_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(64) NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `label` VARCHAR(128) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Orders ======
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(64) NOT NULL,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` DECIMAL(14, 2) NOT NULL,
  `user_identifier` VARCHAR(255) NULL,
  `total_usd` DECIMAL(24, 12) NOT NULL,
  `total_syp` DECIMAL(14, 2) NOT NULL,
  `cost_usd` DECIMAL(24, 12) NOT NULL DEFAULT '0',
  `status` VARCHAR(32) NOT NULL DEFAULT 'wait',
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_idx` (`user_id`),
  KEY `orders_product_id_idx` (`product_id`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_created_at_idx` (`created_at`),
  CONSTRAINT `orders_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Deposits ======
CREATE TABLE IF NOT EXISTS `deposits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `amount_usd` DECIMAL(24, 12) NOT NULL,
  `amount_syp` DECIMAL(14, 2) NULL,
  `currency` VARCHAR(8) NOT NULL,
  `method` VARCHAR(32) NOT NULL,
  `method_label` VARCHAR(128) NOT NULL,
  `transaction_id` VARCHAR(255) NOT NULL,
  `proof_image` VARCHAR(1024) NULL,
  `telegram_message_id` INT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deposits_user_id_idx` (`user_id`),
  KEY `deposits_status_idx` (`status`),
  CONSTRAINT `deposits_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Shamcash Used Transaction Refs ======
CREATE TABLE IF NOT EXISTS `shamcash_used_transaction_refs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `transaction_ref` VARCHAR(255) NOT NULL,
  `deposit_id` INT NULL,
  `user_id` INT NULL,
  `invoice_id` VARCHAR(255) NULL,
  `amount_usd` DECIMAL(24, 12) NULL,
  `amount_syp` DECIMAL(14, 2) NULL,
  `currency` VARCHAR(8) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shamcash_refs_transaction_ref_unique` (`transaction_ref`),
  KEY `shamcash_refs_deposit_id_idx` (`deposit_id`),
  KEY `shamcash_refs_user_id_idx` (`user_id`),
  CONSTRAINT `shamcash_refs_deposit_id_fk` FOREIGN KEY (`deposit_id`) REFERENCES `deposits` (`id`) ON DELETE SET NULL,
  CONSTRAINT `shamcash_refs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Admins ======
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(128) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'admin',
  `permissions` JSON NULL,
  `two_factor_secret` VARCHAR(255) NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Product Changes Log ======
CREATE TABLE IF NOT EXISTS `product_changes_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `change_type` ENUM('profit','max_quantity') NOT NULL,
  `old_value` TEXT NULL,
  `new_value` TEXT NULL,
  `provider_snapshot` JSON NULL,
  `admin_id` INT NULL,
  `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pcl_product_id_idx` (`product_id`),
  KEY `pcl_admin_id_idx` (`admin_id`),
  CONSTRAINT `pcl_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pcl_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Settings ======
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(128) NOT NULL,
  `value` JSON NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Providers ======
CREATE TABLE IF NOT EXISTS `providers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `api_url` VARCHAR(1024) NULL,
  `api_key` VARCHAR(512) NULL,
  `notes` TEXT NULL,
  `priority` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `provider_type` VARCHAR(64) NULL DEFAULT 'custom',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Coupons ======
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `discount_pct` DECIMAL(5, 2) NOT NULL,
  `max_uses` INT NOT NULL DEFAULT 100,
  `used_count` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== VIP Memberships ======
CREATE TABLE IF NOT EXISTS `vip_memberships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `required_amount` DECIMAL(12, 2) NOT NULL,
  `profit_pct` DECIMAL(5, 2) NOT NULL,
  `badge` VARCHAR(64) NULL,
  `hidden` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Auto Codes ======
CREATE TABLE IF NOT EXISTS `auto_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  `note` TEXT NULL,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `auto_codes_product_id_idx` (`product_id`),
  CONSTRAINT `auto_codes_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Order Messages ======
CREATE TABLE IF NOT EXISTS `order_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_messages_event_unique` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Activity Log ======
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actor_type` VARCHAR(32) NOT NULL DEFAULT 'admin',
  `actor_id` VARCHAR(64) NULL,
  `actor_name` VARCHAR(128) NULL,
  `action` VARCHAR(128) NOT NULL,
  `target` VARCHAR(128) NULL,
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_log_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== API Keys ======
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `key_value` VARCHAR(255) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_keys_key_value_unique` (`key_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====== Notifications ======
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `target_type` VARCHAR(32) NOT NULL DEFAULT 'all',
  `target_user_id` INT NULL,
  `title` VARCHAR(255) NULL,
  `content` TEXT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'sent',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_target_user_id_idx` (`target_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====== Default Settings ======
INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
  ('maintenance_mode', '"false"'),
  ('maintenance_message', '"المتجر قيد الصيانة المؤقتة، يرجى المعاودة لاحقاً."'),
  ('theme_primary', '"#58E8FF"'),
  ('theme_accent', '"#D94CFF"'),
  ('theme_bg', '"#07091B"'),
  ('theme_font', '"Cairo"'),
  ('theme_radius', '"16"'),
  ('store_name', '"ShadyCard"'),
  ('store_tagline', '"بطاقات رقمية وخدمات شحن بأفضل الأسعار"'),
  ('usd_to_syp_rate', '"119"'),
  ('allow_web_registration', '"true"')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ====== Default Order Messages ======
INSERT IGNORE INTO `order_messages` (`event`, `title`, `body`) VALUES
  ('order_created', 'تم إنشاء طلبك', 'تم إنشاء طلبك بنجاح، سيتم تنفيذه خلال دقائق.'),
  ('order_accepted', 'تم تنفيذ الطلب', 'تم تنفيذ طلبك بنجاح. شكراً لاستخدامك ShadyCard.'),
  ('order_rejected', 'تم رفض الطلب', 'نعتذر، تم رفض طلبك. تم إعادة الرصيد لحسابك.'),
  ('order_waiting', 'طلبك قيد المعالجة', 'طلبك قيد المعالجة من قبل المزود، سيتم تحديث الحالة قريباً.'),
  ('deposit_pending', 'إيداع قيد المراجعة', 'تم استلام طلب الإيداع وسيتم مراجعته خلال وقت قصير.'),
  ('deposit_approved', 'تم تأكيد الإيداع', 'تم تأكيد إيداعك وإضافة الرصيد إلى حسابك.'),
  ('deposit_rejected', 'تم رفض الإيداع', 'نعتذر، تم رفض الإيداع. للاستفسار يرجى التواصل مع الدعم.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 17, 2026 at 04:33 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `address_book_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
CREATE TABLE IF NOT EXISTS `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `created_at`, `logo`) VALUES
(1, 'Komal Chemiequip Pvt. Ltd.', '2026-04-03 17:08:51', 'komal.jpg'),
(2, 'Arnav Agencies', '2026-04-03 17:08:51', 'arnav.png');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address` text,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `title` varchar(10) DEFAULT 'Mr',
  `contact_number` varchar(20) DEFAULT NULL,
  `customer_type` enum('New','Existing') DEFAULT 'New',
  `consent` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location` (`state`,`city`,`pincode`),
  KEY `fk_company` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `company_id`, `company_name`, `address`, `state`, `city`, `pincode`, `email`, `contact_person`, `title`, `contact_number`, `customer_type`, `consent`, `created_at`, `updated_at`) VALUES
(1, 0, 'ABC Pvt Ltd', '107, Metro Avenue, South Side of \'WEH\' Stn., \nChakala, Andheri East, ', 'Maharashtra', 'Mumbai', '400099', 'abc@test.com', 'Raj Sharma', 'Mr', '9876543210', 'Existing', 1, '2026-03-06 17:30:56', '2026-03-28 03:35:12'),
(2, 0, 'ABC Pvt Ltd', '709, Hariom Bldg. No. 4, Mogra Pada, \nR.K. Singh Road, Andheri East', 'Maharashtra', 'Mumbai', '400069', 'xyz@gmail.com', 'Mukhul', 'Mr', '7666510624', 'New', 1, '2026-03-07 16:56:47', '2026-03-27 18:29:27');

-- --------------------------------------------------------

--
-- Table structure for table `otp_verification`
--

DROP TABLE IF EXISTS `otp_verification`;
CREATE TABLE IF NOT EXISTS `otp_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `otp_verification`
--

INSERT INTO `otp_verification` (`id`, `email`, `otp`, `expires_at`, `verified`, `created_at`) VALUES
(1, 'shukundgupta@gmail.com', '102811', '2026-04-12 12:17:50', 0, '2026-04-12 06:42:49'),
(2, 'shukundgupta@gmail.com', '849187', '2026-04-12 12:46:48', 0, '2026-04-12 07:11:48'),
(3, 'shukundgupta@gmail.com', '223329', '2026-04-12 23:05:50', 0, '2026-04-12 17:30:50'),
(4, 'shukundgupta@gmail.com', '852811', '2026-04-12 23:24:24', 0, '2026-04-12 17:49:24'),
(5, 'shukundgupta@gmail.com', '491728', '2026-04-12 23:38:02', 0, '2026-04-12 18:03:02'),
(6, 'shukundgupta@gmail.com', '212481', '2026-04-13 09:05:57', 0, '2026-04-13 03:30:57'),
(7, 'shukundgupta@gmail.com', '448367', '2026-04-13 09:19:43', 0, '2026-04-13 03:44:43'),
(8, 'shukundgupta@gmail.com', '355102', '2026-04-13 09:20:56', 0, '2026-04-13 03:45:55'),
(9, 'shukundgupta@gmail.com', '735055', '2026-04-13 09:27:56', 0, '2026-04-13 03:52:55'),
(10, 'shukundgupta@gmail.com', '898914', '2026-04-13 09:32:31', 0, '2026-04-13 03:57:31'),
(11, 'shukundgupta@gmail.com', '960144', '2026-04-13 21:56:47', 0, '2026-04-13 16:21:46'),
(12, 'shukundgupta@gmail.com', '577589', '2026-04-13 22:02:30', 0, '2026-04-13 16:27:29'),
(13, 'shukundgupta@gmail.com', '503424', '2026-04-13 22:09:17', 0, '2026-04-13 16:34:16'),
(14, 'shukundgupta@gmail.com', '590237', '2026-04-13 22:20:24', 0, '2026-04-13 16:45:24'),
(15, 'shukundgupta@gmail.com', '664204', '2026-04-13 22:28:09', 0, '2026-04-13 16:53:09'),
(16, 'shukundgupta@gmail.com', '548853', '2026-04-13 22:40:13', 0, '2026-04-13 17:05:13'),
(17, 'shukundgupta@gmail.com', '955543', '2026-04-13 22:40:46', 0, '2026-04-13 17:05:45'),
(18, 'shukundgupta@gmail.com', '205098', '2026-04-13 22:59:05', 0, '2026-04-13 17:24:05'),
(19, 'shukundgupta@gmail.com', '303027', '2026-04-13 23:01:26', 0, '2026-04-13 17:26:25'),
(20, 'shukundgupta@gmail.com', '715371', '2026-04-13 23:19:02', 0, '2026-04-13 17:44:01'),
(21, 'shukundgupta@gmail.com', '421245', '2026-04-14 09:03:27', 0, '2026-04-14 03:28:26'),
(22, 'shukundgupta@gmail.com', '182328', '2026-04-14 09:12:19', 0, '2026-04-14 03:37:19'),
(23, 'shukundgupta@gmail.com', '452154', '2026-04-14 09:22:05', 0, '2026-04-14 03:47:05'),
(24, 'shukundgupta@gmail.com', '159340', '2026-04-14 09:32:14', 0, '2026-04-14 03:57:14'),
(25, 'shukundgupta@gmail.com', '979534', '2026-04-14 09:37:39', 0, '2026-04-14 04:02:38'),
(26, 'shukundgupta@gmail.com', '645850', '2026-04-15 09:21:48', 0, '2026-04-15 03:46:47'),
(27, 'shukundgupta@gmail.com', '523036', '2026-04-16 09:02:48', 0, '2026-04-16 03:27:48'),
(28, 'shukundgupta@gmail.com', '286681', '2026-04-16 09:17:14', 0, '2026-04-16 03:42:13'),
(29, 'shukundgupta@gmail.com', '442240', '2026-04-16 09:25:10', 0, '2026-04-16 03:50:09'),
(30, 'shukundgupta@gmail.com', '110094', '2026-04-16 09:32:51', 0, '2026-04-16 03:57:51'),
(31, 'shukundgupta@gmail.com', '297242', '2026-04-16 22:42:10', 0, '2026-04-16 17:07:10'),
(32, 'shukundgupta@gmail.com', '676912', '2026-04-16 23:09:19', 0, '2026-04-16 17:34:18'),
(33, 'shukundgupta@gmail.com', '820339', '2026-04-16 23:28:20', 0, '2026-04-16 17:53:19'),
(34, 'shukundgupta@gmail.com', '303993', '2026-04-16 23:41:54', 0, '2026-04-16 18:06:54'),
(35, 'shukundgupta@gmail.com', '615150', '2026-04-17 09:12:51', 0, '2026-04-17 03:37:50'),
(36, 'testuser@example.com', '680170', '2026-04-17 09:15:47', 0, '2026-04-17 03:40:47'),
(37, 'john.doe@example.com', '849238', '2026-04-17 09:17:10', 0, '2026-04-17 03:42:09'),
(38, 'shukundgupta@gmail.com', '848363', '2026-04-17 09:18:37', 0, '2026-04-17 03:43:36'),
(39, 'shukundgupta@gmail.com', '154519', '2026-04-17 09:24:22', 0, '2026-04-17 03:49:22'),
(40, 'shukundgupta@gmail.com', '364762', '2026-04-17 09:29:39', 0, '2026-04-17 03:54:38'),
(41, 'shukundgupta@gmail.com', '896915', '2026-04-17 09:35:13', 0, '2026-04-17 04:00:13'),
(42, 'sukundg@gmail.com', '497513', '2026-04-17 09:39:05', 0, '2026-04-17 04:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `company_id` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `company_id`, `role`, `created_at`) VALUES
(1, 'Admin', 'info@komalchemiequip.com', '$2b$10$cDtEXEHLMsgrPySo4EBez.GmRCyOmCnHQvvLFiFWHrdRl3VOtaI6S', 1, 'admin', '2026-04-04 03:41:17'),
(2, 'Admin', 'info@arnavagencies.com', '$2b$10$bzEp.e8r2cWF85R3z5pKsOjohAM/OgS7S1Tb97Ymyk0cTHye4auXW', 2, 'admin', '2026-04-04 03:41:17'),
(3, 'Shukund', 'shukundgupta@gmail.com', '$2b$10$Bxr0qWsOQ3uk7//w9QSre./fBjeNaig.HOBKGDCwNRRJvIYGd9UAG', 1, 'user', '2026-04-17 03:49:49'),
(4, 'Shukund', 'sukundg@gmail.com', '$2b$10$vYityFIE5Wn67hLNj1G40.NGPQKICTDBQLZ4vr6SBReR/P1FI3ZEK', 1, 'user', '2026-04-17 04:05:22');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

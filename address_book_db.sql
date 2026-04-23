-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 23, 2026 at 04:00 AM
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
-- Table structure for table `campaign_logs`
--

DROP TABLE IF EXISTS `campaign_logs`;
CREATE TABLE IF NOT EXISTS `campaign_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `error_message` text,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_campaign_email` (`campaign_id`,`recipient_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `company_id`, `company_name`, `address`, `state`, `city`, `pincode`, `email`, `contact_person`, `title`, `contact_number`, `customer_type`, `consent`, `created_at`, `updated_at`) VALUES
(5, 1, 'Southern Crest Logistics', 'Flat 204, Sai Residency, \nT. Nagar', 'Tamil Nadu', 'Chennai', '600017', 'shukundgupta@gmail.com', 'Priya Iyer', 'Ms', '8957465214', 'Existing', 1, '2026-04-17 17:28:56', '2026-04-22 16:07:49'),
(4, 1, 'ABC & Co', '142 Pasalkar Bhavan, \nShivajinagar', 'Maharashtra', 'Pune', '411005', 'shukundgupta@gmail.com', 'Arjun Sharma', 'Mr', '5987654126', 'New', 1, '2026-04-17 17:23:50', '2026-04-22 16:07:58'),
(6, 1, 'TechPinnacle Solutions Pvt Ltd', '42, Green Park Extension', 'Delhi', 'South West Delhi', '110016', 'shukundgupta@gmail.com', ' Aarav Sharma', 'Mr', '9987549857', 'New', 1, '2026-04-17 17:30:55', '2026-04-22 16:07:41'),
(7, 2, 'KBC Ltd', '71 C, MOHAMEDALI ROAD,', 'Maharashtra', 'Mumbai', '400003', 'kbcltd@gmail.com', 'Sanjay Gupta', 'Mr', '9875545451', 'New', 1, '2026-04-18 03:54:50', '2026-04-18 03:55:11'),
(8, 2, 'ATTAR MOHD.DAWOOD & BROS', 'A-13/14, MEPZ-SEZ,\nTAMBARAM,,', 'Tamil Nadu', 'Kanchipuram', '600045', 'attarmoh@md4.vsnl.net.in', 'Sanjay Gupta', 'Mr', '9854545214', 'New', 1, '2026-04-18 04:00:00', '2026-04-18 04:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `email_campaigns`
--

DROP TABLE IF EXISTS `email_campaigns`;
CREATE TABLE IF NOT EXISTS `email_campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `campaign_name` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `html_body` longtext NOT NULL,
  `template_header` longtext,
  `template_footer` longtext,
  `template_color` varchar(20) DEFAULT NULL,
  `filter_type` varchar(50) DEFAULT 'all',
  `filter_value` varchar(255) DEFAULT NULL,
  `customer_type` varchar(50) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `total_recipients` int DEFAULT '0',
  `total_batches` int DEFAULT '0',
  `current_batch` int DEFAULT '0',
  `sent_count` int DEFAULT '0',
  `failed_count` int DEFAULT '0',
  `status` varchar(50) DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `email_campaigns`
--

INSERT INTO `email_campaigns` (`id`, `company_id`, `campaign_name`, `subject`, `html_body`, `template_header`, `template_footer`, `template_color`, `filter_type`, `filter_value`, `customer_type`, `from_name`, `total_recipients`, `total_batches`, `current_batch`, `sent_count`, `failed_count`, `status`, `created_at`, `updated_at`, `completed_at`) VALUES
(18, 1, 'April 2026 Campaign (Electroplating Barrel)', 'Electroplating Barrel Unit', '\n        <h1 style=\"text-align: center;\">&lt;!DOCTYPE html&gt;</h1><h1 style=\"text-align: center;\">&lt;html&gt;</h1><h1 style=\"text-align: center;\">&lt;head&gt;</h1><h1 style=\"text-align: center;\">&lt;meta charset=\"UTF-8\"&gt;</h1><h1 style=\"text-align: center;\">&lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"&gt;</h1><h1 style=\"text-align: center;\">&lt;title&gt;Submersible Plating Barrels&lt;/title&gt;</h1><h1 style=\"text-align: center;\">&lt;/head&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;body style=\"margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;\"&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td align=\"center\"&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Main Container --&gt;</h1><h1 style=\"text-align: center;\">&lt;table width=\"800\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background:#ffffff; margin:20px auto; padding:20px; border-radius:6px;\"&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Header --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td align=\"center\" style=\"padding-bottom:15px;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;img src=\"https://www.komalchemiequip.com/images/logo.png\" alt=\"Komal Chemiequip\" style=\"max-width:220px;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td align=\"center\" style=\"font-size:20px; font-weight:bold; color:#333;\"&gt;</h1><h1 style=\"text-align: center;\">Upgrade Your Plating Efficiency with Advanced Submersible Barrels</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"padding:15px 0; font-size:14px; color:#555;\"&gt;</h1><h1 style=\"text-align: center;\">Dear Sir / Madam,&lt;br&gt;&lt;br&gt;</h1><h1 style=\"text-align: center;\">Greetings from &lt;strong&gt;Komal Chemiequip Pvt. Ltd.&lt;/strong&gt;&lt;br&gt;&lt;br&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">We are pleased to introduce our &lt;strong&gt;Submersible Plating Barrels&lt;/strong&gt;, designed for high productivity, consistent coating quality, and reduced operational costs.</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Product Image --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td align=\"center\"&gt;</h1><h1 style=\"text-align: center;\">&lt;img src=\"https://www.komalchemiequip.com/images/submersible-plating-barrel.jpg\"&nbsp;</h1><h1 style=\"text-align: center;\">alt=\"Submersible Plating Barrel\"&nbsp;</h1><h1 style=\"text-align: center;\">style=\"width:100%; max-width:600px; border-radius:6px;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Overview --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"padding-top:15px; font-size:14px; color:#555;\"&gt;</h1><h1 style=\"text-align: center;\">Our fully submerged barrel systems are manufactured using high-quality &lt;strong&gt;PP / Perspex / CPVC materials&lt;/strong&gt;, ensuring durability and chemical resistance.</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Features --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"padding-top:15px;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;strong style=\"color:#333;\"&gt;Key Features:&lt;/strong&gt;</h1><h1 style=\"text-align: center;\">&lt;ul style=\"font-size:14px; color:#555; line-height:1.6;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Ideal for bulk plating of small components&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Uniform coating with superior finish&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Geared motor drive system (AC / DC options)&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Reduced labor and operational cost&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Continuous industrial operation capability&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;li&gt;Custom-built designs available&lt;/li&gt;</h1><h1 style=\"text-align: center;\">&lt;/ul&gt;</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Table --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"padding-top:10px;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;strong style=\"color:#333;\"&gt;Standard Capacity Range:&lt;/strong&gt;&lt;br&gt;&lt;br&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;table width=\"100%\" border=\"1\" cellspacing=\"0\" cellpadding=\"8\" style=\"border-collapse:collapse; font-size:13px; text-align:center;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;tr style=\"background:#0073aa; color:#fff;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;th&gt;Capacity&lt;/th&gt;</h1><h1 style=\"text-align: center;\">&lt;th&gt;Volume&lt;/th&gt;</h1><h1 style=\"text-align: center;\">&lt;th&gt;Barrel Size&lt;/th&gt;</h1><h1 style=\"text-align: center;\">&lt;th&gt;Motor&lt;/th&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;tr&gt;&lt;td&gt;7 Kg&lt;/td&gt;&lt;td&gt;205 L&lt;/td&gt;&lt;td&gt;12\" x 8\"&lt;/td&gt;&lt;td&gt;0.125 HP&lt;/td&gt;&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;&lt;td&gt;15 Kg&lt;/td&gt;&lt;td&gt;600 L&lt;/td&gt;&lt;td&gt;18\" x 10\"&lt;/td&gt;&lt;td&gt;0.25 HP&lt;/td&gt;&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;&lt;td&gt;20 Kg&lt;/td&gt;&lt;td&gt;750 L&lt;/td&gt;&lt;td&gt;24\" x 10\"&lt;/td&gt;&lt;td&gt;0.25 HP&lt;/td&gt;&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;&lt;td&gt;30 Kg&lt;/td&gt;&lt;td&gt;900 L&lt;/td&gt;&lt;td&gt;30\" x 15\"&lt;/td&gt;&lt;td&gt;0.5 HP&lt;/td&gt;&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;&lt;td&gt;50 Kg&lt;/td&gt;&lt;td&gt;1200 L&lt;/td&gt;&lt;td&gt;36\" x 16\"&lt;/td&gt;&lt;td&gt;1.0 HP&lt;/td&gt;&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;/table&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- CTA --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td align=\"center\" style=\"padding:25px 0;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;a href=\"https://www.komalchemiequip.com/Submersible%20Plating%20Barrels%20new.htm\"&nbsp;</h1><h1 style=\"text-align: center;\">style=\"background:#0073aa; color:#ffffff; padding:12px 25px; text-decoration:none; font-size:14px; border-radius:4px;\"&gt;</h1><h1 style=\"text-align: center;\">View Product Details</h1><h1 style=\"text-align: center;\">&lt;/a&gt;</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;!-- Footer --&gt;</h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"font-size:14px; color:#555;\"&gt;</h1><h1 style=\"text-align: center;\">We would be happy to understand your requirement and suggest the right solution for your plating process.</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;tr&gt;</h1><h1 style=\"text-align: center;\">&lt;td style=\"padding-top:15px; font-size:14px; color:#333;\"&gt;</h1><h1 style=\"text-align: center;\">&lt;strong&gt;Komal Chemiequip Pvt. Ltd.&lt;/strong&gt;&lt;br&gt;</h1><h1 style=\"text-align: center;\">Navi Mumbai, India&lt;br&gt;</h1><h1 style=\"text-align: center;\">Email: info@komalchemiequip.com&lt;br&gt;</h1><h1 style=\"text-align: center;\">Phone: +91-22-2826 4715</h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;/table&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;/td&gt;</h1><h1 style=\"text-align: center;\">&lt;/tr&gt;</h1><h1 style=\"text-align: center;\">&lt;/table&gt;</h1><h1 style=\"text-align: center;\"><br></h1><h1 style=\"text-align: center;\">&lt;/body&gt;</h1><h1 style=\"text-align: center;\">&lt;/html&gt;</h1>\n      \n      \n    ', '\n      <div style=\"background:#1e3a5f; padding: 30px 40px; border-bottom: 5px solid rgba(0,0,0,0.1);\">\n        <table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\">\n          <tbody><tr>\n            <td style=\"vertical-align: middle;\">\n              <div style=\"font-size: 32px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px;\">\n                Komal Chemiequip Pvt. Ltd.\n              </div>\n              <div style=\"font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 5px; font-style: italic;\">\n                Manufacturers of Automatic Electroplating &amp; Metal Finishing Plants</div>\n            </td>\n            <td style=\"text-align: right; vertical-align: middle;\">\n               <div style=\"background: rgba(255,255,255,0.2); padding: 10px 15px; display: inline-block; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);\">\n                 <span style=\"font-size: 18px; font-weight: bold; color: #fff;\">EST. 2001</span></div></td>\n          </tr>\n        </tbody></table>\n      </div>\n      <div style=\"height: 1px; background: rgba(255,255,255,0.1);\"></div>\n    ', '\n      <div style=\"background: #333; color: #fff; padding: 40px; font-family: sans-serif;\">\n        <table style=\"width: 100%;\" cellpadding=\"0\" cellspacing=\"0\">\n          <tbody><tr>\n            <td style=\"width: 60%; padding-right: 20px;\">\n              <div style=\"font-size: 20px; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 10px; margin-bottom: 15px; color: #fff;\">\n                Komal Chemiequip Pvt. Ltd.\n              </div>\n              <div style=\"font-size: 13px; line-height: 1.8; color: #ccc;\">\n                #48, Noothanchery, Madambakkam, Chennai - 600 126, India<br>\n                Ph: +91 97395 33800 | +91 95000 00000<br>\n                Email: hydrogenmktg@tiaano.com | Web: www.hydrogenanode.com\n              </div>\n            </td>\n            <td style=\"width: 40%; vertical-align: top; text-align: right;\">\n              <div style=\"font-size: 14px; font-weight: bold; margin-bottom: 10px;\">Connect With Us</div>\n              <div>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/174/174848.png\" width=\"24\" height=\"24\" alt=\"FB\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/174/174855.png\" width=\"24\" height=\"24\" alt=\"IG\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/3536/3536505.png\" width=\"24\" height=\"24\" alt=\"LI\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/733/733579.png\" width=\"24\" height=\"24\" alt=\"TW\"></a>\n              </div>\n            </td>\n          </tr>\n        </tbody></table>\n        <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #444; font-size: 11px; color: #888; text-align: center;\">\n          Copyright © 2026 Komal Chemiequip Pvt. Ltd.. All rights reserved.<br>\n          You are receiving this email because you are a valued customer of Komal Chemiequip Pvt. Ltd..\n        </div>\n      </div>\n      <div style=\"background: #e0f7fa; height: 10px;\"></div>\n    ', '#1e3a5f', 'all', NULL, 'Existing', 'Komal Chemiequip Pvt. Ltd.', 0, 0, 0, 0, 0, 'draft', '2026-04-22 00:47:11', '2026-04-22 22:03:16', NULL),
(19, 1, 'KCPL-2 Testing', '', '\n\n\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Submersible Plating Barrels</title>\n\n\n\n\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n<tbody><tr>\n<td align=\"center\">\n\n<!-- Main Container -->\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:800px; background:#ffffff; margin:20px auto; padding:20px; border-radius:6px; text-align:left; word-break:break-word;\">\n\n<!-- Header -->\n<tbody><tr>\n<td style=\"padding-bottom:15px;\">\n<img src=\"https://www.komalchemiequip.com/images/logo.png\" alt=\"Komal Chemiequip\" style=\"max-width:220px;\">\n</td>\n</tr>\n\n<tr>\n<td style=\"font-size:20px; font-weight:bold; color:#333; padding-bottom:10px;\">\nUpgrade Your Plating Efficiency with Advanced Submersible Barrels\n</td>\n</tr>\n\n<tr>\n<td style=\"font-size:14px; color:#555; line-height:1.6; word-break:break-word;\">\nDear Sir / Madam,<br><br>\nGreetings from <strong>Komal Chemiequip Pvt. Ltd.</strong>.<br><br>\n\nWe are pleased to introduce our <strong>Submersible Plating Barrels</strong>, designed for high productivity, consistent coating quality, and reduced operational costs.\n</td>\n</tr>\n\n<!-- Product Image -->\n<tr>\n<td style=\"padding-top:15px;\">\n<img src=\"https://www.komalchemiequip.com/images/submersible-plating-barrel.jpg\" alt=\"Submersible Plating Barrel\" style=\"width:100%; max-width:100%; height:auto; border-radius:6px;\">\n</td>\n</tr>\n\n<!-- Overview -->\n<tr>\n<td style=\"padding-top:15px; font-size:14px; color:#555; line-height:1.6; word-break:break-word;\">\nOur fully submerged barrel systems are manufactured using high-quality <strong>PP / Perspex / CPVC materials</strong>, ensuring durability and chemical resistance.\n</td>\n</tr>\n\n<!-- Features -->\n<tr>\n<td style=\"padding-top:15px;\">\n<strong style=\"color:#333;\">Key Features:</strong>\n<ul style=\"font-size:14px; color:#555; line-height:1.6; padding-left:18px; margin:10px 0;\">\n<li>Ideal for bulk plating of small components</li>\n<li>Uniform coating with superior finish</li>\n<li>Geared motor drive system (AC / DC options)</li>\n<li>Reduced labor and operational cost</li>\n<li>Continuous industrial operation capability</li>\n<li>Custom-built designs available</li>\n</ul>\n</td>\n</tr>\n\n<!-- Table -->\n<tr>\n<td style=\"padding-top:10px;\">\n<strong style=\"color:#333;\">Standard Capacity Range:</strong><br><br>\n\n<table width=\"100%\" border=\"1\" cellspacing=\"0\" cellpadding=\"8\" style=\"border-collapse:collapse; font-size:13px; text-align:left; table-layout:fixed; word-break:break-word;\">\n\n<tbody><tr style=\"background:#0073aa; color:#fff;\">\n<th style=\"width:25%;\">Capacity</th>\n<th style=\"width:25%;\">Volume</th>\n<th style=\"width:25%;\">Barrel Size</th>\n<th style=\"width:25%;\">Motor</th>\n</tr>\n\n<tr>\n<td>7 Kg</td>\n<td>205 L</td>\n<td>12\" x 8\"</td>\n<td>0.125 HP</td>\n</tr>\n\n<tr>\n<td>15 Kg</td>\n<td>600 L</td>\n<td>18\" x 10\"</td>\n<td>0.25 HP</td>\n</tr>\n\n<tr>\n<td>20 Kg</td>\n<td>750 L</td>\n<td>24\" x 10\"</td>\n<td>0.25 HP</td>\n</tr>\n\n<tr>\n<td>30 Kg</td>\n<td>900 L</td>\n<td>30\" x 15\"</td>\n<td>0.5 HP</td>\n</tr>\n\n<tr>\n<td>50 Kg</td>\n<td>1200 L</td>\n<td>36\" x 16\"</td>\n<td>1.0 HP</td>\n</tr>\n\n</tbody></table>\n\n</td>\n</tr>\n\n<!-- CTA -->\n<tr>\n<td style=\"padding:25px 0;\">\n<a href=\"https://www.komalchemiequip.com/Submersible%20Plating%20Barrels%20new.htm\" style=\"background:#0073aa; color:#ffffff; padding:12px 25px; text-decoration:none; font-size:14px; border-radius:4px; display:inline-block;\">\nView Product Details\n</a>\n</td>\n</tr>\n\n<!-- Footer -->\n<tr>\n<td style=\"font-size:14px; color:#555; line-height:1.6; word-break:break-word;\">\nWe would be happy to understand your requirement and suggest the right solution for your plating process.\n</td>\n</tr>\n\n<tr>\n<td style=\"padding-top:15px; font-size:14px; color:#333; line-height:1.6;\">\n<strong>Komal Chemiequip Pvt. Ltd.</strong><br>\nNavi Mumbai, India<br>\nEmail: info@komalchemiequip.com<br>\nPhone: +91-22-2826 4715\n</td>\n</tr>\n\n</tbody></table>\n\n</td>\n</tr>\n</tbody></table>\n\n\n', '\n      <div style=\"background:#1e3a5f; padding: 30px 40px; border-bottom: 5px solid rgba(0,0,0,0.1);\">\n        <table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\">\n          <tbody><tr>\n            <td style=\"vertical-align: middle;\">\n              <div style=\"font-size: 32px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px;\">\n                Komal Chemiequip Pvt. Ltd.\n              </div>\n              <div style=\"font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 5px; font-style: italic;\">\n                Innovation in Every Step\n              </div>\n            </td>\n            <td style=\"text-align: right; vertical-align: middle;\">\n               <div style=\"background: rgba(255,255,255,0.2); padding: 10px 15px; display: inline-block; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);\">\n                 <span style=\"font-size: 18px; font-weight: bold; color: #fff;\">EST. 1992</span>\n               </div>\n            </td>\n          </tr>\n        </tbody></table>\n      </div>\n      <div style=\"height: 1px; background: rgba(255,255,255,0.1);\"></div>\n    ', '\n      <div style=\"background: #333; color: #fff; padding: 40px; font-family: sans-serif;\">\n        <table style=\"width: 100%;\" cellpadding=\"0\" cellspacing=\"0\">\n          <tbody><tr>\n            <td style=\"width: 60%; padding-right: 20px;\">\n              <div style=\"font-size: 20px; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 10px; margin-bottom: 15px; color: #fff;\">\n                Komal Chemiequip Pvt. Ltd.\n              </div>\n              <div style=\"font-size: 13px; line-height: 1.8; color: #ccc;\">\n                #48, Noothanchery, Madambakkam, Chennai - 600 126, India<br>\n                Ph: +91 97395 33800 | +91 95000 00000<br>\n                Email: hydrogenmktg@tiaano.com | Web: www.hydrogenanode.com\n              </div>\n            </td>\n            <td style=\"width: 40%; vertical-align: top; text-align: right;\">\n              <div style=\"font-size: 14px; font-weight: bold; margin-bottom: 10px;\">Connect With Us</div>\n              <div>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/174/174848.png\" width=\"24\" height=\"24\" alt=\"FB\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/174/174855.png\" width=\"24\" height=\"24\" alt=\"IG\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/3536/3536505.png\" width=\"24\" height=\"24\" alt=\"LI\"></a>\n                <a href=\"#\" style=\"display:inline-block; margin-left: 10px; text-decoration:none;\"><img src=\"https://cdn-icons-png.flaticon.com/32/733/733579.png\" width=\"24\" height=\"24\" alt=\"TW\"></a>\n              </div>\n            </td>\n          </tr>\n        </tbody></table>\n        <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #444; font-size: 11px; color: #888; text-align: center;\">\n          Copyright © 2026 Komal Chemiequip Pvt. Ltd.. All rights reserved.<br>\n          You are receiving this email because you are a valued customer of Komal Chemiequip Pvt. Ltd..\n        </div>\n      </div>\n      <div style=\"background: #e0f7fa; height: 10px;\"></div>\n    ', '#1e3a5f', 'all', NULL, 'Existing', 'Komal Chemiequip Pvt. Ltd.', 0, 0, 0, 0, 0, 'draft', '2026-04-22 22:25:13', '2026-04-23 09:16:15', NULL);

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
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(42, 'sukundg@gmail.com', '497513', '2026-04-17 09:39:05', 0, '2026-04-17 04:04:05'),
(43, 'shukundgupta@gmail.com', '917412', '2026-04-17 21:49:37', 0, '2026-04-17 16:14:36'),
(44, 'sukundg@gmail.com', '976153', '2026-04-17 21:50:45', 0, '2026-04-17 16:15:45'),
(45, 'sukundg@gmail.com', '652533', '2026-04-17 21:59:47', 0, '2026-04-17 16:24:47'),
(46, 'shukundgupta@gmail.com', '130235', '2026-04-17 22:22:06', 0, '2026-04-17 16:47:05'),
(47, 'admin@tiaano.com', '637277', '2026-04-21 09:12:31', 0, '2026-04-21 03:37:30');

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
  UNIQUE KEY `unique_email_per_company` (`email`,`company_id`),
  KEY `company_id` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `company_id`, `role`, `created_at`) VALUES
(1, 'Admin', 'info@komalchemiequip.com', '$2b$10$cDtEXEHLMsgrPySo4EBez.GmRCyOmCnHQvvLFiFWHrdRl3VOtaI6S', 1, 'admin', '2026-04-04 03:41:17'),
(2, 'Admin', 'info@arnavagencies.com', '$2b$10$bzEp.e8r2cWF85R3z5pKsOjohAM/OgS7S1Tb97Ymyk0cTHye4auXW', 2, 'admin', '2026-04-04 03:41:17'),
(3, 'Shukund', 'shukundgupta@gmail.com', '$2b$10$Bxr0qWsOQ3uk7//w9QSre./fBjeNaig.HOBKGDCwNRRJvIYGd9UAG', 1, 'user', '2026-04-17 03:49:49'),
(4, 'Shukund', 'sukundg@gmail.com', '$2b$10$vYityFIE5Wn67hLNj1G40.NGPQKICTDBQLZ4vr6SBReR/P1FI3ZEK', 1, 'user', '2026-04-17 04:05:22'),
(5, 'Shukund', 'sukundg@gmail.com', '$2b$10$TS8mIAYiNnQfytqSyNVas.d3oOtoZv3y2iVspDtTl//X3wOjZwroO', 2, 'user', '2026-04-17 16:25:14'),
(6, 'Shukund', 'shukundgupta@gmail.com', '$2b$10$DDqoqpGW84LMDzjipMvJJuS66YJAyw0XcC7abhirLhHzFQuPmSzta', 2, 'user', '2026-04-17 16:47:57');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

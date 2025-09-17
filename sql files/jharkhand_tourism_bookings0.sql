-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: jharkhand_tourism
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `provider_id` varchar(255) DEFAULT NULL,
  `destination_id` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `destination_name` varchar(255) NOT NULL,
  `booking_date` date NOT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `guests` int DEFAULT '1',
  `rooms` int DEFAULT '1',
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `total_price` decimal(10,2) NOT NULL,
  `special_requests` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `package_type` varchar(50) DEFAULT NULL,
  `package_name` varchar(100) DEFAULT NULL,
  `addons` text,
  `booking_full_name` varchar(255) DEFAULT NULL COMMENT 'Full name entered in booking form',
  `booking_email` varchar(255) DEFAULT NULL COMMENT 'Email entered in booking form',
  `booking_phone` varchar(20) DEFAULT NULL COMMENT 'Phone number entered in booking form',
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `destination_id` (`destination_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_user_id` (`user_id`),
  KEY `idx_bookings_date` (`booking_date`),
  KEY `idx_booking_email` (`booking_email`),
  KEY `idx_booking_phone` (`booking_phone`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('1','user1','1','1','Priya Sharma','Ranchi City Tours','Ranchi','2025-02-15','2025-02-15','2025-02-18',2,1,'confirmed',13500.00,NULL,'2025-09-05 16:42:16','2025-09-05 16:42:16',NULL,NULL,NULL,NULL,NULL,NULL),('162c917c-b947-4ffa-9aaf-b555bff21910','9ffdf221-c444-4eb2-b15b-8f9693adc0b0','2','2','hello','Netarhat Trekking Adventures','Netarhat','2025-09-19','2025-09-19','2025-09-26',1,1,'pending',30999.00,'yess\nOrigin: assam\nAdd-ons: photography, meals','2025-09-15 19:13:18','2025-09-15 19:13:18','adventure','Adventure Seeker','[\"photography\",\"meals\"]',NULL,NULL,NULL),('2','user2','2','2','Raj Patel','Netarhat Trekking Adventures','Netarhat','2025-03-20','2025-03-20','2025-03-23',2,1,'pending',17000.00,NULL,'2025-09-05 16:42:16','2025-09-05 16:42:16',NULL,NULL,NULL,NULL,NULL,NULL),('3','user3','3','3','Anita Kumar','Betla Safari Services','Betla National Park','2025-01-10','2025-01-10','2025-01-13',4,2,'completed',21000.00,NULL,'2025-09-05 16:42:16','2025-09-05 16:42:16',NULL,NULL,NULL,NULL,NULL,NULL),('3b6e863f-2c4d-4564-95b5-d666617b3d51','9ffdf221-c444-4eb2-b15b-8f9693adc0b0','4','4','hello','Parasnath Pilgrimage Guide','Parasnath Hill','2025-09-17','2025-09-17','2025-09-23',2,1,'pending',40998.00,'na\nOrigin: Delhi\nAdd-ons: meals','2025-09-17 08:16:19','2025-09-17 08:16:19','spiritual','Spiritual Journey','[\"meals\"]',NULL,NULL,NULL),('40954732-9e59-4361-840b-f0542c89a7bb','3ca9ab82-db5c-459c-84bb-6d154b929cac','1','1','jharkhand123@gmail.com','Ranchi City Tours','Ranchi','2025-10-04','2025-10-04','2025-10-14',9,5,'pending',121500.00,'dietary\nOrigin: mumbai\nAdd-ons: meals','2025-09-13 18:22:35','2025-09-13 18:22:35',NULL,NULL,NULL,NULL,NULL,NULL),('44764409-be18-426b-8982-82407adfca0c','3ca9ab82-db5c-459c-84bb-6d154b929cac','1','1','jharkhand123@gmail.com','Ranchi City Tours','Ranchi','2025-09-13','2025-09-13','2025-09-18',1,1,'pending',13500.00,'clean\nOrigin: bihar\nAdd-ons: meals','2025-09-13 18:00:28','2025-09-13 18:00:28',NULL,NULL,NULL,NULL,NULL,NULL),('4e0cb2a6-281f-43e0-a8fa-ffbf2051d20a','7ed89032-84ce-444f-a543-4fea2427c74c','3','3','Test User','Betla Safari Services','Betla National Park','2025-09-16','2025-09-16','2025-09-26',1,1,'pending',38999.00,'yesss\nOrigin: pune\nAdd-ons: meals','2025-09-16 00:04:14','2025-09-16 00:04:14','premium','Premium Experience','[\"meals\"]',NULL,NULL,NULL),('9cf6508d-60ce-438b-9c63-6b516d1f385a','9ffdf221-c444-4eb2-b15b-8f9693adc0b0','prov_ranchi_guide_1','1','hello','Ranchi Heritage Tours','Ranchi','2025-09-27','2025-09-27','2025-10-02',1,1,'pending',20999.00,'nhi\nOrigin: pune\nAdd-ons: photography','2025-09-17 20:38:33','2025-09-17 20:38:33','heritage','Heritage Explorer','[\"photography\"]',NULL,NULL,NULL),('a3124304-5f88-4580-97d6-3a575c2ece5c','3ca9ab82-db5c-459c-84bb-6d154b929cac','1','1','jharkhand123@gmail.com','Ranchi City Tours','Ranchi','2025-09-13','2025-09-13','2025-09-23',1,1,'pending',13500.00,'nvhj\nOrigin: bihar','2025-09-13 18:07:08','2025-09-13 18:07:08',NULL,NULL,NULL,NULL,NULL,NULL),('b752a6ba-0227-4780-9acf-cc5cb3885e65','3ca9ab82-db5c-459c-84bb-6d154b929cac','1','1','jharkhand123@gmail.com','Ranchi City Tours','Ranchi','2025-09-13','2025-09-13','2025-09-23',1,1,'pending',13500.00,'none\nOrigin: bihar\nAdd-ons: meals','2025-09-13 18:05:50','2025-09-13 18:05:50',NULL,NULL,NULL,NULL,NULL,NULL),('fa016433-a870-4b56-9d80-4c05669d590d','9ffdf221-c444-4eb2-b15b-8f9693adc0b0','1','1','hello','Ranchi City Tours','Ranchi','2025-09-15','2025-09-15','2025-09-25',1,1,'pending',13500.00,'hh\nOrigin: Delhi\nAdd-ons: pickup, photography, insurance, meals','2025-09-15 17:40:23','2025-09-15 17:40:23',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18  2:35:41

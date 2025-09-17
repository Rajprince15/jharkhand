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
-- Table structure for table `destinations`
--

DROP TABLE IF EXISTS `destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinations` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `highlights` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `region` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_destinations_category` (`category`),
  KEY `idx_destinations_rating` (`rating`),
  KEY `idx_destinations_price` (`price`),
  KEY `idx_destinations_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinations`
--

LOCK TABLES `destinations` WRITE;
/*!40000 ALTER TABLE `destinations` DISABLE KEYS */;
INSERT INTO `destinations` VALUES ('1','Ranchi','Ranchi, Jharkhand, India','The capital city of Jharkhand with scenic waterfalls and cultural attractions.','https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800',4.6,12000.00,'City','[\"Tagore Hill\", \"Rock Garden\", \"Hundru Falls\", \"Ranchi Lake\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','east'),('10','Dimna Lake','Jamshedpur, Jharkhand, India','Popular recreational lake surrounded by lush green hills.','https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800',4.8,12500.00,'Nature','[\"Boating\", \"Fishing\", \"Picnic\", \"Sunset Views\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','south'),('2','Netarhat','Netarhat, Jharkhand, India','A beautiful hill station known as the \"Queen of Chotanagpur\".','https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800',4.8,15000.00,'Hill Station','[\"Sunrise Point\", \"Waterfalls\", \"Mahuadanr\", \"Forest Trails\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','west'),('3','Betla National Park','Latehar, Jharkhand, India','Wildlife sanctuary with tigers, elephants, and lush forest trails.','https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800',4.7,18000.00,'Wildlife','[\"Safari\", \"Elephant Spotting\", \"Bird Watching\", \"Nature Walks\"]','2025-09-05 16:42:16','2025-09-17 16:03:21','north'),('4','Parasnath Hill','Giridih, Jharkhand, India','Sacred Jain pilgrimage site with panoramic views from the top of the hill.','https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=800',4.9,14000.00,'Religious','[\"Jain Temples\", \"Trekking\", \"Sunset Views\", \"Meditation Spots\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','north'),('6','Dhanbad Coalfield Tour','Dhanbad, Jharkhand, India','Explore the historic coal mining regions and learn about industrial heritage.','https://images.pexels.com/photos/348519/pexels-photo-348519.jpeg?auto=compress&cs=tinysrgb&w=800',4.4,10000.00,'Industrial Tourism','[\"Coal Mines\", \"Mining Museum\", \"Local Market\", \"Railway Views\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','east'),('7','Jonha Falls','Ranchi, Jharkhand, India','A majestic waterfall surrounded by dense forest and natural beauty.','https://images.pexels.com/photos/340874/pexels-photo-340874.jpeg?auto=compress&cs=tinysrgb&w=800',4.6,13000.00,'Nature','[\"Waterfall Viewing\", \"Photography\", \"Hiking\", \"Picnic\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','east'),('8','Rajrappa Temple','Ramgarh, Jharkhand, India','Famous Hindu temple dedicated to Goddess Chhinnamasta with spiritual significance.','https://images.pexels.com/photos/238106/pexels-photo-238106.jpeg?auto=compress&cs=tinysrgb&w=800',4.7,12000.00,'Religious','[\"Temple Visit\", \"Riverside Views\", \"Festivals\", \"Local Culture\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','south'),('9','Deori Temple','Giridih, Jharkhand, India','Ancient temple with cultural and historic significance.','https://images.pexels.com/photos/541114/pexels-photo-541114.jpeg?auto=compress&cs=tinysrgb&w=800',4.5,11500.00,'Religious','[\"Temple Tour\", \"Cultural Exploration\", \"Photography\"]','2025-09-05 16:42:16','2025-09-17 10:20:51','north');
/*!40000 ALTER TABLE `destinations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18  0:06:24

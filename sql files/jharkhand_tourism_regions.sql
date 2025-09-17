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
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `highlights` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES ('1','East Jharkhand','Eastern region of Jharkhand featuring the capital city and major attractions','https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800','[\"Ranchi\", \"Jonha Falls\", \"Urban Culture\", \"Government Seat\"]','2025-09-17 16:03:21','2025-09-17 16:03:21'),('2','West Jharkhand','Western region known for hill stations and natural beauty','https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800','[\"Netarhat\", \"Hill Stations\", \"Sunrise Points\", \"Cool Climate\"]','2025-09-17 16:03:21','2025-09-17 16:03:21'),('3','North Jharkhand','Northern region with wildlife sanctuaries and religious sites','https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800','[\"Betla National Park\", \"Parasnath Hill\", \"Wildlife\", \"Pilgrimage\"]','2025-09-17 16:03:21','2025-09-17 16:03:21'),('4','South Jharkhand','Southern region with industrial heritage and lakes','https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800','[\"Dimna Lake\", \"Jamshedpur\", \"Industrial Tourism\", \"Lakes\"]','2025-09-17 16:03:21','2025-09-17 16:03:21'),('east','East Jharkhand','Home to the capital city Ranchi and major urban centers with scenic waterfalls and cultural attractions','https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxqaGFya2hhbmQlMjB0b3VyaXNtfGVufDB8fHx8MTc1NzMzNTU0MXww&ixlib=rb-4.1.0&q=85','[\"Ranchi\", \"Hundru Falls\", \"Jonha Falls\", \"Urban Culture\"]','2025-09-17 10:17:12','2025-09-17 10:17:12'),('north','North Jharkhand','Spiritual destinations, sacred hills and religious sites with panoramic views','https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxqaGFya2hhbmQlMjB0b3VyaXNtfGVufDB8fHx8MTc1NzMzNTU0MXww&ixlib=rb-4.1.0&q=85','[\"Parasnath Hill\", \"Deoghar Temple\", \"Giridih\", \"Spiritual Tourism\"]','2025-09-17 10:17:12','2025-09-17 10:17:12'),('south','South Jharkhand','Industrial heritage, scenic lakes and modern urban development','https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxqaGFya2hhbmR8ZW58MHx8fHwxNzU3MTY2NzE0fDA&ixlib=rb-4.1.0&q=85','[\"Jamshedpur\", \"Dimna Lake\", \"Steel City\", \"Industrial Tourism\"]','2025-09-17 10:17:12','2025-09-17 10:17:12'),('west','West Jharkhand','Wildlife sanctuaries, pristine forests and the beautiful hill station Netarhat for nature lovers','https://images.unsplash.com/photo-1662018508173-c686afc56b48?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxqaGFya2hhbmR8ZW58MHx8fHwxNzU3MTY2NzE0fDA&ixlib=rb-4.1.0&q=85','[\"Betla National Park\", \"Netarhat\", \"Wildlife Safari\", \"Forest Trails\"]','2025-09-17 10:17:12','2025-09-17 10:17:12');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
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

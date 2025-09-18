CREATE DATABASE  IF NOT EXISTS `jharkhand_tourism` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `jharkhand_tourism`;
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
INSERT INTO `regions` VALUES ('kolhan','Kolhan Division','Kolhan Division comprises districts like East Singhbhum, West Singhbhum, and Seraikela-Kharsawan. Known for steel cities, tribal culture, and industrial heritage.','https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxqaGFya2hhbmQlMjB0b3VyaXNtfGVufDB8fHx8MTc1ODE3NTM2M3ww&ixlib=rb-4.1.0&q=85','[\"Jamshedpur\", \"Steel City\", \"Dimna Lake\", \"Industrial Heritage\", \"Tribal Culture\"]','2025-09-18 06:11:32','2025-09-18 06:11:32'),('north_chotanagpur','North Chhotanagpur Division','North Chhotanagpur Division includes Hazaribagh, Dhanbad, Bokaro, Giridih, Ramgarh, and Chatra districts. Known for coal mining and wildlife sanctuaries.','https://images.unsplash.com/photo-1583477041518-b244705d89e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxqaGFya2hhbmQlMjByZWdpb25zfGVufDB8fHx8MTc1ODE3NTM2OHww&ixlib=rb-4.1.0&q=85','[\"Hazaribagh National Park\", \"Parasnath Hill\", \"Coal Mining Heritage\", \"Betla Wildlife\", \"Dhanbad\"]','2025-09-18 06:11:32','2025-09-18 06:11:32'),('santhal_pargana','Santhal Pargana Division','Santhal Pargana Division includes Dumka, Deoghar, Godda, Jamtara, Pakur, and Sahibganj districts. Famous for religious sites and Santhal tribal heritage.','https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxqaGFya2hhbmQlMjByZWdpb25zfGVufDB8fHx8MTc1ODE3NTM2OHww&ixlib=rb-4.1.0&q=85','[\"Deoghar Temple\", \"Baidyanath Dham\", \"Santhal Culture\", \"Dumka\", \"Religious Tourism\"]','2025-09-18 06:11:32','2025-09-18 06:11:32'),('south_chotanagpur','South Chhotanagpur Division','South Chhotanagpur Division covers Ranchi, Khunti, Gumla, Simdega, and Lohardaga districts. Home to the state capital and scenic waterfalls.','https://images.pexels.com/photos/33587326/pexels-photo-33587326.jpeg','[\"Ranchi Capital\", \"Hundru Falls\", \"Jonha Falls\", \"Rock Garden\", \"Tagore Hill\"]','2025-09-18 06:11:32','2025-09-18 06:11:32');
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

-- Dump completed on 2025-09-18 13:08:04

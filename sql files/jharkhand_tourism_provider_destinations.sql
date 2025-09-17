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
-- Table structure for table `provider_destinations`
--

DROP TABLE IF EXISTS `provider_destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_destinations` (
  `id` varchar(255) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `destination_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_destination` (`provider_id`,`destination_id`),
  KEY `idx_provider_destinations_provider` (`provider_id`),
  KEY `idx_provider_destinations_destination` (`destination_id`),
  CONSTRAINT `provider_destinations_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `provider_destinations_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_destinations`
--

LOCK TABLES `provider_destinations` WRITE;
/*!40000 ALTER TABLE `provider_destinations` DISABLE KEYS */;
INSERT INTO `provider_destinations` VALUES ('pd1','prov_ranchi_guide_1','1','2025-09-17 16:03:21'),('pd10','prov_dimna_water_1','10','2025-09-17 16:03:21'),('pd11','prov_dimna_restaurant_1','10','2025-09-17 16:03:21'),('pd12','prov_ranchi_transport_1','7','2025-09-17 16:03:21'),('pd2','prov_ranchi_transport_1','1','2025-09-17 16:03:21'),('pd3','prov_ranchi_hotel_1','1','2025-09-17 16:03:21'),('pd4','prov_netarhat_guide_1','2','2025-09-17 16:03:21'),('pd5','prov_netarhat_hotel_1','2','2025-09-17 16:03:21'),('pd6','prov_betla_safari_1','3','2025-09-17 16:03:21'),('pd7','prov_betla_guide_1','3','2025-09-17 16:03:21'),('pd8','prov_parasnath_guide_1','4','2025-09-17 16:03:21'),('pd9','prov_parasnath_transport_1','4','2025-09-17 16:03:21');
/*!40000 ALTER TABLE `provider_destinations` ENABLE KEYS */;
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

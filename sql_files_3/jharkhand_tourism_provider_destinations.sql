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
INSERT INTO `provider_destinations` VALUES ('pd_001','prov_001','8','2025-09-18 07:32:27'),('pd_002','prov_001','22','2025-09-18 07:32:27'),('pd_003','prov_001','37','2025-09-18 07:32:27'),('pd_004','prov_001','36','2025-09-18 07:32:27'),('pd_005','prov_001','63','2025-09-18 07:32:27'),('pd_006','prov_002','2','2025-09-18 07:32:27'),('pd_007','prov_002','4','2025-09-18 07:32:27'),('pd_008','prov_002','6','2025-09-18 07:32:27'),('pd_009','prov_002','59','2025-09-18 07:32:27'),('pd_010','prov_002','15','2025-09-18 07:32:27'),('pd_011','prov_003','37','2025-09-18 07:32:27'),('pd_012','prov_003','64','2025-09-18 07:32:27'),('pd_013','prov_003','32','2025-09-18 07:32:27'),('pd_014','prov_003','33','2025-09-18 07:32:27'),('pd_015','prov_003','27','2025-09-18 07:32:27'),('pd_016','prov_004','8','2025-09-18 07:32:27'),('pd_017','prov_004','65','2025-09-18 07:32:27'),('pd_018','prov_004','9','2025-09-18 07:32:27'),('pd_019','prov_004','11','2025-09-18 07:32:27'),('pd_020','prov_004','10','2025-09-18 07:32:27'),('pd_021','prov_005','3','2025-09-18 07:32:27'),('pd_022','prov_005','40','2025-09-18 07:32:27'),('pd_023','prov_005','44','2025-09-18 07:32:27'),('pd_024','prov_005','57','2025-09-18 07:32:27'),('pd_025','prov_005','62','2025-09-18 07:32:27'),('pd_026','prov_006','5','2025-09-18 07:32:27'),('pd_027','prov_006','63','2025-09-18 07:32:27'),('pd_028','prov_006','22','2025-09-18 07:32:27'),('pd_029','prov_006','23','2025-09-18 07:32:27'),('pd_030','prov_006','24','2025-09-18 07:32:27'),('pd_031','prov_007','46','2025-09-18 07:32:27'),('pd_032','prov_007','62','2025-09-18 07:32:27'),('pd_033','prov_007','48','2025-09-18 07:32:27'),('pd_034','prov_007','40','2025-09-18 07:32:27'),('pd_035','prov_007','44','2025-09-18 07:32:27'),('pd_036','prov_008','36','2025-09-18 07:32:27'),('pd_037','prov_008','66','2025-09-18 07:32:27'),('pd_038','prov_008','71','2025-09-18 07:32:27'),('pd_039','prov_008','20','2025-09-18 07:32:27'),('pd_040','prov_008','41','2025-09-18 07:32:27'),('pd_041','prov_009','59','2025-09-18 07:32:27'),('pd_042','prov_009','19','2025-09-18 07:32:27'),('pd_043','prov_009','15','2025-09-18 07:32:27'),('pd_044','prov_009','4','2025-09-18 07:32:27'),('pd_045','prov_009','2','2025-09-18 07:32:27'),('pd_046','prov_010','61','2025-09-18 07:32:27'),('pd_047','prov_010','68','2025-09-18 07:32:27'),('pd_048','prov_010','7','2025-09-18 07:32:27'),('pd_049','prov_010','51','2025-09-18 07:32:27'),('pd_050','prov_010','52','2025-09-18 07:32:27');
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

-- Dump completed on 2025-09-18 13:08:04

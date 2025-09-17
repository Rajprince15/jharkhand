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
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `providers` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('guide','transport','accommodation','activity') NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(2,1) DEFAULT '4.5',
  `location` varchar(255) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_providers_category` (`category`),
  KEY `idx_providers_location` (`location`),
  KEY `idx_providers_rating` (`rating`),
  CONSTRAINT `providers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `providers`
--

LOCK TABLES `providers` WRITE;
/*!40000 ALTER TABLE `providers` DISABLE KEYS */;
INSERT INTO `providers` VALUES ('1','provider1','Ranchi City Tours','guide','City Guide for Ranchi','Experienced local guide providing tours across Ranchi\'s top spots.',1500.00,4.8,'Ranchi','+91 98765 43210','https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('2','provider1','Netarhat Trekking Adventures','guide','Hill Station Trekking Guide','Professional trekking guide for Netarhat and surrounding hills.',2000.00,4.9,'Netarhat','+91 87654 32109','https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('3','provider2','Betla Safari Services','transport','Wildlife Safari Experience','Jeep safari and wildlife photography tours in Betla National Park.',3000.00,4.7,'Betla National Park','+91 76543 21098','https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('4','provider1','Parasnath Pilgrimage Guide','guide','Religious Tour Guide','Expert guide for Parasnath Hill and nearby Jain temples.',1800.00,4.6,'Parasnath Hill','+91 65432 10987','https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('5','provider1','Hirakud Waterfalls Adventure','guide','Nature Trek and Adventure','Guided trekking and adventure around Hirakud Waterfalls.',1600.00,4.5,'Hazaribagh','+91 99887 77665','https://images.pexels.com/photos/373551/pexels-photo-373551.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('6','provider2','Dimna Lake Boating','transport','Boat Ride Experience','Boating services and lakeside activities at Dimna Lake.',1200.00,4.8,'Jamshedpur','+91 98765 11223','https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('7','provider1','Rajrappa Temple Guide','guide','Religious Tour Guide','Local guide for Rajrappa Temple and surrounding attractions.',1300.00,4.7,'Ramgarh','+91 91234 56789','https://images.pexels.com/photos/238106/pexels-photo-238106.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('8','provider1','Deori Temple Guide','guide','Cultural and Religious Guide','Expert guide for Deori Temple and historic sites in Giridih.',1400.00,4.6,'Giridih','+91 92345 67890','https://images.pexels.com/photos/541114/pexels-photo-541114.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-05 16:42:16','2025-09-05 16:42:16'),('prov_betla_guide_1','provider2','Betla Nature Guides','guide','Wildlife & Nature Tours','Experienced local guides for wildlife spotting and nature walks in Betla.',2200.00,4.6,'Betla National Park','+91 98765 77777','https://images.pexels.com/photos/1172105/pexels-photo-1172105.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_betla_safari_1','provider1','Betla Wildlife Safaris','activity','Jeep Safari & Wildlife Photography','Professional wildlife safari with expert naturalist guides and photography assistance.',3500.00,4.8,'Betla National Park','+91 98765 66666','https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_dimna_restaurant_1','provider2','Lakeview Restaurant','accommodation','Lakeside Dining Experience','Multi-cuisine restaurant with beautiful lake views and fresh local ingredients.',1200.00,4.3,'Dimna Lake','+91 98765 20202','https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_dimna_water_1','provider1','Dimna Lake Water Sports','activity','Boating & Water Activities','Boating, kayaking and other water sports at beautiful Dimna Lake.',1800.00,4.5,'Dimna Lake','+91 98765 10101','https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_netarhat_guide_1','provider1','Netarhat Hill Adventures','guide','Netarhat Trekking & Sunrise Tours','Experience the Queen of Chotanagpur with guided treks and sunrise point visits.',2800.00,4.9,'Netarhat','+91 98765 44444','https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_netarhat_hotel_1','provider2','Hill View Resort Netarhat','accommodation','Hill Station Resort','Beautiful resort with panoramic views of Netarhat hills and valleys.',4500.00,4.7,'Netarhat','+91 98765 55555','https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_parasnath_guide_1','provider1','Parasnath Pilgrimage Services','guide','Jain Temple Tours & Trekking','Spiritual tours and trekking to Parasnath Hill Jain temples with religious significance explanations.',2000.00,4.7,'Parasnath Hill','+91 98765 88888','https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_parasnath_transport_1','provider2','Parasnath Hill Transport','transport','Hill Transportation Service','Safe and reliable transportation to Parasnath Hill summit and temples.',1500.00,4.5,'Parasnath Hill','+91 98765 99999','https://images.pexels.com/photos/1164674/pexels-photo-1164674.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_ranchi_guide_1','provider1','Ranchi Heritage Tours','guide','Complete Ranchi City Tour','Professional guided tours covering all major Ranchi attractions including Tagore Hill, Rock Garden, and Hundru Falls.',2500.00,4.8,'Ranchi','+91 98765 11111','https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_ranchi_hotel_1','provider1','Ranchi Stay Inn','accommodation','Budget Hotel Accommodation','Clean and comfortable budget accommodation in heart of Ranchi city.',1800.00,4.4,'Ranchi','+91 98765 33333','https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21'),('prov_ranchi_transport_1','provider2','Ranchi Cab Services','transport','Private Car Rental','Comfortable AC cars for Ranchi sightseeing with experienced drivers.',3000.00,4.6,'Ranchi','+91 98765 22222','https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',1,'2025-09-17 16:03:21','2025-09-17 16:03:21');
/*!40000 ALTER TABLE `providers` ENABLE KEYS */;
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

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('tourist','provider','admin') DEFAULT 'tourist',
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('3ca9ab82-db5c-459c-84bb-6d154b929cac','jharkhand123@gmail.com','jharkhand123@gmail.com','$2b$12$qzB9fqQdhINR6.0eLsD1IObq3Eoi4HlOiMaUdDKJDkr7NzeihVXBm','tourist','1212121212','2025-09-13 17:42:14','2025-09-13 17:42:14'),('41dcf55b-cd77-4f1c-b356-14adef0b076a','prov','provider@test.com','$2b$12$YA/JdZEGJUqSzefwfA7HoOYXe3gRVy1mnAqBsvcyBWb26LDZu51rG','provider','11425241','2025-09-17 11:57:14','2025-09-17 11:57:14'),('59946a8a-8ff6-4c86-b587-8bad8ca82338','Rahul','rahul@example.com','$2b$12$V0AvP8YNRfMCnpCjD8dl7OV89//sqZqO0XstRPDB/o9rFtYn3fq/C','tourist','1234567890','2025-09-12 17:19:54','2025-09-12 17:19:54'),('62b90101-200b-46b4-bdad-2cf453cab067','DRAGON','dragon@gmail.com','$2b$12$gRh8H9gIQxPuyHMWnOILiOzl.3nQO5CADEOFF4D3FSa803w/5K3he','tourist','1234567890','2025-09-13 17:12:26','2025-09-13 17:12:26'),('7ed89032-84ce-444f-a543-4fea2427c74c','Test User','testuser@example.com','$2b$12$Esjd.VkgFJVMO9IYeJ44P.3h0YHaglWmjPwhmMDe3DZWD4qmL7bjG','tourist','9876543210','2025-09-12 17:31:09','2025-09-12 17:31:09'),('9ffdf221-c444-4eb2-b15b-8f9693adc0b0','hello','hello123@gmail.com','$2b$12$J5yGjqOg6bvuMBqwzUuk.ujahojmByDyv45Rk6UwusErzMBVycThy','tourist','8989898989','2025-09-13 17:39:45','2025-09-13 17:39:45'),('a9bcc830-8f0d-49ec-b420-8a0676065e3e','provider','providers091@gmail.com','$2b$12$v1BKzjID/9l1KIElEA623OZTkFlVmFimFgBRgyplPuPrv.FP68m5u','provider','1234567890','2025-09-13 18:17:26','2025-09-13 18:17:26'),('admin1','Admin User','admin@tourism.com','$2b$10$example_hash','admin','+91 99999 99999','2025-09-05 16:42:16','2025-09-05 16:42:16'),('b25e07c6-1429-47be-ac46-4f46b2c19a5d','prince','prargaea@gmail.com','$2b$12$gZMCKMTk2FfI5Utka5G0IeMx2rlhcR.Dy7qGj05BBCKjn/luCI0ci','tourist','9288838383','2025-09-13 15:50:16','2025-09-13 15:50:16'),('b66fbde3-1480-4eeb-9c21-07095fe6d4f8','prince','princeraj3084@gmail.com','$2b$12$CugLZQ0mKN3XEil.tj80v.rs/zQjkiRrAtJh5ZBlvs.SKh1P6SL9a','provider','9852244801','2025-09-13 12:33:38','2025-09-13 12:33:38'),('b6c58ecc-e41f-40e9-b2ae-7fc344032225','Ritik','ritik30122005@gmail.com','$2b$12$xnL1fW8hVuj70zZKPxtlGep/ouavo8BMtbA4Sf5I23Ju3dPYoowVO','tourist','9244372179','2025-09-18 03:58:07','2025-09-18 03:58:07'),('d3bae778-2eb0-4f8a-ab32-9cbc1976aa1a','raj','rajprince30841@gmail.com','$2b$12$iLnXX0.H7togeQF.g1jEOONQhqe4Km8D7QFB60MlmWFpss9rbjnvi','tourist','9852244801','2025-09-13 12:35:01','2025-09-13 12:35:01'),('e9a70e4f-0d08-4437-9ba1-ce7f9b5a3f48','anuradha','anuradha@gmail.com','$2b$12$gsiPOXI77v.eEoo9S8rtLuRWWA66LXqOvwCR0xTYCVzuXzoP8i2IS','tourist','123141141','2025-09-14 07:10:19','2025-09-14 07:10:19'),('provider1','Guide User','testprovider@example.com','$2b$12$VtjqMmKHc8Nc41sDgpVsbOcJO4gUApXsj72q3jGA8bbQS2GMGIp4W','provider','+91 98765 43210','2025-09-05 16:42:16','2025-09-17 22:13:10'),('provider2','Transport User','testprovider2@example.com','$2b$12$VtjqMmKHc8Nc41sDgpVsbOcJO4gUApXsj72q3jGA8bbQS2GMGIp4W','provider','+91 87654 32109','2025-09-05 16:42:16','2025-09-17 22:15:04'),('user1','Priya Sharma','priya@example.com','$2b$10$example_hash','tourist','+91 98765 43210','2025-09-05 16:42:16','2025-09-05 16:42:16'),('user2','Raj Patel','raj@example.com','$2b$10$example_hash','tourist','+91 98765 12345','2025-09-05 16:42:16','2025-09-05 16:42:16'),('user3','Anita Kumar','anita@example.com','$2b$10$example_hash','tourist','+91 87654 32109','2025-09-05 16:42:16','2025-09-05 16:42:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18 13:08:03

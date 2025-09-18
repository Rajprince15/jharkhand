#!/usr/bin/env python3
"""
Insert sample data for Jharkhand tourism database
"""

import asyncio
import aiomysql
import os
from dotenv import load_dotenv

# Load environment variables  
load_dotenv('/app/backend/.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3001)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Prince1504'),
    'db': os.getenv('DB_NAME', 'jharkhand_tourism'),
    'autocommit': True
}

async def insert_sample_data():
    """Insert sample data into the database"""
    try:
        connection = await aiomysql.connect(**DB_CONFIG)
        
        async with connection.cursor() as cursor:
            print("🔄 Inserting sample data...")
            
            # Insert regions
            regions_sql = """
            INSERT IGNORE INTO regions (id, name, description, image_url, highlights) VALUES
            ('east', 'East Jharkhand', 'Eastern region featuring the capital city and waterfalls', 'https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800', '["Ranchi", "Hundru Falls", "Urban Culture", "Administrative Hub"]'),
            ('west', 'West Jharkhand', 'Western hills and scenic beauty, Queen of Chotanagpur', 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800', '["Netarhat", "Hill Stations", "Sunrise Points", "Cool Climate"]'),
            ('north', 'North Jharkhand', 'Northern wildlife and pilgrimage sites', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800', '["Betla National Park", "Parasnath Hill", "Wildlife", "Spiritual Sites"]'),
            ('south', 'South Jharkhand', 'Southern industrial and natural attractions', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800', '["Jamshedpur", "Dimna Lake", "Industrial Heritage", "Lakes"]');
            """
            await cursor.execute(regions_sql)
            print("   ✅ Regions inserted")
            
            # Insert destinations
            destinations_sql = """
            ('2', 'Hudco Lake', 'Jamshedpur, Jharkhand, India', 'Beautiful, manicured green spot perfect for relaxation and nature walks.', 'https://indiano.travel/wp-content/uploads/2022/03/Hudco-Lake.jpg', 4.2, 5000.00, 'Lake', '["Scenic beauty", "Boating", "Photography", "Nature walks"]', 'Kolhan Division'),
            ('3', 'Mayurakshi River', 'Dumka, Jharkhand, India', 'Scenic river perfect for boating and riverside picnics with beautiful natural surroundings.', 'https://thumbs.dreamstime.com/b/mayurakshi-river-beautiful-india-located-state-jharkhand-dumka-district-massanjore-dam-across-was-commissioned-i-105399747.jpg', 4.0, 6000.00, 'River', '["Boating", "Riverside picnics", "Natural beauty", "Water sports"]', 'Santhal Pargana Division'),
            ('4', 'Dimna Lake', 'Jamshedpur, Jharkhand, India', 'Picturesque lake surrounded by hills, perfect for water sports and nature photography.', 'https://s7ap1.scene7.com/is/image/incredibleindia/dimna-lake-jamshedpur-jharkhand-3-attr-hero?qlt=82&ts=1742172767006', 4.3, 5500.00, 'Lake', '["Water sports", "Photography", "Boating", "Hill views"]', 'Kolhan Division'),
            ('5', 'Ranchi Lake', 'Ranchi, Jharkhand, India', 'Central lake in Ranchi city, popular for evening walks and boat rides.', 'https://avathioutdoors.gumlet.io/travelGuide/dev/ranchi_P7754.jpg', 4.1, 4500.00, 'Lake', '["Boating", "Evening walks", "City views", "Photography"]', 'South Chhotanagpur Division'),
            ('6', 'Jubilee Lake', 'Jamshedpur, Jharkhand, India', 'Beautiful lake in Jubilee Park area with recreational facilities and scenic beauty.', 'https://seawatersports.com/images/places/jubilee-lake--jamshedpur.jpg', 4.2, 5000.00, 'Lake', '["Recreation", "Boating", "Park facilities", "Family picnics"]', 'Kolhan Division'),
            ('7', 'Topchanchi Lake', 'Dhanbad, Jharkhand, India', 'Scenic lake surrounded by hills, perfect for nature lovers and photography enthusiasts.', 'https://seawatersports.com/images/places/topchanchi-lake.png', 4.0, 6000.00, 'Lake', '["Hill views", "Photography", "Nature walks", "Peaceful environment"]', 'North Chhotanagpur Division'),

            -- National Parks & Wildlife Sanctuaries
            ('8', 'Betla National Park', 'Latehar, Jharkhand, India', 'India\'s first tiger reserve, home to elephants, tigers, leopards, and diverse birds with historical Palamau forts.', 'https://tse4.mm.bing.net/th/id/OIP.zhndGdK1xz_4jC2P269vaAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.6, 12000.00, 'National Park', '["Tiger reserve", "Wildlife safari", "Historical forts", "Elephant sightings"]', 'Palamu Division'),
            ('9', 'Hazaribagh National Park', 'Hazaribagh, Jharkhand, India', 'Ecological reserve for sambhar, nilgai, spotted deer, and numerous bird species.', 'https://tse2.mm.bing.net/th/id/OIP.bVBhw2XggBN9fL-RqsRc_gHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.3, 10000.00, 'National Park', '["Wildlife viewing", "Bird watching", "Safari", "Nature photography"]', 'North Chhotanagpur Division'),
            ('10', 'Dalma Wildlife Sanctuary', 'Jamshedpur, Jharkhand, India', 'Sanctuary with habitats for elephants and endemic wildlife, offering trekking and scenic viewpoints.', 'https://www.iasgyan.in/ig-uploads/images/DALMA_WILDLIFE_SANCTUARY.jpg', 4.4, 9000.00, 'Wildlife Sanctuary', '["Elephant habitat", "Trekking", "Scenic viewpoints", "Wildlife photography"]', 'Kolhan Division'),
            ('11', 'Palamau Tiger Reserve', 'Latehar, Jharkhand, India', 'Premier destination for wildlife enthusiasts with forest and hilly terrain, also houses Lodh Falls.', 'https://tse1.mm.bing.net/th/id/OIP.TEWhdcPWKxLHcysHGTfSfwHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.5, 11000.00, 'Tiger Reserve', '["Tiger sightings", "Forest safari", "Lodh Falls", "Hilly terrain"]', 'Palamu Division'),
            ('12', 'Topchanchi Wildlife Sanctuary', 'Dhanbad, Jharkhand, India', 'Wildlife sanctuary adding to the state\'s natural wealth and biodiversity.', 'https://tripxl.com/blog/wp-content/uploads/2024/09/Location-96.jpg', 4.1, 8500.00, 'Wildlife Sanctuary', '["Biodiversity", "Wildlife viewing", "Nature trails", "Photography"]', 'North Chhotanagpur Division'),
            ('13', 'Lake Bird Sanctuary', 'Various locations, Jharkhand, India', 'Important bird sanctuary contributing to the state\'s natural wealth and biodiversity.', 'https://gwassetsstorage.azureedge.net/gowandering-images/7fbca793-e195-4c1c-8c9e-a20306fc75fcplaceExtraImages_image__4.jpeg', 4.2, 7500.00, 'Bird Sanctuary', '["Bird watching", "Photography", "Nature walks", "Biodiversity"]', 'Various'),

            -- Zoos, Parks & Heritage
            ('14', 'Birsa Zoological Park', 'Ranchi, Jharkhand, India', 'Major zoological attraction with safari experiences and diverse animal species.', 'https://i.ytimg.com/vi/afC-bmQmAK0/maxresdefault.jpg', 4.3, 6500.00, 'Zoo', '["Safari experience", "Animal diversity", "Family entertainment", "Educational tours"]', 'South Chhotanagpur Division'),
            ('15', 'Tata Steel Zoological Park', 'Jamshedpur, Jharkhand, India', 'Large zoo facility in Jubilee Park area with diverse wildlife collection.', 'https://tse1.mm.bing.net/th/id/OIP.K9mXSup9Rsfpgk09zUMXvwHaFh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.2, 6000.00, 'Zoo', '["Animal exhibits", "Family visits", "Educational programs", "Recreation"]', 'Kolhan Division'),
            ('16', 'Nakshatra Van', 'Ranchi, Jharkhand, India', 'Unique astrological-themed park with beautiful gardens and educational exhibits.', 'https://tse4.mm.bing.net/th/id/OIP.E_Jtwt1c56NLjuwvFYFDrwHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.0, 4000.00, 'Theme Park', '["Astrology theme", "Gardens", "Educational exhibits", "Unique concept"]', 'South Chhotanagpur Division'),
            ('17', 'Rock Garden', 'Ranchi, Jharkhand, India', 'Sculpture garden built on a rocky hill with artistic installations and city views.', 'https://media-cdn.tripadvisor.com/media/photo-s/18/3d/c0/e5/rock-garden.jpg', 4.1, 3500.00, 'Garden', '["Sculpture art", "Rocky terrain", "City views", "Photography"]', 'South Chhotanagpur Division'),
            ('18', 'Deer Park', 'Ranchi, Jharkhand, India', 'Suburban park with spotted deer and picnic lawns, perfect for family outings.', 'https://th.bing.com/th?id=OLC.4ukVlUYn1L0%2fjg480x360&r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3', 3.9, 3000.00, 'Park', '["Spotted deer", "Picnic areas", "Family outings", "Nature walks"]', 'South Chhotanagpur Division'),
            ('19', 'Jubilee Park', 'Jamshedpur, Jharkhand, India', 'Large recreational park with multiple attractions and beautiful landscapes.', 'https://seawatersports.com/images/places/jubilee-lake--jamshedpur.jpg', 4.2, 4500.00, 'Park', '["Recreation", "Multiple attractions", "Landscapes", "Family entertainment"]', 'Kolhan Division'),

            -- Archaeological & Heritage Sites
            ('20', 'Itkhori', 'Chatra, Jharkhand, India', 'Important site for Buddhist, Jain, and Hindu heritage with unique ancient relics and temples.', 'https://tse4.mm.bing.net/th/id/OIP.A8ueYYND1p94n0bcmQd2owHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 4.4, 7000.00, 'Heritage Site', '["Buddhist heritage", "Jain temples", "Hindu relics", "Ancient architecture"]', 'North Chhotanagpur Division'),
            ('21', 'Isko Village', 'Hazaribagh, Jharkhand, India', 'Prehistoric site famous for ancient rock art and archaeological significance.', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhopXE84WcPIvw227OK82Do2R1hrRxDIy1hsrZjtuGhBrtRSF-Ofq3pr6Liv604c7kXR-svGL9AG1RxJdunNGNW8N73MBVXkgq5ISZrNISTSp3hsYGr7vNNJUCch98H9ZEoY5uCugLmjOx-9IlQ4R-x3yqs7lrLcwuMMI-XY5gTqNy5hHBQ9w0Mc-5jIw/w1200-h630-p-k-no-nu/Untitled.jpg', 4.3, 6500.00, 'Archaeological Site', '["Prehistoric rock art", "Archaeological significance", "Ancient history", "Cultural heritage"]', 'North Chhotanagpur Division'),

            -- Waterfalls
            ('22', 'Hundru Falls', 'Ranchi, Jharkhand, India', 'Spectacular waterfall near Ranchi, perfect for nature lovers and photography.', 'https://tse4.mm.bing.net/th/id/OIP.m4sKNFunRxxXp3itElORJQHaFj?pid=Api', 4.5, 5500.00, 'Waterfall', '["Natural beauty", "Photography", "Trekking", "Scenic views"]', 'South Chhotanagpur Division'),
            ('23', 'Dassam Falls', 'Ranchi, Jharkhand, India', 'Beautiful cascade waterfall with multiple tiers and pristine natural surroundings.', 'https://tse4.mm.bing.net/th/id/OIP.-npaDixlWMe1wZTpeEdCpgHaEK?pid=Api', 4.4, 5000.00, 'Waterfall', '["Multi-tier cascade", "Natural beauty", "Photography", "Adventure"]', 'South Chhotanagpur Division'),
            ('24', 'Jonha Falls', 'Ranchi, Jharkhand, India', 'Picturesque waterfall surrounded by dense forest, ideal for nature enthusiasts.', 'https://tse4.mm.bing.net/th/id/OIP.KU_lto6h9XMOIdGueLn0pwHaEK?pid=Api', 4.3, 4800.00, 'Waterfall', '["Forest surroundings", "Nature photography", "Trekking", "Peaceful environment"]', 'South Chhotanagpur Division'),
            ('25', 'Hirni Falls', 'West Singhbhum, Jharkhand, India', 'Remote waterfall offering pristine natural beauty and adventure opportunities.', 'https://tse4.mm.bing.net/th/id/OIP.aMGcQyGlxIy4sq-_Ixrp_gHaGQ?pid=Api', 4.2, 6000.00, 'Waterfall', '["Remote location", "Adventure", "Natural beauty", "Trekking"]', 'Kolhan Division'),
            ('26', 'Panchghagh Falls', 'Khunti, Jharkhand, India', 'Five-stream waterfall with unique geological formation and scenic beauty.', 'https://tse4.mm.bing.net/th/id/OIP.hHmhwt0lBgVP3cb-k9UtYQHaGd?pid=Api', 4.3, 5200.00, 'Waterfall', '["Five streams", "Unique formation", "Scenic beauty", "Photography"]', 'South Chhotanagpur Division'),
            ('27', 'Lodh Falls', 'Latehar, Jharkhand, India', 'Highest waterfall in Jharkhand, located within Palamau Tiger Reserve area.', 'https://tse2.mm.bing.net/th/id/OIP.5CPoCoY7BkI62tGH0uPpMAHaDm?pid=Api', 4.6, 7500.00, 'Waterfall', '["Highest waterfall", "Tiger reserve", "Adventure", "Natural wonder"]', 'Palamu Division'),
            ('28', 'Usri Falls', 'Giridih, Jharkhand, India', 'Beautiful waterfall with clear pool formation, perfect for nature lovers.', 'https://tse3.mm.bing.net/th/id/OIP.BnOGUQh4QC5dPgxrWcmcVQHaEC?pid=Api', 4.1, 4500.00, 'Waterfall', '["Clear pools", "Natural beauty", "Photography", "Swimming"]', 'North Chhotanagpur Division'),
            ('29', 'Bhatinda Falls', 'Dhanbad, Jharkhand, India', 'Scenic waterfall in the coal belt region with unique industrial-natural contrast.', 'https://tse1.mm.bing.net/th/id/OIP.fXZg_7say2FLCCgmw3EP7AHaEK?pid=Api', 4.0, 4200.00, 'Waterfall', '["Industrial contrast", "Scenic beauty", "Photography", "Unique location"]', 'North Chhotanagpur Division'),
            ('30', 'Sita Falls', 'Ramgarh, Jharkhand, India', 'Mythologically significant waterfall with beautiful natural surroundings.', 'https://tse4.mm.bing.net/th/id/OIP.7bGXQHchQIUbaCu0qzrjLQHaEK?pid=Api', 4.2, 4800.00, 'Waterfall', '["Mythological significance", "Natural beauty", "Photography", "Cultural heritage"]', 'North Chhotanagpur Division'),
            ('31', 'Sadni Falls', 'Gumla, Jharkhand, India', 'Pristine waterfall in a serene natural setting, perfect for peaceful retreats.', 'https://travelwithdarshik.wordpress.com/wp-content/uploads/2015/06/sadni_falls_jharkhand.jpg', 4.3, 5500.00, 'Waterfall', '["Pristine nature", "Peaceful retreat", "Photography", "Natural beauty"]', 'South Chhotanagpur Division'),
            ('32', 'Lower Ghaghri Falls', 'Netarhat, Latehar, Jharkhand, India', 'Beautiful waterfall in the hill station of Netarhat with scenic surroundings.', 'https://media.tripinvites.com/places/netarhat/lower-ghaghri-waterfalls/lower-ghaghri-waterfalls-featured.jpg', 4.4, 6200.00, 'Waterfall', '["Hill station", "Scenic beauty", "Cool climate", "Photography"]', 'Palamu Division'),
            ('33', 'Upper Ghaghri Falls', 'Netarhat, Latehar, Jharkhand, India', 'Upper tier of the famous Ghaghri Falls with spectacular views and natural beauty.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/17/a5/19/caption.jpg?w=900&h=500&s=1', 4.5, 6500.00, 'Waterfall', '["Upper tier", "Spectacular views", "Natural beauty", "Hill station charm"]', 'Palamu Division'),
            ('34', 'Rajrappa Falls', 'Ramgarh, Jharkhand, India', 'Waterfall near the famous Rajrappa Temple with religious and natural significance.', 'https://avathioutdoors.gumlet.io/travelGuide/dev/ranchi_P4746.jpg', 4.3, 5000.00, 'Waterfall', '["Temple proximity", "Religious significance", "Natural beauty", "Pilgrimage site"]', 'North Chhotanagpur Division'),
            ('35', 'Baghmunda Falls', 'West Singhbhum, Jharkhand, India', 'Remote and pristine waterfall offering adventure and natural beauty.', 'https://cdn.tripuntold.com/media/photos/location/2019/01/13/20158d97-bce1-4738-9ba0-493a292facd1.jpg', 4.1, 5800.00, 'Waterfall', '["Remote location", "Pristine nature", "Adventure", "Photography"]', 'Kolhan Division'),

            -- Hills & Scenic Spots
            ('36', 'Parasnath Hill', 'Giridih, Jharkhand, India', 'Highest peak in Jharkhand, sacred to Jains with temples and pilgrimage significance.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/6c/f6/c8/parasnath-hills.jpg?w=900&h=-1&s=1', 4.6, 8500.00, 'Hill Station', '["Highest peak", "Jain temples", "Pilgrimage site", "Trekking"]', 'North Chhotanagpur Division'),
            ('37', 'Netarhat', 'Latehar, Jharkhand, India', 'Queen of Chotanagpur, famous hill station with sunrise/sunset views and pleasant climate.', 'https://images.news18.com/ibnlive/uploads/2024/08/image-84-2024-08-b25ab24635fa9b92ddd128314acea32c-16x9.png', 4.7, 9500.00, 'Hill Station', '["Queen of Chotanagpur", "Sunrise views", "Pleasant climate", "Hill station charm"]', 'Palamu Division'),
            ('38', 'Patratu Valley', 'Ranchi, Jharkhand, India', 'Picturesque valley with scenic landscapes and natural beauty.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzYmbWpXN2eWe8ot4t9zORYmhxxWR3dIQMeA&s', 4.2, 6000.00, 'Valley', '["Scenic landscapes", "Natural beauty", "Photography", "Peaceful environment"]', 'South Chhotanagpur Division'),
            ('39', 'McCluskieganj', 'Ranchi, Jharkhand, India', 'Historic Anglo-Indian settlement with colonial charm and cultural heritage.', 'https://media.assettype.com/outlooktraveller%2Fimport%2Fpublic%2Fuploads%2Ffilemanager%2Fimages%2Fjdjagj_63ea264701561.jpg', 4.0, 5500.00, 'Heritage Town', '["Anglo-Indian heritage", "Colonial charm", "Cultural significance", "Historical importance"]', 'South Chhotanagpur Division'),
            ('40', 'Trikut Hill', 'Deoghar, Jharkhand, India', 'Three-peaked hill with ropeway facility and panoramic views, near Baidyanath Temple.', 'https://media-cdn.tripadvisor.com/media/photo-s/11/36/93/5d/deoghar-ropeway-at-trikut.jpg', 4.4, 7000.00, 'Hill Station', '["Three peaks", "Ropeway", "Panoramic views", "Temple proximity"]', 'Santhal Pargana Division'),

            -- Temples & Religious Sites
            ('41', 'Rajrappa Temple', 'Ramgarh, Jharkhand, India', 'Famous Chhinnamasta Temple dedicated to Goddess Chinnamasta, significant Shakti Peetha.', 'https://thumbs.dreamstime.com/z/chhinnamasta-temple-dedicated-to-goddess-chinnamasta-rajrappa-dec-ramgarh-district-jharkhand-india-asia-286640818.jpg', 4.5, 4000.00, 'Temple', '["Shakti Peetha", "Goddess Chinnamasta", "Religious significance", "Pilgrimage site"]', 'North Chhotanagpur Division'),
            ('42', 'Jagannath Temple', 'Ranchi, Jharkhand, India', 'Historic 17th century temple dedicated to Lord Jagannath with beautiful architecture.', 'https://upload.wikimedia.org/wikipedia/commons/9/9b/17th_century_Jagannath_temple_Ranchi_Jharkhand_-_6.jpg', 4.4, 3000.00, 'Temple', '["17th century", "Lord Jagannath", "Historic architecture", "Cultural heritage"]', 'South Chhotanagpur Division'),
            ('43', 'Deori Mandir', 'Ranchi, Jharkhand, India', 'Ancient temple dedicated to Maa Dewri with religious and cultural significance.', 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Maa_Dewri_Mandir.jpg', 4.3, 2800.00, 'Temple', '["Maa Dewri", "Ancient temple", "Religious significance", "Local devotion"]', 'South Chhotanagpur Division'),
            ('44', 'Basukinath Temple', 'Dumka, Jharkhand, India', 'Important Shiva temple complex with religious significance and beautiful architecture.', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Baba_Basukinath_Temple_complex_at_Basukinath%2C_Jharkhand_08.jpg', 4.5, 3500.00, 'Temple', '["Lord Shiva", "Temple complex", "Religious significance", "Architecture"]', 'Santhal Pargana Division'),
            ('45', 'Bhadrakali Temple', 'Itkhori, Chatra, Jharkhand, India', 'Ancient temple dedicated to Goddess Bhadrakali with historical and religious importance.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/89/56/01/2016-10-05-10-16-58-432.jpg?w=1200&h=1200&s=1', 4.4, 3200.00, 'Temple', '["Goddess Bhadrakali", "Ancient temple", "Historical importance", "Pilgrimage site"]', 'North Chhotanagpur Division'),
            ('46', 'Baidyanath Dham', 'Deoghar, Jharkhand, India', 'One of the twelve Jyotirlingas, major pilgrimage site with immense religious significance.', 'https://baidyanathnagri.com/wp-content/uploads/2022/01/bababaidyabathdham-1.jpg', 4.8, 5000.00, 'Temple', '["Jyotirlinga", "Major pilgrimage", "Religious significance", "Spiritual center"]', 'Santhal Pargana Division'),
            ('47', 'Rankini Temple', 'Jadugora, East Singhbhum, Jharkhand, India', 'Important temple dedicated to Goddess Rankini with local religious significance.', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2GQKH8W9PMNffJAR-ks32iIofS1vM4AwQo9vny22HS2G5m8OUFJJUIDohCOIQIsH1yHZG0x54EGBtrvoB4K6TByvmoCjvVeiBVL-ryuX5KOzAePW4K2s_W9nm4N8QhVPX02qRUv26aUDe/s1600/Rankini-Temple-near-Jaduguda-Jadugora-Jharkhand+2_1.jpg', 4.2, 3000.00, 'Temple', '["Goddess Rankini", "Local significance", "Religious site", "Cultural importance"]', 'Kolhan Division'),
            ('48', 'Kapilnath Temple', 'Deoghar, Jharkhand, India', 'Ancient temple with religious significance and beautiful architecture.', 'https://myadhyatm.com/wp-content/uploads/2025/04/1-252-500x445.jpg', 4.3, 2500.00, 'Temple', '["Ancient temple", "Religious significance", "Architecture", "Pilgrimage site"]', 'Santhal Pargana Division'),
            ('49', 'Sun Temple', 'Ranchi, Jharkhand, India', 'Beautiful temple dedicated to Surya (Sun God) with modern architecture.', 'https://www.shutterstock.com/image-photo/surya-mandir-sun-temple-hindu-260nw-2192562357.jpg', 4.1, 2200.00, 'Temple', '["Sun God", "Modern architecture", "Religious site", "Cultural significance"]', 'South Chhotanagpur Division'),

            -- Dams
            ('50', 'Kanke Dam', 'Ranchi, Jharkhand, India', 'Popular dam near Ranchi city with recreational facilities and scenic beauty.', 'https://content3.jdmagicbox.com/comp/ranchi/i7/0651px651.x651.141222101819.q8i7/catalogue/kanke-dam-kanke-road-ranchi-tourist-attraction-3sfefle.jpg', 4.0, 4000.00, 'Dam', '["Recreation", "Scenic beauty", "Water sports", "Picnic spot"]', 'South Chhotanagpur Division'),
            ('51', 'Maithon Dam', 'Dhanbad, Jharkhand, India', 'Major dam with beautiful reservoir and recreational facilities.', 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Maithon_dam%2C_india.jpg', 4.2, 5000.00, 'Dam', '["Large reservoir", "Recreation", "Water sports", "Engineering marvel"]', 'North Chhotanagpur Division'),
            ('52', 'Panchet Dam', 'Dhanbad, Jharkhand, India', 'Important dam with scenic reservoir and water sports facilities.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiUvHQ1NXs7YT8ViMfnlCc7WVSWWm0h6VGIA&s', 4.1, 4800.00, 'Dam', '["Scenic reservoir", "Water sports", "Engineering", "Recreation"]', 'North Chhotanagpur Division'),
            ('53', 'Chandil Dam', 'Seraikela-Kharsawan, Jharkhand, India', 'Picturesque dam with beautiful surroundings and recreational activities.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1XasyNjZDxMWJe1NEqblbNtVZrOSTurLnyA&s', 4.0, 4500.00, 'Dam', '["Scenic surroundings", "Recreation", "Water activities", "Photography"]', 'Kolhan Division'),
            ('54', 'Getalsud Dam', 'Ranchi, Jharkhand, India', 'Beautiful dam with pristine waters and scenic landscape, perfect for nature lovers.', 'https://preview.redd.it/getalsud-dam-at-its-best-v0-ae1yhohbmuff1.jpg?width=640&crop=smart&auto=webp&s=334d55e30b3ec8da9765057cad564e6788b6b261', 4.3, 5200.00, 'Dam', '["Pristine waters", "Scenic landscape", "Nature photography", "Peaceful environment"]', 'South Chhotanagpur Division'),
            ('55', 'Garga Dam', 'Ranchi, Jharkhand, India', 'Scenic dam with recreational facilities and natural beauty.', 'https://seawatersports.com/images/places/garga-dam.png', 4.1, 4200.00, 'Dam', '["Recreation", "Natural beauty", "Water activities", "Scenic views"]', 'South Chhotanagpur Division'),
            ('56', 'Sitarampur Dam', 'Jamshedpur, Jharkhand, India', 'Dam park with recreational facilities and beautiful water views.', 'https://content3.jdmagicbox.com/comp/jamshedpur/f8/0657px657.x657.170922084745.t5f8/catalogue/sitarampur-dam-park-jamshedpur-picnic-spots-wrwscc632s.jpg', 4.0, 4300.00, 'Dam', '["Dam park", "Recreation", "Water views", "Picnic spot"]', 'Kolhan Division'),
            ('57', 'Massanjore Dam', 'Dumka, Jharkhand, India', 'Major dam across Mayurakshi River with scenic beauty and water sports facilities.', 'https://seawatersports.com/images/places/massanjore-dam.jpg', 4.2, 5500.00, 'Dam', '["Mayurakshi River", "Water sports", "Scenic beauty", "Recreation"]', 'Santhal Pargana Division'),
            ('58', 'Palna Dam', 'West Singhbhum, Jharkhand, India', 'Beautiful dam with serene environment and recreational opportunities.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoR-mTnqZAy9Nh2TNui2_-iHhxA11FDXoWqw&s', 4.1, 4600.00, 'Dam', '["Serene environment", "Recreation", "Water activities", "Natural beauty"]', 'Kolhan Division'),

            -- Cities & Towns
            ('59', 'Jamshedpur', 'Jamshedpur, Jharkhand, India', 'Industrial town known for steel production, green parks, and beautiful lakes.', 'https://images.news18.com/n18-elections/2024/10/s27aed2008a048-jamshedpur-east.jpg?impolicy=website&width=&height=', 4.3, 12000.00, 'City', '["Steel city", "Green parks", "Lakes", "Industrial heritage"]', 'Kolhan Division'),
            ('60', 'Hazaribagh', 'Hazaribagh, Jharkhand, India', 'Scenic town famous for nature parks, lakes, and proximity to national parks.', 'https://media.tripinvites.com/places/hazaribagh/hazaribagh-jheel-featured.jpg', 4.2, 8500.00, 'City', '["Nature parks", "Lakes", "National parks", "Natural beauty"]', 'North Chhotanagpur Division'),
            ('61', 'Dhanbad', 'Dhanbad, Jharkhand, India', 'Coal capital of India, known for coal industry and beautiful parks.', 'https://i.pinimg.com/originals/c9/44/56/c944566b2ffaf22a929000e30cecc7e9.jpg', 4.0, 7500.00, 'City', '["Coal capital", "Industrial heritage", "Parks", "Mining history"]', 'North Chhotanagpur Division'),
            ('62', 'Deoghar', 'Deoghar, Jharkhand, India', 'Holy pilgrimage town famous for Baidyanath Jyotirlinga and religious significance.', 'https://i.pinimg.com/originals/45/da/41/45da41b1a9816f7e9193a3f9f21b087e.jpg', 4.6, 6500.00, 'Pilgrimage City', '["Jyotirlinga", "Pilgrimage site", "Religious significance", "Spiritual center"]', 'Santhal Pargana Division');

            """
            await cursor.execute(destinations_sql)
            print("   ✅ Destinations inserted")
            
            # Insert some sample users
            users_sql = """
            INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES
            ('user1', 'Tourist User', 'tourist@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'tourist', '+91 9876543210'),
            ('provider1', 'Service Provider 1', 'provider1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'provider', '+91 9876543211'),
            ('provider2', 'Service Provider 2', 'provider2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'provider', '+91 9876543212'),
            ('admin1', 'Admin User', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'admin', '+91 9876543213');
            """
            await cursor.execute(users_sql)
            print("   ✅ Users inserted")
            
            # Insert some sample providers
            providers_sql = """
            INSERT IGNORE INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url, is_active) VALUES
            ('prov1', 'provider1', 'Ranchi City Tours', 'guide', 'Complete Ranchi City Tour', 'Professional guided tours covering all major Ranchi attractions including Tagore Hill, Rock Garden, and Hundru Falls.', 2500.00, 4.8, 'Ranchi, Jharkhand, India', '+91 98765 11111', 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov2', 'provider1', 'Netarhat Hill Adventures', 'guide', 'Netarhat Trekking & Sunrise Tours', 'Experience the Queen of Chotanagpur with guided treks and sunrise point visits.', 2800.00, 4.9, 'Netarhat, Jharkhand, India', '+91 98765 44444', 'https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov3', 'provider2', 'Betla Wildlife Safaris', 'activity', 'Jeep Safari & Wildlife Photography', 'Professional wildlife safari with expert naturalist guides and photography assistance.', 3500.00, 4.8, 'Latehar, Jharkhand, India', '+91 98765 66666', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov4', 'provider1', 'Parasnath Pilgrimage Services', 'guide', 'Jain Temple Tours & Trekking', 'Spiritual tours and trekking to Parasnath Hill Jain temples with religious significance explanations.', 2000.00, 4.7, 'Giridih, Jharkhand, India', '+91 98765 88888', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov5', 'provider2', 'Dimna Lake Water Sports', 'activity', 'Boating & Water Activities', 'Boating, kayaking and other water sports at beautiful Dimna Lake.', 1800.00, 4.5, 'Jamshedpur, Jharkhand, India', '+91 98765 10101', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400', 1);
            """
            await cursor.execute(providers_sql)
            print("   ✅ Providers inserted")
            
            print("✅ All sample data inserted successfully!")
        
        await connection.commit()
        connection.close()
        
    except Exception as e:
        print(f"❌ Data insertion failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(insert_sample_data())
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { 
  Calendar, 
  FileText, 
  Package, 
  Plane, 
  Train, 
  Car,
  Shield,
  Phone,
  CloudRain,
  Heart,
  Utensils,
  Star,
  CheckCircle,
  MapPin,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

const PracticalTipsPage = () => {
  const { t } = useTranslation();
  const [selectedModal, setSelectedModal] = useState(null);

  const beforeYouGoTips = [
    {
      id: 'bestTime',
      title: t('tip1'),
      description: t('tip1Desc'),
      icon: Calendar,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      modalContent: {
        title: "Best Time to Explore Jharkhand",
        content: (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🌟 Peak Season: October - March</h4>
              <p className="text-green-700">Perfect weather conditions with temperatures ranging from 15-25°C. Ideal for sightseeing, trekking, and outdoor activities.</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Monthly Breakdown:</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <strong>October-November:</strong> Post-monsoon freshness, clear skies, perfect for wildlife viewing
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <strong>December-February:</strong> Cool and pleasant, best for waterfalls and hiking
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <strong>March:</strong> Warm but comfortable, festival season begins
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ Avoid: June - September</h4>
              <p className="text-yellow-700">Heavy monsoon season with potential flooding and limited outdoor activities.</p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Festival Calendar:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sarhul (March-April):</strong> Tribal spring festival</li>
                <li><strong>Karma (August-September):</strong> Harvest festival</li>
                <li><strong>Tusu Parab (December-January):</strong> Winter festival</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'documents',
      title: t('tip2'),
      description: t('tip2Desc'),
      icon: FileText,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      modalContent: {
        title: "Required Documents & Permits",
        content: (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">✅ Essential Documents</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li>Valid Government Photo ID (Aadhaar, Passport, Driving License)</li>
                <li>Hotel/accommodation booking confirmations</li>
                <li>Travel insurance (recommended)</li>
                <li>Emergency contact information</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3">Special Permits Required:</h4>
              <div className="space-y-4">
                <div className="border p-4 rounded-lg">
                  <strong className="text-red-600">Betla National Park:</strong>
                  <p>Entry permits required, book online or at park entrance. Camera fees applicable.</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <strong className="text-red-600">Palamau Tiger Reserve:</strong>
                  <p>Special permits for core areas. Guide mandatory for certain zones.</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <strong className="text-orange-600">Tribal Villages:</strong>
                  <p>Respect local customs. Some areas may require local guide approval.</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">💡 Pro Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li>Keep photocopies of important documents</li>
                <li>Store digital copies in cloud storage</li>
                <li>Carry extra passport-size photos</li>
                <li>Inform someone about your travel plans</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'packing',
      title: t('tip3'),
      description: t('tip3Desc'),
      icon: Package,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      modalContent: {
        title: "Complete Packing Guide for Jharkhand",
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">👕 Clothing</h4>
                <ul className="list-disc pl-5 space-y-1 text-green-700 text-sm">
                  <li>Light cotton clothes (breathable)</li>
                  <li>Long sleeves for evening/mosquito protection</li>
                  <li>Comfortable trekking pants</li>
                  <li>Light jacket for winter months</li>
                  <li>Modest clothing for tribal areas</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">👟 Footwear</h4>
                <ul className="list-disc pl-5 space-y-1 text-green-700 text-sm">
                  <li>Sturdy trekking shoes with good grip</li>
                  <li>Comfortable walking sandals</li>
                  <li>Water-resistant boots for monsoon</li>
                  <li>Flip-flops for accommodation</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🏥 Health & Safety</h4>
                <ul className="list-disc pl-5 space-y-1 text-purple-700 text-sm">
                  <li>First aid kit with bandages</li>
                  <li>Antiseptic cream and pain relievers</li>
                  <li>Mosquito repellent (DEET-based)</li>
                  <li>Sunscreen (SPF 30+)</li>
                  <li>Water purification tablets</li>
                  <li>Personal medications</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-bold text-orange-800 mb-2">🎒 Outdoor Gear</h4>
                <ul className="list-disc pl-5 space-y-1 text-orange-700 text-sm">
                  <li>Waterproof backpack/day pack</li>
                  <li>Headlamp/flashlight with extra batteries</li>
                  <li>Portable phone charger/power bank</li>
                  <li>Binoculars for wildlife viewing</li>
                  <li>Camera with extra memory cards</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">⚠️ Weather-Specific Additions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Winter (Dec-Feb):</strong>
                  <ul className="list-disc pl-5 text-red-700">
                    <li>Warm jacket/fleece</li>
                    <li>Thermal wear for early mornings</li>
                    <li>Woolen cap and gloves</li>
                  </ul>
                </div>
                <div>
                  <strong>Monsoon (Jun-Sep):</strong>
                  <ul className="list-disc pl-5 text-red-700">
                    <li>Quality rain gear/poncho</li>
                    <li>Waterproof bags for electronics</li>
                    <li>Quick-dry clothing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  ];

  const transportOptions = [
    {
      id: 'byAir',
      title: t('transport1'),
      description: t('transport1Desc'),
      icon: Plane,
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-600',
      modalContent: {
        title: "Air Travel to Jharkhand",
        content: (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">✈️ Main Airport</h4>
              <div className="text-green-700">
                <strong>Birsa Munda Airport (IXR), Ranchi</strong>
                <p className="mt-1">The primary gateway to Jharkhand, located 7 km from Ranchi city center.</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">Direct Connections:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <strong>Major Cities:</strong>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Delhi (2h 15m)</li>
                    <li>Mumbai (2h 30m)</li>
                    <li>Kolkata (1h 30m)</li>
                    <li>Bangalore (2h 45m)</li>
                    <li>Chennai (2h 40m)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <strong>Airlines Operating:</strong>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Air India</li>
                    <li>IndiGo</li>
                    <li>SpiceJet</li>
                    <li>Vistara</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🚌 Airport to City Transport</h4>
              <div className="space-y-2 text-green-700">
                <div><strong>Taxi:</strong> ₹200-400 to city center (20-30 mins)</div>
                <div><strong>Auto-rickshaw:</strong> ₹150-250 (negotiate fare)</div>
                <div><strong>Bus:</strong> City buses available, ₹20-50</div>
                <div><strong>App Cabs:</strong> Ola, Uber available</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">💡 Booking Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>Book 2-3 weeks in advance for better prices</li>
                <li>Check for connecting flights via Delhi/Kolkata for more options</li>
                <li>Early morning flights often have better punctuality</li>
                <li>Download airline apps for easy check-in and updates</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'byTrain',
      title: t('transport2'),
      description: t('transport2Desc'),
      icon: Train,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      modalContent: {
        title: "Rail Connectivity to Jharkhand",
        content: (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🚂 Major Railway Stations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700">
                <div>
                  <strong>Ranchi Junction (RNC)</strong>
                  <p className="text-sm">Capital city, well-connected to all major cities</p>
                </div>
                <div>
                  <strong>Dhanbad Junction (DHN)</strong>
                  <p className="text-sm">Coal capital, gateway to eastern Jharkhand</p>
                </div>
                <div>
                  <strong>Tatanagar Junction (TATA)</strong>
                  <p className="text-sm">Jamshedpur, industrial hub</p>
                </div>
                <div>
                  <strong>Bokaro Steel City (BKSC)</strong>
                  <p className="text-sm">Steel city with good connectivity</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">Popular Train Routes:</h4>
              <div className="space-y-3">
                <div className="border p-3 rounded">
                  <strong>Delhi to Ranchi:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Rajdhani Express: 16-17 hours (AC only)</li>
                    <li>• Swatantrata Senani Express: 18-19 hours</li>
                    <li>• Hatia Express: 20-21 hours</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Kolkata to Ranchi:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Shatabdi Express: 6-7 hours (fastest)</li>
                    <li>• Hatia Express: 7-8 hours</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Mumbai to Ranchi:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Via Nagpur/Bilaspur: 24-26 hours</li>
                    <li>• Book well in advance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🎫 Booking & Travel Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li>Book tickets 120 days in advance on IRCTC</li>
                <li>Consider AC sleeper for long journeys</li>
                <li>Download offline tickets on phone</li>
                <li>Carry snacks and water for longer routes</li>
                <li>Check train schedules as they may vary</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'byRoad',
      title: t('transport3'),
      description: t('transport3Desc'),
      icon: Car,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      modalContent: {
        title: "Road Transport in Jharkhand",
        content: (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-bold text-orange-800 mb-2">🚌 Bus Services</h4>
              <div className="space-y-3 text-orange-700">
                <div>
                  <strong>State Transport:</strong> Jharkhand State Road Transport Corporation (JSRTC)
                  <p className="text-sm">Regular services to all districts, economical and reliable</p>
                </div>
                <div>
                  <strong>Private Operators:</strong> Volvo, sleeper coaches available
                  <p className="text-sm">More comfortable for longer distances</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">Taxi & Car Rental:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-3 rounded">
                  <strong>App-based Cabs:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Ola, Uber available in major cities</li>
                    <li>• Good for city travel</li>
                    <li>• Book in advance for outstation</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Local Taxis:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Negotiate rates beforehand</li>
                    <li>• Better for remote destinations</li>
                    <li>• Drivers know local routes well</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">🛣️ Self-Drive Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>Carry valid driving license and vehicle documents</li>
                <li>GPS may not work in remote areas - download offline maps</li>
                <li>Fuel stations can be scarce in rural areas</li>
                <li>Road conditions vary - drive carefully in monsoon</li>
                <li>Keep emergency contacts and breakdown service numbers</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">⚠️ Important Routes</h4>
              <div className="text-red-700 text-sm space-y-2">
                <div><strong>NH-33:</strong> Kolkata to Ranchi via Dhanbad (scenic but heavy traffic)</div>
                <div><strong>NH-23:</strong> Ranchi to Raipur (connects to central India)</div>
                <div><strong>NH-99:</strong> Ranchi to Jamshedpur (industrial belt)</div>
              </div>
            </div>
          </div>
        )
      }
    }
  ];

  const safetyTips = [
    {
      id: 'health',
      title: t('safety1'),
      description: t('safety1Desc'),
      icon: Shield,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      modalContent: {
        title: "Health Precautions for Jharkhand Travel",
        content: (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">🦟 Vector-Borne Disease Prevention</h4>
              <div className="text-red-700 space-y-2">
                <div><strong>Malaria & Dengue:</strong> Common during monsoon season</div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Use DEET-based mosquito repellent (20% minimum)</li>
                  <li>Wear long sleeves during dawn/dusk</li>
                  <li>Sleep under mosquito nets if available</li>
                  <li>Remove stagnant water around accommodation</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">💊 Essential Medications to Carry:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-3 rounded">
                  <strong>Basic First Aid:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Paracetamol/Aspirin</li>
                    <li>• Antiseptic cream</li>
                    <li>• Bandages & gauze</li>
                    <li>• Oral rehydration salts</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Stomach Issues:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Anti-diarrheal medication</li>
                    <li>• Antacid tablets</li>
                    <li>• Probiotics</li>
                    <li>• Water purification tablets</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🥤 Food & Water Safety</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li>Drink only bottled or properly boiled water</li>
                <li>Avoid ice cubes unless from trusted sources</li>
                <li>Eat at busy, clean restaurants with high turnover</li>
                <li>Avoid raw vegetables/fruits unless you can peel them</li>
                <li>Street food: choose freshly cooked items served hot</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🏥 Medical Facilities</h4>
              <div className="text-green-700 space-y-2">
                <div><strong>Major Hospitals:</strong></div>
                <ul className="list-disc pl-5 text-sm">
                  <li>Ranchi: RIMS, Raj Hospital, Brahmanand Narain Multi-Speciality Hospital</li>
                  <li>Jamshedpur: Tata Motors Hospital, Brahmanand Narain Hospital</li>
                  <li>Dhanbad: Patliputra Medical College, Apollo Clinic</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ Pre-Travel Health Checklist</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>Consult doctor if you have chronic conditions</li>
                <li>Get travel insurance with medical coverage</li>
                <li>Carry enough prescription medications</li>
                <li>Know your blood type and allergies</li>
                <li>Consider hepatitis A/B and typhoid vaccinations</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'emergency',
      title: t('safety2'),
      description: t('safety2Desc'),
      icon: Phone,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      modalContent: {
        title: "Emergency Contacts & Safety Information",
        content: (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">🚨 National Emergency Numbers</h4>
              <div className="grid grid-cols-2 gap-4 text-red-700">
                <div><strong>Police:</strong> 100</div>
                <div><strong>Fire:</strong> 101</div>
                <div><strong>Ambulance:</strong> 108</div>
                <div><strong>Women Helpline:</strong> 1091</div>
                <div><strong>Tourist Helpline:</strong> 1363</div>
                <div><strong>Disaster Management:</strong> 1070</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">🏥 District-wise Emergency Contacts:</h4>
              <div className="space-y-3">
                <div className="border p-3 rounded">
                  <strong>Ranchi:</strong>
                  <div className="text-sm mt-1 space-y-1">
                    <div>Police Control Room: 0651-2563813</div>
                    <div>District Hospital: 0651-2562226</div>
                    <div>Fire Station: 0651-2562101</div>
                  </div>
                </div>
                <div className="border p-3 rounded">
                  <strong>Jamshedpur:</strong>
                  <div className="text-sm mt-1 space-y-1">
                    <div>Police Control Room: 0657-2426555</div>
                    <div>TATA Hospital: 0657-2345678</div>
                    <div>Fire Station: 0657-2426101</div>
                  </div>
                </div>
                <div className="border p-3 rounded">
                  <strong>Dhanbad:</strong>
                  <div className="text-sm mt-1 space-y-1">
                    <div>Police Control Room: 0326-2305525</div>
                    <div>District Hospital: 0326-2305500</div>
                    <div>Fire Station: 0326-2305101</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">📱 Important Apps to Download</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li><strong>SOS Emergency:</strong> One-touch emergency alerts</li>
                <li><strong>First Aid by Red Cross:</strong> Emergency medical guidance</li>
                <li><strong>Google Translate:</strong> For local language communication</li>
                <li><strong>What3Words:</strong> Share precise location in remote areas</li>
                <li><strong>TrueCaller:</strong> Identify unknown local numbers</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🏛️ Tourism Department Contacts</h4>
              <div className="text-green-700 space-y-2">
                <div><strong>Jharkhand Tourism:</strong> 0651-2491204</div>
                <div><strong>Tourist Information Centers:</strong></div>
                <ul className="list-disc pl-5 text-sm">
                  <li>Ranchi Airport: 0651-2582777</li>
                  <li>Ranchi Railway Station: 0651-2562829</li>
                  <li>Jamshedpur: 0657-2426717</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">💡 Safety Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>Save important numbers with local country code</li>
                <li>Share your itinerary with family/friends</li>
                <li>Keep emergency cash in multiple locations</li>
                <li>Inform your embassy if traveling internationally</li>
                <li>Register with local police if staying 14 days</li>
              </ul>
            </div>
          </div>
        )
      }
    },
    {
      id: 'weather',
      title: t('safety3'),
      description: t('safety3Desc'),
      icon: CloudRain,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      modalContent: {
        title: "Weather Awareness & Seasonal Precautions",
        content: (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🌧️ Monsoon Season (June - September)</h4>
              <div className="text-green-700 space-y-2">
                <strong>Heavy Rainfall Risks:</strong>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Flash floods in low-lying areas</li>
                  <li>Landslides in hilly regions</li>
                  <li>Road closures and transportation delays</li>
                  <li>Increased mosquito breeding</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">🌡️ Season-wise Precautions:</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 p-3">
                  <strong>Winter (December - February):</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Temperatures can drop to 5°C in mornings</li>
                    <li>• Carry warm clothing for early morning activities</li>
                    <li>• Fog may affect visibility and transport</li>
                  </ul>
                </div>
                <div className="border-l-4 border-yellow-500 p-3">
                  <strong>Summer (March - May):</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Temperatures reach 40°C+ in May</li>
                    <li>• Risk of heat exhaustion and dehydration</li>
                    <li>• Avoid outdoor activities during peak hours (11am-4pm)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 p-3">
                  <strong>Post-Monsoon (October - November):</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Ideal weather but increased mosquito activity</li>
                    <li>• Roads may still be muddy in rural areas</li>
                    <li>• Perfect time for outdoor activities</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">⚠️ Weather-Related Safety Measures</h4>
              <ul className="list-disc pl-5 space-y-1 text-red-700">
                <li>Check weather forecasts daily during monsoon</li>
                <li>Avoid river crossings during heavy rains</li>
                <li>Stay indoors during thunderstorms</li>
                <li>Keep emergency supplies: water, snacks, flashlight</li>
                <li>Have backup accommodation bookings</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">📱 Weather Monitoring Apps</h4>
              <div className="text-green-700 space-y-2">
                <ul className="list-disc pl-5 text-sm">
                  <li><strong>IMD Weather:</strong> Official India Meteorological Department</li>
                  <li><strong>AccuWeather:</strong> Detailed hourly forecasts</li>
                  <li><strong>Windy:</strong> Wind and precipitation maps</li>
                  <li><strong>Mausam:</strong> Government weather app with alerts</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">🎯 Activity-Specific Weather Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Trekking/Hiking:</strong>
                  <ul className="list-disc pl-3 text-yellow-700">
                    <li>Start early to avoid afternoon heat</li>
                    <li>Check trail conditions after rain</li>
                    <li>Carry rain gear even in dry season</li>
                  </ul>
                </div>
                <div>
                  <strong>Wildlife Photography:</strong>
                  <ul className="list-disc pl-3 text-yellow-700">
                    <li>Early morning has best light and activity</li>
                    <li>Protect equipment from moisture</li>
                    <li>Animals more active in cooler hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  ];

  const culturalTips = [
    {
      id: 'tribal',
      title: t('culture1'),
      description: t('culture1Desc'),
      icon: Heart,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      modalContent: {
        title: "Tribal Culture Sensitivity & Etiquette",
        content: (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold text-purple-800 mb-2">🏘️ Major Tribal Communities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700">
                <div>
                  <strong>Santhal:</strong> Largest tribe, known for dance and music
                </div>
                <div>
                  <strong>Munda:</strong> Known for agriculture and traditional governance
                </div>
                <div>
                  <strong>Oraon:</strong> Rich in folklore and traditional crafts
                </div>
                <div>
                  <strong>Ho:</strong> Skilled in metalwork and traditional medicine
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">🤝 Interaction Guidelines:</h4>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded">
                  <strong className="text-green-800">DO:</strong>
                  <ul className="list-disc pl-5 text-sm text-green-700 mt-1 space-y-1">
                    <li>Greet with "Namaskar" or local greeting</li>
                    <li>Remove shoes before entering homes</li>
                    <li>Accept offered food/drink graciously</li>
                    <li>Show respect to elderly community members</li>
                    <li>Ask permission before taking photographs</li>
                    <li>Dress modestly, especially women</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <strong className="text-red-800">DON'T:</strong>
                  <ul className="list-disc pl-5 text-sm text-red-700 mt-1 space-y-1">
                    <li>Point with index finger - use open hand</li>
                    <li>Touch someone's head or feet</li>
                    <li>Refuse offered hospitality</li>
                    <li>Interrupt religious ceremonies</li>
                    <li>Wear revealing clothing</li>
                    <li>Show sole of feet to others</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">📸 Photography Etiquette</h4>
              <ul className="list-disc pl-5 space-y-1 text-green-700">
                <li>Always ask permission before photographing people</li>
                <li>Respect if someone declines to be photographed</li>
                <li>Avoid flash photography during ceremonies</li>
                <li>Don't photograph sacred objects without permission</li>
                <li>Consider sharing photos with the community later</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">🎁 Supporting Communities</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                <li>Buy authentic handicrafts directly from artisans</li>
                <li>Stay in community-run homestays when available</li>
                <li>Hire local guides for village visits</li>
                <li>Participate in cultural exchange programs</li>
                <li>Respect fair pricing - bargaining should be reasonable</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-bold text-orange-800 mb-2">🌿 Sacred Spaces & Traditions</h4>
              <div className="text-orange-700 space-y-2">
                <div><strong>Sacred Groves (Devrais):</strong> Don't disturb plants or wildlife</div>
                <div><strong>Ancestral Worship Sites:</strong> Maintain respectful distance</div>
                <div><strong>Traditional Dance/Music:</strong> Enjoy but don't interrupt</div>
                <div><strong>Festivals:</strong> Participate only when invited</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'cuisine',
      title: t('culture2'),
      description: t('culture2Desc'),
      icon: Utensils,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      modalContent: {
        title: "Jharkhand Local Cuisine Guide",
        content: (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-bold text-orange-800 mb-2">🍽️ Must-Try Traditional Dishes</h4>
              <div className="space-y-3 text-orange-700">
                <div>
                  <strong>Litti Chokha:</strong> Roasted wheat balls with mashed vegetables
                  <p className="text-sm">Iconic dish, best enjoyed with ghee and green chutney</p>
                </div>
                <div>
                  <strong>Dhuska:</strong> Deep-fried lentil pancakes
                  <p className="text-sm">Perfect breakfast item, served with curry or chutney</p>
                </div>
                <div>
                  <strong>Pittha:</strong> Steamed rice cakes
                  <p className="text-sm">Traditional tribal dish, often made during festivals</p>
                </div>
                <div>
                  <strong>Bamboo Shoot Curry:</strong> Tribal delicacy
                  <p className="text-sm">Unique flavor, rich in nutrients</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">🌶️ Regional Specialties by Area:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-3 rounded">
                  <strong>Ranchi Region:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Rugra (mushroom curry)</li>
                    <li>• Arsa (sweet jaggery fritters)</li>
                    <li>• Thekua (traditional sweet)</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Santhal Pargana:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Handia (rice beer)</li>
                    <li>• Khortha dishes</li>
                    <li>• Wild greens preparation</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Palamau Region:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Game meat preparations</li>
                    <li>• Forest honey varieties</li>
                    <li>• Mahua flower dishes</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>Chota Nagpur:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Tribal rice varieties</li>
                    <li>• Leaf-wrapped fish</li>
                    <li>• Herbal preparations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🥘 Where to Find Authentic Food</h4>
              <div className="text-green-700 space-y-2">
                <div><strong>Local Dhabas:</strong> Roadside eateries serving fresh, authentic meals</div>
                <div><strong>Tribal Villages:</strong> Home-cooked meals through homestay programs</div>
                <div><strong>Weekly Markets (Haats):</strong> Fresh ingredients and traditional snacks</div>
                <div><strong>Festival Time:</strong> Community kitchens during religious celebrations</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🍃 Unique Ingredients to Try</h4>
              <div className="grid grid-cols-2 gap-4 text-green-700 text-sm">
                <div>
                  <strong>Sarso Ka Saag:</strong> Mustard leaves
                </div>
                <div>
                  <strong>Koinar:</strong> Wild cashew fruit
                </div>
                <div>
                  <strong>Mahua:</strong> Madhuca flowers
                </div>
                <div>
                  <strong>Kendu:</strong> Indian persimmon
                </div>
                <div>
                  <strong>Sal Seeds:</strong> Forest nuts
                </div>
                <div>
                  <strong>Chimta:</strong> Wild greens
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">⚠️ Food Safety Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-red-700">
                <li>Start with mild spices and gradually try spicier foods</li>
                <li>Ensure meat and fish are thoroughly cooked</li>
                <li>Drink water after spicy meals to aid digestion</li>
                <li>Try local foods gradually to avoid stomach upset</li>
                <li>Ask about ingredients if you have allergies</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold text-purple-800 mb-2">🍷 Traditional Beverages</h4>
              <div className="text-purple-700 space-y-2">
                <div><strong>Handia:</strong> Fermented rice drink (alcoholic)</div>
                <div><strong>Mahua Wine:</strong> Made from Mahua flowers</div>
                <div><strong>Sal Rasa:</strong> Fresh sal tree sap drink</div>
                <div><strong>Herbal Teas:</strong> Made from local medicinal plants</div>
                <p className="text-sm italic">Note: Consume traditional alcoholic beverages responsibly and in moderation</p>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'festivals',
      title: t('culture3'),
      description: t('culture3Desc'),
      icon: Star,
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      modalContent: {
        title: "Festivals & Cultural Celebrations",
        content: (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">🌸 Major Tribal Festivals</h4>
              <div className="space-y-3 text-yellow-700">
                <div>
                  <strong>Sarhul (March-April):</strong> Spring festival welcoming new season
                  <p className="text-sm">Worship of Sal trees, traditional dance, community feasting</p>
                </div>
                <div>
                  <strong>Karma (August-September):</strong> Harvest festival
                  <p className="text-sm">Karma tree worship, folk songs, community bonding</p>
                </div>
                <div>
                  <strong>Sohrai (October-November):</strong> Cattle worship festival
                  <p className="text-sm">Wall paintings, cattle decoration, thanksgiving</p>
                </div>
                <div>
                  <strong>Tusu Parab (December-January):</strong> Winter festival
                  <p className="text-sm">Folk music, traditional dances, bonfires</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3">🎭 Festival Experiences for Visitors:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-3 rounded">
                  <strong>What You Can Expect:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Traditional music and dance performances</li>
                    <li>• Community feasts with local delicacies</li>
                    <li>• Colorful traditional attire</li>
                    <li>• Ritual ceremonies and prayers</li>
                    <li>• Handicraft exhibitions</li>
                  </ul>
                </div>
                <div className="border p-3 rounded">
                  <strong>How to Participate:</strong>
                  <ul className="text-sm mt-1 space-y-1">
                    <li>• Contact local guides for invitations</li>
                    <li>• Join organized cultural tours</li>
                    <li>• Stay in community homestays</li>
                    <li>• Respect customs and dress codes</li>
                    <li>• Bring small gifts if invited to homes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🎨 Traditional Arts & Crafts</h4>
              <div className="text-green-700 space-y-2">
                <div><strong>Sohrai Paintings:</strong> Traditional wall art with natural pigments</div>
                <div><strong>Paitkar Paintings:</strong> Scroll paintings telling stories</div>
                <div><strong>Dokra Art:</strong> Metal craft using lost-wax technique</div>
                <div><strong>Bamboo Crafts:</strong> Baskets, furniture, decorative items</div>
                <div><strong>Tribal Jewelry:</strong> Silver ornaments with traditional designs</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🎵 Music & Dance Traditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <strong>Popular Dances:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Karma Dance - Harvest celebration</li>
                    <li>Jhumair - Group folk dance</li>
                    <li>Domkach - Festive dance</li>
                    <li>Sarhul Dance - Spring festival</li>
                  </ul>
                </div>
                <div>
                  <strong>Musical Instruments:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Mandar - Traditional drum</li>
                    <li>Flute - Bamboo wind instrument</li>
                    <li>Tamak - Percussion instrument</li>
                    <li>Nagara - Large drum</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">📅 Festival Calendar (2024-2025)</h4>
              <div className="text-red-700 text-sm space-y-2">
                <div><strong>March 2024:</strong> Sarhul (15-17 March)</div>
                <div><strong>August 2024:</strong> Karma Puja (31 August)</div>
                <div><strong>October 2024:</strong> Sohrai (2-4 November)</div>
                <div><strong>December 2024:</strong> Tusu Parab (14-16 January 2025)</div>
                <p className="italic">*Dates may vary based on lunar calendar. Check with local tourism office.</p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold text-purple-800 mb-2">🎯 Tips for Festival Participation</h4>
              <ul className="list-disc pl-5 space-y-1 text-purple-700">
                <li>Book accommodations well in advance during festival seasons</li>
                <li>Carry traditional clothes or buy locally</li>
                <li>Learn basic greetings in local languages</li>
                <li>Respect photography restrictions during ceremonies</li>
                <li>Participate in community service activities if invited</li>
                <li>Try traditional foods prepared specially for festivals</li>
              </ul>
            </div>
          </div>
        )
      }
    }
  ];

  const quickChecklist = [
    "Valid ID and travel documents",
    "Hotel booking confirmations",
    "Emergency contact numbers",
    "Travel insurance (recommended)",
    "Cash and cards",
    "Medicines and first aid kit",
    "Weather-appropriate clothing",
    "Camera and chargers",
    "Local guidebook or offline maps",
    "Comfortable walking shoes"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-800 via-green-700 to-green-900" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1715731456131-d4c3697a20f0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxncmVlbiUyMG5hdHVyZXxlbnwwfHx8Z3JlZW58MTc1NzMzNTM4NHww&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-green-900/30"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('practicalTipsTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('practicalTipsSubtitle')}
            </p>
            <Button className="bg-white text-green-800 hover:bg-gray-100 px-8 py-3 text-lg">
              {t('planYourTrip')}
            </Button>
          </div>
        </div>
      </section>

      {/* Before You Go Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('beforeYouGo')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {beforeYouGoTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => setSelectedModal(tip.modalContent)}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full ${tip.bgColor} mb-6`}>
                    <tip.icon className={`h-8 w-8 ${tip.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{tip.title}</h3>
                  <p className="text-muted-foreground mb-4">{tip.description}</p>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Around Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('gettingAround')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transportOptions.map((transport, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => setSelectedModal(transport.modalContent)}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full ${transport.bgColor} mb-6`}>
                    <transport.icon className={`h-8 w-8 ${transport.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{transport.title}</h3>
                  <p className="text-muted-foreground mb-4">{transport.description}</p>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('safetyTips')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {safetyTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => setSelectedModal(tip.modalContent)}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full ${tip.bgColor} mb-6`}>
                    <tip.icon className={`h-8 w-8 ${tip.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{tip.title}</h3>
                  <p className="text-muted-foreground mb-4">{tip.description}</p>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Tips Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('culturalTips')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {culturalTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => setSelectedModal(tip.modalContent)}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full ${tip.bgColor} mb-6`}>
                    <tip.icon className={`h-8 w-8 ${tip.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{tip.title}</h3>
                  <p className="text-muted-foreground mb-4">{tip.description}</p>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Checklist Section */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pre-Travel Checklist
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Don't forget these essentials for your Jharkhand adventure
              </p>
            </div>
            
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickChecklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Explore Jharkhand?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Armed with these tips, you're all set for an amazing journey through Jharkhand's wonders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3">
                {t('exploreDestinations')}
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
              >
                {t('aiPlanner')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modal for detailed information */}
      <Modal
        isOpen={!!selectedModal}
        onClose={() => setSelectedModal(null)}
        title={selectedModal?.title || ""}
      >
        {selectedModal?.content}
      </Modal>
    </div>
  );
};

export default PracticalTipsPage;
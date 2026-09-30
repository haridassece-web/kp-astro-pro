/**
 * Cities Database for KP Astrology
 * Includes Tamil Nadu districts/cities, major Indian cities, and global capitals
 */

export const CITIES = [
  // Tamil Nadu
  { name: 'Chennai', tamil: 'சென்னை', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Coimbatore', tamil: 'கோயம்புத்தூர்', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, tz: 5.5 },
  { name: 'Madurai', tamil: 'மதுரை', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, tz: 5.5 },
  { name: 'Tiruchirappalli', tamil: 'திருச்சிராப்பள்ளி', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, tz: 5.5 },
  { name: 'Salem', tamil: 'சேலம்', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460, tz: 5.5 },
  { name: 'Tirunelveli', tamil: 'திருநெல்வேலி', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567, tz: 5.5 },
  { name: 'Tiruppur', tamil: 'திருப்பூர்', state: 'Tamil Nadu', lat: 11.1085, lng: 77.3411, tz: 5.5 },
  { name: 'Erode', tamil: 'ஈரோடு', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172, tz: 5.5 },
  { name: 'Vellore', tamil: 'வேலூர்', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325, tz: 5.5 },
  { name: 'Thanjavur', tamil: 'தஞ்சாவூர்', state: 'Tamil Nadu', lat: 10.7870, lng: 79.1378, tz: 5.5 },
  { name: 'Dindigul', tamil: 'திண்டுக்கல்', state: 'Tamil Nadu', lat: 10.3673, lng: 77.9803, tz: 5.5 },
  { name: 'Kanchipuram', tamil: 'காஞ்சிபுரம்', state: 'Tamil Nadu', lat: 12.8342, lng: 79.7036, tz: 5.5 },
  { name: 'Kumbakonam', tamil: 'கும்பகோணம்', state: 'Tamil Nadu', lat: 10.9602, lng: 79.3845, tz: 5.5 },
  { name: 'Nagercoil', tamil: 'நாகர்கோவில்', state: 'Tamil Nadu', lat: 8.1833, lng: 77.4119, tz: 5.5 },
  { name: 'Cuddalore', tamil: 'கடலூர்', state: 'Tamil Nadu', lat: 11.7480, lng: 79.7714, tz: 5.5 },
  { name: 'Karur', tamil: 'கரூர்', state: 'Tamil Nadu', lat: 10.9601, lng: 78.0766, tz: 5.5 },
  { name: 'Pudukkottai', tamil: 'புதுக்கோட்டை', state: 'Tamil Nadu', lat: 10.3833, lng: 78.8001, tz: 5.5 },
  { name: 'Sivakasi', tamil: 'சிவகாசி', state: 'Tamil Nadu', lat: 9.4533, lng: 77.7947, tz: 5.5 },
  { name: 'Ramanathapuram', tamil: 'ராமநாதபுரம்', state: 'Tamil Nadu', lat: 9.3639, lng: 78.8395, tz: 5.5 },
  { name: 'Nagapattinam', tamil: 'நாகப்பட்டினம்', state: 'Tamil Nadu', lat: 10.7672, lng: 79.8449, tz: 5.5 },
  { name: 'Hosur', tamil: 'ஓசூர்', state: 'Tamil Nadu', lat: 12.7409, lng: 77.8253, tz: 5.5 },
  { name: 'Thiruvannamalai', tamil: 'திருவண்ணாமலை', state: 'Tamil Nadu', lat: 12.2253, lng: 79.0747, tz: 5.5 },
  { name: 'Tuticorin', tamil: 'தூத்துக்குடி', state: 'Tamil Nadu', lat: 8.7642, lng: 78.1348, tz: 5.5 },
  { name: 'Kanyakumari', tamil: 'கன்னியாகுமரி', state: 'Tamil Nadu', lat: 8.0883, lng: 77.5385, tz: 5.5 },
  { name: 'Pondicherry', tamil: 'பாண்டிச்சேரி', state: 'Puducherry', lat: 11.9416, lng: 79.8083, tz: 5.5 },

  // Major Indian Cities
  { name: 'Bengaluru', tamil: 'பெங்களூரு', state: 'Karnataka', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Hyderabad', tamil: 'ஹைதராபாத்', state: 'Telangana', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Mumbai', tamil: 'மும்பை', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'New Delhi', tamil: 'புது தில்லி', state: 'Delhi', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Kolkata', tamil: 'கொல்கத்தா', state: 'West Bengal', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'Kochi', tamil: 'கொச்சி', state: 'Kerala', lat: 9.9312, lng: 76.2673, tz: 5.5 },
  { name: 'Thiruvananthapuram', tamil: 'திருவனந்தபுரம்', state: 'Kerala', lat: 8.5241, lng: 76.9366, tz: 5.5 },
  { name: 'Pune', tamil: 'புனே', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, tz: 5.5 },
  { name: 'Ahmedabad', tamil: 'அகமதாபாத்', state: 'Gujarat', lat: 23.0225, lng: 72.5714, tz: 5.5 },
  { name: 'Jaipur', tamil: 'ஜெய்ப்பூர்', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, tz: 5.5 },

  // Global Diaspora & Capitals
  { name: 'Singapore', tamil: 'சிங்கப்பூர்', state: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8.0 },
  { name: 'Kuala Lumpur', tamil: 'கோலாலம்பூர்', state: 'Malaysia', lat: 3.1390, lng: 101.6869, tz: 8.0 },
  { name: 'Colombo', tamil: 'கொழும்பு', state: 'Sri Lanka', lat: 6.9271, lng: 79.8612, tz: 5.5 },
  { name: 'Jaffna', tamil: 'யாழ்ப்பாணம்', state: 'Sri Lanka', lat: 9.6615, lng: 80.0255, tz: 5.5 },
  { name: 'Dubai', tamil: 'துபாய்', state: 'UAE', lat: 25.2048, lng: 55.2708, tz: 4.0 },
  { name: 'London', tamil: 'லண்டன்', state: 'UK', lat: 51.5074, lng: -0.1278, tz: 0.0 },
  { name: 'New York', tamil: 'நியூயார்க்', state: 'USA', lat: 40.7128, lng: -74.0060, tz: -5.0 },
  { name: 'San Francisco', tamil: 'சான் பிரான்சிஸ்கோ', state: 'USA', lat: 37.7749, lng: -122.4194, tz: -8.0 },
  { name: 'Toronto', tamil: 'டொராண்டோ', state: 'Canada', lat: 43.6532, lng: -79.3832, tz: -5.0 },
  { name: 'Sydney', tamil: 'சிட்னி', state: 'Australia', lat: -33.8688, lng: 151.2093, tz: 10.0 },
  { name: 'Paris', tamil: 'பாரிஸ்', state: 'France', lat: 48.8566, lng: 2.3522, tz: 1.0 }
];

export function findCity(name) {
  const q = name.toLowerCase().trim();
  return CITIES.find(c => c.name.toLowerCase() === q || c.tamil === q) || CITIES[0];
}

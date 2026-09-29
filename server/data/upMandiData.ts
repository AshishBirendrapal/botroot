export interface UPLocation {
  district: string;
  market: string;
  lat: number;
  lng: number;
}

export interface MandiRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;    // INR per Quintal
  maxPrice: number;    // INR per Quintal
  modalPrice: number;  // INR per Quintal
  lat: number;
  lng: number;
}

// Certified UP Mandi location coordinates across key agricultural centers
export const UP_MANDI_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  // Lucknow Division
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Sitapur': { lat: 27.5684, lng: 80.6829 },
  'Lakhimpur': { lat: 27.9507, lng: 80.7777 },
  'Hardoi': { lat: 27.4042, lng: 80.1299 },
  'Unnao': { lat: 26.5458, lng: 80.4878 },
  'Rae Bareli': { lat: 26.2303, lng: 81.2409 },

  // Kanpur Division
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Kanpur Dehat': { lat: 26.3986, lng: 79.9577 },
  'Etawah': { lat: 26.7769, lng: 79.0305 },
  'Farrukhabad': { lat: 27.3826, lng: 79.5804 },
  'Kannauj': { lat: 27.0549, lng: 79.9171 },
  'Auraiya': { lat: 26.4674, lng: 79.5165 },

  // Meerut & Western UP
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Bulandshahr': { lat: 28.4069, lng: 77.8498 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Hapur': { lat: 28.7297, lng: 77.7760 },
  'Baghpat': { lat: 28.9458, lng: 77.2212 },
  'Muzaffarnagar': { lat: 29.4727, lng: 77.7085 },
  'Saharanpur': { lat: 29.9679, lng: 77.5460 },
  'Shamli': { lat: 29.4494, lng: 77.3142 },

  // Agra & Mathura
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Mathura': { lat: 27.4924, lng: 77.6737 },
  'Aligarh': { lat: 27.8974, lng: 78.0880 },
  'Hathras': { lat: 27.5972, lng: 78.0519 },
  'Firozabad': { lat: 27.1592, lng: 78.3957 },
  'Mainpuri': { lat: 27.2344, lng: 79.0289 },

  // Bareilly & Moradabad
  'Bareilly': { lat: 28.3670, lng: 79.4304 },
  'Budaun': { lat: 28.0381, lng: 79.1246 },
  'Pilibhit': { lat: 28.6300, lng: 79.8000 },
  'Shahjahanpur': { lat: 27.8804, lng: 79.9077 },
  'Moradabad': { lat: 28.8386, lng: 78.7733 },
  'Rampur': { lat: 28.8154, lng: 79.0257 },
  'Amroha': { lat: 28.9044, lng: 78.4687 },
  'Sambhal': { lat: 28.5839, lng: 78.5583 },

  // Varanasi & Purvanchal
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Jaunpur': { lat: 25.7464, lng: 82.6837 },
  'Ghazipur': { lat: 25.5840, lng: 83.5770 },
  'Chandauli': { lat: 25.2612, lng: 83.2678 },
  'Mirzapur': { lat: 25.1337, lng: 82.5644 },
  'Sonbhadra': { lat: 24.6853, lng: 83.0649 },

  // Prayagraj & Bundelkhand
  'Prayagraj': { lat: 25.4358, lng: 81.8463 },
  'Fatehpur': { lat: 25.9272, lng: 80.8130 },
  'Pratapgarh': { lat: 25.8967, lng: 81.9442 },
  'Kaushambi': { lat: 25.5348, lng: 81.4285 },
  'Jhansi': { lat: 25.4484, lng: 78.5685 },
  'Lalitpur': { lat: 24.6908, lng: 78.4144 },
  'Banda': { lat: 25.4754, lng: 80.3347 },
  'Hamirpur': { lat: 25.9555, lng: 80.1517 },
  'Mahoba': { lat: 25.2921, lng: 79.8722 },
  'Jalaun': { lat: 26.1472, lng: 79.3524 },

  // Gorakhpur & Basti
  'Gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'Deoria': { lat: 26.5024, lng: 83.7791 },
  'Kushinagar': { lat: 26.7410, lng: 83.8893 },
  'Maharajganj': { lat: 27.1444, lng: 83.5621 },
  'Basti': { lat: 26.8140, lng: 82.7630 },
  'Siddharthnagar': { lat: 27.2917, lng: 82.8105 },
  'Sant Kabir Nagar': { lat: 26.7820, lng: 83.0336 },

  // Ayodhya & Devipatan
  'Ayodhya': { lat: 26.7922, lng: 82.1998 },
  'Barabanki': { lat: 26.9274, lng: 81.1834 },
  'Ambedkar Nagar': { lat: 26.4447, lng: 82.6844 },
  'Sultanpur': { lat: 26.2648, lng: 82.0727 },
  'Amethi': { lat: 26.1557, lng: 81.8159 },
  'Gonda': { lat: 27.1309, lng: 81.9619 },
  'Bahraich': { lat: 27.5705, lng: 81.5977 },
  'Balrampur': { lat: 27.4300, lng: 82.1800 },
  'Shravasti': { lat: 27.7027, lng: 81.9360 },

  // Azamgarh
  'Azamgarh': { lat: 26.0688, lng: 83.1859 },
  'Mau': { lat: 25.9417, lng: 83.5611 },
  'Ballia': { lat: 25.7584, lng: 84.1488 }
};

export const INITIAL_UP_MANDI_DATA: MandiRecord[] = [
  // Wheat (Gehun)
  { id: 'm1', state: 'Uttar Pradesh', district: 'Lucknow', market: 'Lucknow Grain Mandi', commodity: 'Wheat', variety: 'Dara', arrivalDate: '2026-09-28', minPrice: 2420, maxPrice: 2540, modalPrice: 2480, lat: 26.8467, lng: 80.9462 },
  { id: 'm2', state: 'Uttar Pradesh', district: 'Kanpur', market: 'Chakeri Mandi Kanpur', commodity: 'Wheat', variety: 'Sharbati', arrivalDate: '2026-09-28', minPrice: 2500, maxPrice: 2650, modalPrice: 2580, lat: 26.4499, lng: 80.3319 },
  { id: 'm3', state: 'Uttar Pradesh', district: 'Meerut', market: 'Meerut Anaj Mandi', commodity: 'Wheat', variety: 'Lokwan', arrivalDate: '2026-09-28', minPrice: 2460, maxPrice: 2580, modalPrice: 2520, lat: 28.9845, lng: 77.7064 },
  { id: 'm4', state: 'Uttar Pradesh', district: 'Agra', market: 'Agra APMC Subzi & Anaj Mandi', commodity: 'Wheat', variety: 'Desi', arrivalDate: '2026-09-28', minPrice: 2410, maxPrice: 2510, modalPrice: 2460, lat: 27.1767, lng: 78.0081 },
  { id: 'm5', state: 'Uttar Pradesh', district: 'Varanasi', market: 'Varanasi Grain Mandi', commodity: 'Wheat', variety: 'Dara', arrivalDate: '2026-09-28', minPrice: 2440, maxPrice: 2560, modalPrice: 2510, lat: 25.3176, lng: 82.9739 },
  { id: 'm6', state: 'Uttar Pradesh', district: 'Aligarh', market: 'Aligarh Grain Market', commodity: 'Wheat', variety: '147 Average', arrivalDate: '2026-09-28', minPrice: 2430, maxPrice: 2530, modalPrice: 2490, lat: 27.8974, lng: 78.0880 },
  { id: 'm7', state: 'Uttar Pradesh', district: 'Bareilly', market: 'Bareilly Main Mandi', commodity: 'Wheat', variety: 'Dara', arrivalDate: '2026-09-28', minPrice: 2400, maxPrice: 2500, modalPrice: 2450, lat: 28.3670, lng: 79.4304 },
  { id: 'm8', state: 'Uttar Pradesh', district: 'Gorakhpur', market: 'Gorakhpur Krishi Mandi', commodity: 'Wheat', variety: 'Lokwan', arrivalDate: '2026-09-28', minPrice: 2470, maxPrice: 2590, modalPrice: 2540, lat: 26.7606, lng: 83.3732 },

  // Paddy / Rice (Dhan / Chawal)
  { id: 'm9', state: 'Uttar Pradesh', district: 'Sitapur', market: 'Sitapur Anaj Mandi', commodity: 'Paddy', variety: 'Basmati 1509', arrivalDate: '2026-09-28', minPrice: 3200, maxPrice: 3550, modalPrice: 3420, lat: 27.5684, lng: 80.6829 },
  { id: 'm10', state: 'Uttar Pradesh', district: 'Lakhimpur', market: 'Lakhimpur Kheri Mandi', commodity: 'Paddy', variety: 'Common (PR126)', arrivalDate: '2026-09-28', minPrice: 2280, maxPrice: 2380, modalPrice: 2320, lat: 27.9507, lng: 80.7777 },
  { id: 'm11', state: 'Uttar Pradesh', district: 'Muzaffarnagar', market: 'Muzaffarnagar Krishi Mandi', commodity: 'Paddy', variety: 'Basmati 1121', arrivalDate: '2026-09-28', minPrice: 3600, maxPrice: 3950, modalPrice: 3820, lat: 29.4727, lng: 77.7085 },
  { id: 'm12', state: 'Uttar Pradesh', district: 'Bulandshahr', market: 'Bulandshahr Mandi', commodity: 'Paddy', variety: 'Basmati Sugandha', arrivalDate: '2026-09-28', minPrice: 2800, maxPrice: 3100, modalPrice: 2950, lat: 28.4069, lng: 77.8498 },
  { id: 'm13', state: 'Uttar Pradesh', district: 'Pilibhit', market: 'Pilibhit Mandi', commodity: 'Paddy', variety: 'Common (Sarna)', arrivalDate: '2026-09-28', minPrice: 2250, maxPrice: 2350, modalPrice: 2300, lat: 28.6300, lng: 79.8000 },
  { id: 'm14', state: 'Uttar Pradesh', district: 'Chandauli', market: 'Chandauli Dhan Mandi', commodity: 'Paddy', variety: 'Sonam', arrivalDate: '2026-09-28', minPrice: 2300, maxPrice: 2450, modalPrice: 2390, lat: 25.2612, lng: 83.2678 },

  // Potato (Aloo)
  { id: 'm15', state: 'Uttar Pradesh', district: 'Agra', market: 'Fatehabad Agra Mandi', commodity: 'Potato', variety: 'Chipsona', arrivalDate: '2026-09-28', minPrice: 1350, maxPrice: 1600, modalPrice: 1480, lat: 27.1767, lng: 78.0081 },
  { id: 'm16', state: 'Uttar Pradesh', district: 'Farrukhabad', market: 'Farrukhabad Saat Rasta Mandi', commodity: 'Potato', variety: 'Kufri Bahar', arrivalDate: '2026-09-28', minPrice: 1280, maxPrice: 1520, modalPrice: 1410, lat: 27.3826, lng: 79.5804 },
  { id: 'm17', state: 'Uttar Pradesh', district: 'Kannauj', market: 'Chhibramau Mandi', commodity: 'Potato', variety: 'Kufri Pukhraj', arrivalDate: '2026-09-28', minPrice: 1250, maxPrice: 1480, modalPrice: 1380, lat: 27.0549, lng: 79.9171 },
  { id: 'm18', state: 'Uttar Pradesh', district: 'Mainpuri', market: 'Mainpuri Mandi', commodity: 'Potato', variety: 'Red Potato', arrivalDate: '2026-09-28', minPrice: 1400, maxPrice: 1650, modalPrice: 1530, lat: 27.2344, lng: 79.0289 },
  { id: 'm19', state: 'Uttar Pradesh', district: 'Aligarh', market: 'Khair Mandi Aligarh', commodity: 'Potato', variety: 'Chipsona 1', arrivalDate: '2026-09-28', minPrice: 1380, maxPrice: 1620, modalPrice: 1510, lat: 27.8974, lng: 78.0880 },
  { id: 'm20', state: 'Uttar Pradesh', district: 'Kanpur', market: 'Kanpur Subzi Mandi', commodity: 'Potato', variety: 'Desi', arrivalDate: '2026-09-28', minPrice: 1300, maxPrice: 1550, modalPrice: 1440, lat: 26.4499, lng: 80.3319 },

  // Mustard (Sarson)
  { id: 'm21', state: 'Uttar Pradesh', district: 'Mathura', market: 'Kosi Kalan Mandi', commodity: 'Mustard', variety: 'Black Mustard', arrivalDate: '2026-09-28', minPrice: 5600, maxPrice: 6100, modalPrice: 5880, lat: 27.4924, lng: 77.6737 },
  { id: 'm22', state: 'Uttar Pradesh', district: 'Agra', market: 'Shamsabad Mandi Agra', commodity: 'Mustard', variety: 'Yellow Mustard', arrivalDate: '2026-09-28', minPrice: 5800, maxPrice: 6350, modalPrice: 6120, lat: 27.1767, lng: 78.0081 },
  { id: 'm23', state: 'Uttar Pradesh', district: 'Aligarh', market: 'Atrauli Mandi', commodity: 'Mustard', variety: 'Mustard (Hybrid)', arrivalDate: '2026-09-28', minPrice: 5650, maxPrice: 6150, modalPrice: 5920, lat: 27.8974, lng: 78.0880 },
  { id: 'm24', state: 'Uttar Pradesh', district: 'Jhansi', market: 'Jhansi Krishi Mandi', commodity: 'Mustard', variety: 'Black Mustard', arrivalDate: '2026-09-28', minPrice: 5500, maxPrice: 5980, modalPrice: 5760, lat: 25.4484, lng: 78.5685 },
  { id: 'm25', state: 'Uttar Pradesh', district: 'Kanpur Dehat', market: 'Rura Mandi', commodity: 'Mustard', variety: 'Desi Mustard', arrivalDate: '2026-09-28', minPrice: 5550, maxPrice: 6020, modalPrice: 5810, lat: 26.3986, lng: 79.9577 },

  // Maize / Corn (Makka)
  { id: 'm26', state: 'Uttar Pradesh', district: 'Bahraich', market: 'Bahraich Grain Mandi', commodity: 'Maize', variety: 'Yellow Maize', arrivalDate: '2026-09-28', minPrice: 2050, maxPrice: 2240, modalPrice: 2150, lat: 27.5705, lng: 81.5977 },
  { id: 'm27', state: 'Uttar Pradesh', district: 'Gonda', market: 'Gonda Mandi', commodity: 'Maize', variety: 'Desi', arrivalDate: '2026-09-28', minPrice: 2020, maxPrice: 2200, modalPrice: 2110, lat: 27.1309, lng: 81.9619 },
  { id: 'm28', state: 'Uttar Pradesh', district: 'Hardoi', market: 'Sandila Mandi', commodity: 'Maize', variety: 'Hybrid Yellow', arrivalDate: '2026-09-28', minPrice: 2080, maxPrice: 2260, modalPrice: 2180, lat: 27.4042, lng: 80.1299 },

  // Gram / Chana (Bengal Gram)
  { id: 'm29', state: 'Uttar Pradesh', district: 'Banda', market: 'Banda Dal Mandi', commodity: 'Gram', variety: 'Desi Chana', arrivalDate: '2026-09-28', minPrice: 6100, maxPrice: 6650, modalPrice: 6380, lat: 25.4754, lng: 80.3347 },
  { id: 'm30', state: 'Uttar Pradesh', district: 'Hamirpur', market: 'Hamirpur Mandi', commodity: 'Gram', variety: 'Kabuli Chana', arrivalDate: '2026-09-28', minPrice: 7200, maxPrice: 8100, modalPrice: 7650, lat: 25.9555, lng: 80.1517 },
  { id: 'm31', state: 'Uttar Pradesh', district: 'Jalaun', market: 'Orai Krishi Mandi', commodity: 'Gram', variety: 'Desi Chana', arrivalDate: '2026-09-28', minPrice: 6150, maxPrice: 6700, modalPrice: 6420, lat: 26.1472, lng: 79.3524 },

  // Onion (Pyaaz) & Tomato (Tamatar)
  { id: 'm32', state: 'Uttar Pradesh', district: 'Lucknow', market: 'Dubagga Subzi Mandi Lucknow', commodity: 'Onion', variety: 'Nasik Red', arrivalDate: '2026-09-28', minPrice: 2100, maxPrice: 2600, modalPrice: 2350, lat: 26.8467, lng: 80.9462 },
  { id: 'm33', state: 'Uttar Pradesh', district: 'Kanpur', market: 'Govind Nagar Mandi Kanpur', commodity: 'Onion', variety: 'Local Red', arrivalDate: '2026-09-28', minPrice: 2000, maxPrice: 2500, modalPrice: 2280, lat: 26.4499, lng: 80.3319 },
  { id: 'm34', state: 'Uttar Pradesh', district: 'Varanasi', market: 'Pahariya Subzi Mandi Varanasi', commodity: 'Tomato', variety: 'Hybrid Desi', arrivalDate: '2026-09-28', minPrice: 1600, maxPrice: 2100, modalPrice: 1850, lat: 25.3176, lng: 82.9739 },
  { id: 'm35', state: 'Uttar Pradesh', district: 'Meerut', market: 'Meerut Vegetable Yard', commodity: 'Tomato', variety: 'Himsona', arrivalDate: '2026-09-28', minPrice: 1750, maxPrice: 2250, modalPrice: 1980, lat: 28.9845, lng: 77.7064 },

  // Sugarcane (Ganna) & Jaggery (Gur)
  { id: 'm36', state: 'Uttar Pradesh', district: 'Muzaffarnagar', market: 'Muzaffarnagar Gur Mandi', commodity: 'Jaggery (Gur)', variety: 'Shakkar Super', arrivalDate: '2026-09-28', minPrice: 3800, maxPrice: 4200, modalPrice: 4020, lat: 29.4727, lng: 77.7085 },
  { id: 'm37', state: 'Uttar Pradesh', district: 'Meerut', market: 'Mawana Mandi Meerut', commodity: 'Jaggery (Gur)', variety: 'Chakku Gur', arrivalDate: '2026-09-28', minPrice: 3750, maxPrice: 4150, modalPrice: 3950, lat: 28.9845, lng: 77.7064 }
];

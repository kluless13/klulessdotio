// Array of ISO country codes for countries you've visited
// ISO 3166-1 alpha-3 format (e.g., "USA", "GBR", "FRA")
export const visitedCountries = [
  "AUS", // Australia
  "IND", // India
  "BTN", // Bhutan
  "QAT", // Qatar
  "LKA", // Sri Lanka
  "SGP", // Singapore
  "MDV", // Maldives
];

// Countries you work with
export const workCountries = [
  "CAN", // Canada
  "HKG", // Hong Kong
  "JPN", // Japan
  "NLD", // Netherlands (Amsterdam)
  "AUS", // Australia (also visited)
  "BRA", // Brazil
  "USA", // United States
  "PAN", // Panama
];

// You can customize the colors for highlighting countries
export const highlightColors = {
  visited: "#3DEC89", // Bright green for visited countries
  work: "#FFA500",    // Orange for work countries
  default: "rgba(255,255,255,0.7)" // Default color for other countries
};

// Country coordinates for creating travel arcs - centered on each country
export const countryCoordinates = {
  // Visited Countries
  "AUS": { lat: -25.2744, lng: 133.7751 }, // Australia - center
  "IND": { lat: 15.9129, lng: 79.7400 },   // India - moved more south
  "BTN": { lat: 27.5142, lng: 90.4336 },   // Bhutan - center
  "QAT": { lat: 25.3548, lng: 51.1839 },   // Qatar - center
  "LKA": { lat: 6.9271, lng: 79.8612 },    // Sri Lanka - extreme south of India
  "SGP": { lat: 1.3521, lng: 103.8198 },   // Singapore - center
  "MDV": { lat: 4.1755, lng: 73.5093 },    // Maldives - south of Sri Lanka
  
  // Work Countries
  "CAN": { lat: 56.1304, lng: -106.3468 }, // Canada - center
  "HKG": { lat: 22.3193, lng: 114.1694 },  // Hong Kong - center
  "JPN": { lat: 36.2048, lng: 138.2529 },  // Japan - center
  "NLD": { lat: 52.1326, lng: 5.2913 },    // Netherlands - center
  "BRA": { lat: -14.2350, lng: -51.9253 }, // Brazil - center
  "USA": { lat: 37.0902, lng: -95.7129 },  // USA - center
  "PAN": { lat: 8.5380, lng: -80.7821 }    // Panama - center
};

// Helper function to get country name from ISO code
export const countryCodeToName = {
  "AUS": "Australia",
  "IND": "India",
  "BTN": "Bhutan",
  "QAT": "Qatar",
  "LKA": "Sri Lanka",
  "SGP": "Singapore",
  "MDV": "Maldives",
  "CAN": "Canada",
  "HKG": "Hong Kong",
  "JPN": "Japan",
  "NLD": "Netherlands (Amsterdam)",
  "BRA": "Brazil",
  "USA": "United States",
  "PAN": "Panama"
};

// Generate travel paths between all visited countries
export function generateTravelArcs() {
  const countries = Object.keys(countryCoordinates).filter(code => 
    visitedCountries.includes(code)
  );
  const arcs = [];
  let order = 0;
  
  // Create arcs connecting all countries in a loop
  for (let i = 0; i < countries.length; i++) {
    const startCountry = countries[i];
    const endCountry = countries[(i + 1) % countries.length]; // Loop back to the first country
    
    arcs.push({
      order: order++,
      startLat: countryCoordinates[startCountry].lat,
      startLng: countryCoordinates[startCountry].lng,
      endLat: countryCoordinates[endCountry].lat,
      endLng: countryCoordinates[endCountry].lng,
      color: "#3DEC89", // Green for visited country lines
      arcAlt: 0.4
    });
  }
  
  return arcs;
}

// Generate paths between countries you work with
export function generateWorkArcs() {
  const countries = Object.keys(countryCoordinates).filter(code => 
    workCountries.includes(code)
  );
  const arcs = [];
  let order = 0;
  
  // Create arcs connecting all work countries in a loop
  for (let i = 0; i < countries.length; i++) {
    const startCountry = countries[i];
    const endCountry = countries[(i + 1) % countries.length]; // Loop back to the first country
    
    arcs.push({
      order: order++,
      startLat: countryCoordinates[startCountry].lat,
      startLng: countryCoordinates[startCountry].lng,
      endLat: countryCoordinates[endCountry].lat,
      endLng: countryCoordinates[endCountry].lng,
      color: "#FFA500", // Orange for work country lines
      arcAlt: 0.2 // Lower arc height to differentiate
    });
  }
  
  return arcs;
} 
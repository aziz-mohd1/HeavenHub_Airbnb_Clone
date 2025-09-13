
// Function to get fallback coordinates for a country
const countryFallbacks = {
  "India": [20.5937, 78.9629],
  "USA": [37.0902, -95.7129],
  "Canada": [56.1304, -106.3468],
  "Mexico": [23.6345, -102.5528],
  "Brazil": [-14.2350, -51.9253],
  "Argentina": [-38.4161, -63.6167],
  "UK": [55.3781, -3.4360],
  "Germany": [51.1657, 10.4515],
  "France": [46.2276, 2.2137],
  "Italy": [41.8719, 12.5674],
  "Spain": [40.4637, -3.7492],
  "Portugal": [39.3999, -8.2245],
  "Netherlands": [52.1326, 5.2913],
  "Belgium": [50.5039, 4.4699],
  "Switzerland": [46.8182, 8.2275],
  "Australia": [-25.2744, 133.7751],
  "New Zealand": [-40.9006, 174.8860],
  "Japan": [36.2048, 138.2529],
  "China": [35.8617, 104.1954],
  "South Korea": [35.9078, 127.7669],
  "Singapore": [1.3521, 103.8198],
  "Russia": [61.5240, 105.3188],
  "South Africa": [-30.5595, 22.9375],
  "Egypt": [26.8206, 30.8025],
  "Nigeria": [9.0820, 8.6753],
  "Saudi Arabia": [23.8859, 45.0792],
  "UAE": [23.4241, 53.8478],
  "Thailand": [15.8700, 100.9925],
  "Vietnam": [14.0583, 108.2772],
  "Philippines": [12.8797, 121.7740],
  "Indonesia": [-0.7893, 113.9213],
  "Pakistan": [30.3753, 69.3451],
  "Bangladesh": [23.6850, 90.3563],
  "Default": [0, 0] // Fallback if country not found
};

// Extract coordinates safely
const coords = listing.geometry?.coordinates; // [lng, lat]
let latlng;

// If listing has valid coordinates, use them
if (coords && coords.length === 2) {
  latlng = [coords[1], coords[0]]; // Leaflet uses [lat, lng]
} else {
  // Fallback to country center if coordinates not found
  const country = listing.country || "Default";
  latlng = countryFallbacks[country] || countryFallbacks["Default"];
  console.warn(`Coordinates not found for listing: ${listing.title}. Using fallback for ${country}.`);
}

// Initialize the map
const map = L.map("map", {
  scrollWheelZoom: false,
  zoomControl: false
}).setView(latlng, 6); // Zoom out for fallback locations

// Tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Custom marker icon
const redIcon = L.divIcon({
  className: "custom-icon",
  html: `
    <div style="background-color: #FF385C; width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <i class="fa-solid fa-house" style="color: white; font-size: 1.5rem;"></i>
    </div>`,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
});

// Add marker to the map
L.marker(latlng, { icon: redIcon, draggable: false })
  .addTo(map)
  .bindPopup(`
    <h4 style="margin-bottom: 10px; font-size: 18px; color: #333;">${listing.title}</h4>
    <p style="font-size: 14px; color: #666;">Exact location will be provided after booking.</p>
    <a href="#" style="color: #FF385C; font-weight: bold; text-decoration: none;">More Info</a>
  `);

// Add scale and zoom controls
L.control.scale({ position: "bottomleft" }).addTo(map);
L.control.zoom({ position: 'topright' }).addTo(map);

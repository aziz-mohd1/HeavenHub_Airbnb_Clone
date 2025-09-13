// Create the map and set the initial view with coordinates (latitude, longitude)
//  Safe coordinates handling with fallback
const coords = listing.geometry?.coordinates; 
const latlng = coords ? [coords[1], coords[0]] : [20.5937, 78.9629]; //  fallback: India center

const map = L.map("map", {
  scrollWheelZoom: false, // Disable zooming with the mouse scroll
  zoomControl: false,
}).setView(latlng, 13); //  using latlng instead of .reverse()

// Use a high-quality, modern tile layer (e.g., OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Custom Marker Icon
const redIcon = L.divIcon({
  className: "custom-icon", // A CSS class for styling
  html: `
    <div style="background-color: #FF385C; width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <i class="fa-solid fa-house" style="color: white; font-size: 1.5rem;"></i>
    </div>`,
  iconSize: [50, 50], // Size of the icon
  iconAnchor: [25, 25], // Anchor point of the icon (center of the circle)
  popupAnchor: [0, -25], // Position the popup above the marker
});

// ✅ Add marker only if coordinates exist
if (coords) {  
  L.marker(latlng, { icon: redIcon, draggable: false })
    .addTo(map)
    .bindPopup(`
      <h4 style="margin-bottom: 10px; font-size: 18px; color: #333;">${listing.title}</h4>
      <p style="font-size: 14px; color: #666;">Exact location will be provided after booking.</p>
      <a href="#" style="color: #FF385C; font-weight: bold; text-decoration: none;">More Info</a>
    `);
}

// Add a scale bar to the map for better clarity of distances
L.control.scale({
  position: "bottomleft",
}).addTo(map);

// Add default zoom control to the map at the top-right position
L.control.zoom({
  position: 'topright'
}).addTo(map);

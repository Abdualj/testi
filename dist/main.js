"use strict";
// TypeScript entry point
// Mapbox access token (from your teacher)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaWxra2FtdGsiLCJhIjoiY20xZzNvMmJ5MXI4YzJrcXpjMWkzYnZlYSJ9.niDiGDLgFfvA2DMqxbB1QQ';
const API_URL = 'https://media1.edu.metropolia.fi/restaurant';
async function init() {
    const listElement = document.getElementById('restaurant-list');
    try {
        // Fetch restaurant data
        const response = await fetch(API_URL);
        const restaurants = await response.json();
        // Create list of restaurant names
        listElement.innerHTML = restaurants.map((r) => `
      <div class="restaurant-item">
        <strong>${r.name}</strong><br>
        ${r.address || ''}, ${r.city || ''}
      </div>
    `).join('');
        // Initialize Mapbox
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [24.94, 60.17], // Helsinki
            zoom: 12
        });
        // Add markers for each restaurant
        restaurants.forEach((r) => {
            if (r.location && r.location.coordinates) {
                const [lon, lat] = r.location.coordinates;
                new mapboxgl.Marker()
                    .setLngLat([lon, lat])
                    .setPopup(new mapboxgl.Popup().setText(r.name))
                    .addTo(map);
            }
        });
    }
    catch (error) {
        listElement.innerHTML = `<p>Error loading restaurants 😢</p>`;
        console.error(error);
    }
}
init();
//# sourceMappingURL=main.js.map
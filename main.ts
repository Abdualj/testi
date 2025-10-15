/* global mapboxgl */
declare const mapboxgl: any;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaWxra2FtdGsiLCJhIjoiY20xZzNvMmJ5MXI4YzJrcXpjMWkzYnZlYSJ9.niDiGDLgFfvA2DMqxbB1QQ';

// API base URLs
const API_BASE = 'https://media1.edu.metropolia.fi/restaurant/api/v1';
const API_RESTAURANTS = `${API_BASE}/restaurants`;
const API_DAY = `${API_BASE}/day`;
const API_WEEK = `${API_BASE}/week`;

async function init(): Promise<void> {
  const listElement = document.getElementById('restaurant-list') as HTMLElement;
  const mapElement = document.getElementById('map') as HTMLElement;
  const toggle = document.getElementById('menu-type') as HTMLSelectElement;

  if (!listElement || !mapElement || !toggle) {
    console.error('One or more DOM elements not found.');
    return;
  }

  try {
    // Fetch restaurants
    const res = await fetch(API_RESTAURANTS);
    const restaurants: any[] = await res.json();

    // Create Mapbox map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [24.94, 60.17], // Helsinki
      zoom: 12
    });

    // Render restaurant list
    listElement.innerHTML = restaurants
      .map(
        (r) => `
      <div class="restaurant-item" data-id="${r._id}">
        <strong>${r.name}</strong><br>
        ${r.address || ''}, ${r.city || ''}
      </div>
    `
      )
      .join('');

    // Add map markers
    restaurants.forEach((r) => {
      const coords = r.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const [lon, lat] = coords;
        new mapboxgl.Marker()
          .setLngLat([lon, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(r.name))
          .addTo(map);
      }
    });

    // Handle restaurant click to show menus
    listElement.addEventListener('click', async (event) => {
      const target = event.target as HTMLElement;
      const item = target.closest('.restaurant-item') as HTMLElement | null;
      if (!item) return;

      const id = item.dataset.id;
      if (!id) return;

      const menuType = toggle.value === 'day' ? API_DAY : API_WEEK;

      try {
        const menuRes = await fetch(`${menuType}/${id}`);
        const menuData = await menuRes.json();
        displayMenu(item, menuData);
      } catch (err) {
        console.error('Error fetching menu:', err);
        alert('Failed to load menu.');
      }
    });
  } catch (err) {
    console.error('Error loading restaurants:', err);
    listElement.innerHTML = `<p>Error loading restaurants 😢</p>`;
  }
}

// Display menu under the clicked restaurant instead of using alert
function displayMenu(container: HTMLElement, menuData: any): void {
  // Remove any existing menu
  const existingMenu = container.querySelector('.menu');
  if (existingMenu) existingMenu.remove();

  const menuDiv = document.createElement('div');
  menuDiv.className = 'menu';
  menuDiv.style.marginLeft = '1rem';
  menuDiv.style.fontSize = '0.9rem';

  if (Array.isArray(menuData) && menuData.length > 0) {
    menuDiv.innerHTML = menuData
      .map(
        (item) => `<div>• ${item.name || item.dish || 'Unnamed item'} ${
          item.price ? `- ${item.price}€` : ''
        }</div>`
      )
      .join('');
  } else {
    menuDiv.textContent = 'No menu available.';
  }

  container.appendChild(menuDiv);
}

init();

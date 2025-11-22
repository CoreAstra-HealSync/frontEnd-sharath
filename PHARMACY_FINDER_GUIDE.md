# 🗺️ Pharmacy Finder with Mapbox Integration

## Features Implemented

### ✅ Interactive Map
- **Mapbox GL JS** integration with street view
- **User location marker** (blue pin)
- **Pharmacy markers** (🏥 emoji icons) with click interactions
- **Auto-fit bounds** to show all pharmacies
- **Navigation controls** (zoom in/out)

### ✅ Search & Filter
- **Text search** by pharmacy name or address
- **Radius selector** (1km, 2km, 5km, 10km, 20km)
- **Filter options**:
  - All pharmacies
  - Open now (green badge)
  - Verified only (blue badge)

### ✅ Pharmacy Details
- **Name** with status badges
- **Address** with distance calculation
- **Contact number** with click-to-call
- **Operating hours** (if available)
- **Directions** button (opens Google Maps)

### ✅ Smart Features
- **Distance calculation** from user location (shows in meters/km)
- **Status indicators**: Open/Closed, Verified
- **Popup on marker click** with pharmacy info
- **Highlight selected pharmacy** in list
- **Responsive design** for mobile/desktop

---

## Setup Instructions

### 1. Get Mapbox Access Token

1. Go to https://account.mapbox.com/ (free account)
2. Navigate to **Access Tokens**
3. Create a new token or copy the default public token
4. Copy the token (starts with `pk.`)

### 2. Configure Environment

Create `.env` file in `frontend/` directory:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=pk.your_actual_mapbox_token_here
```

### 3. Install Dependencies

Already installed:
```bash
npm install mapbox-gl
```

### 4. Enable Browser Location

- Browser will prompt for location access
- **Allow** location for nearby pharmacy search
- If blocked, click the location icon in browser address bar

---

## Backend API Endpoints Used

### `GET /api/pharmacy/nearby`
**Query params:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude  
- `distance` (optional) - Max distance in meters (default: 5000)

**Response:**
```json
{
  "status": "success",
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Apollo Pharmacy",
      "address": "123 Main St",
      "contactNo": "9876543210",
      "isOpen": true,
      "geoLocation": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "verification": {
        "status": "verified",
        "licenseNo": "LIC123"
      },
      "openingHours": {
        "open": "09:00",
        "close": "21:00"
      }
    }
  ]
}
```

---

## Usage Guide

### For Patients:

1. **Open Pharmacies Page**
   - Navigate to "Pharmacies" from patient dashboard sidebar

2. **Allow Location Access**
   - Browser will ask for permission
   - Click "Allow" to enable location-based search

3. **Find Nearby Pharmacies**
   - Select radius (default: 5km)
   - Click "Find Nearby" button
   - Map will show your location (blue pin) and pharmacies (🏥 pins)

4. **Search Pharmacies**
   - Type pharmacy name or address in search bar
   - Press Enter or click "Search"
   - Results filter in real-time

5. **Filter Results**
   - Click "Filter" button
   - Select: All / Open Now / Verified Only

6. **View Pharmacy Details**
   - Click on pharmacy card to highlight
   - Click marker on map for popup
   - See: Name, Address, Distance, Contact, Hours

7. **Get Directions**
   - Click "Directions" button
   - Opens Google Maps with route to pharmacy

8. **Call Pharmacy**
   - Click "Call" button (mobile devices)
   - Direct dial to pharmacy number

---

## Technical Implementation

### Frontend Components

**File:** `frontend/src/pages/Patient/Pharmacies.js`

**Key Features:**
- `mapboxgl` for interactive maps
- `useRef` hooks for map instance and markers
- `useEffect` for map initialization and marker updates
- Geolocation API for user position
- Distance calculation using Haversine formula

### Map Configuration

```javascript
mapboxgl.accessToken = MAPBOX_TOKEN;

map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [77.5946, 12.9716], // Default: Bangalore
  zoom: 12
});
```

### Marker Creation

```javascript
const marker = new mapboxgl.Marker(el)
  .setLngLat([lng, lat])
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<div>...</div>`)
  )
  .addTo(map.current);
```

### Distance Calculation (Haversine)

```javascript
const R = 6371; // Earth's radius in km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lng2 - lng1) * Math.PI / 180;
const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
const distance = R * c; // km
```

---

## Styling

**File:** `frontend/src/pages/Dashboard.css`

Added styles:
- `.pharmacy-marker` - Cursor and hover effects
- `.mapboxgl-popup` - Popup styling
- `.mapboxgl-popup-content` - Content padding and border radius
- `.mapboxgl-popup-close-button` - Close button styling

---

## Default Mapbox Token

A **default public Mapbox token** is included for testing:
```
pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
```

**⚠️ For production:** Get your own token at https://account.mapbox.com/

---

## Troubleshooting

### Map not loading?
- Check console for Mapbox token errors
- Verify `REACT_APP_MAPBOX_TOKEN` in `.env`
- Restart React dev server after .env changes

### Location not working?
- Browser location must be enabled
- HTTPS required in production (localhost works)
- Check browser location permissions

### Pharmacies not showing?
- Verify backend is running on `http://localhost:5000`
- Check MongoDB has pharmacies with `geoLocation` field
- Ensure pharmacies have `coordinates` array: `[lng, lat]`

### Distance calculation incorrect?
- Verify coordinates are in correct order: `[longitude, latitude]`
- MongoDB stores as `[lng, lat]` (not lat, lng)

---

## Future Enhancements

- [ ] Medicine stock search across pharmacies
- [ ] Real-time pharmacy availability
- [ ] User reviews and ratings
- [ ] Pharmacy working hours validation
- [ ] Route optimization for multiple pharmacies
- [ ] Pharmacy comparison feature
- [ ] Save favorite pharmacies
- [ ] Push notifications for nearby pharmacies

---

## API Testing

Test nearby pharmacies endpoint:
```bash
curl "http://localhost:5000/api/pharmacy/nearby?lat=12.9716&lng=77.5946&distance=5000"
```

Expected: List of pharmacies within 5km of Bangalore center.

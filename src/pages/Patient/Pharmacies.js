import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { findNearbyPharmacies } from '../../services/apiService';
import { FiShoppingBag, FiSearch, FiMapPin, FiPhone, FiClock, FiNavigation, FiFilter } from 'react-icons/fi';
import '../Dashboard.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const OFFLINE_MODE = false; // Set to true if network issues persist

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5); // km
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const userMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    if (!mapContainer.current) {
      console.error('Map container not found');
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is missing! Please add REACT_APP_MAPBOX_TOKEN to your .env file');
      toast.error('Map configuration error. Please contact support.');
      return;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    console.log('Initializing Mapbox with token:', MAPBOX_TOKEN.substring(0, 20) + '...');
    
    // Set RTCPeerConnection to null to avoid WebRTC issues with restrictive networks
    mapboxgl.workerClass = null;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0], // Will be overridden by user location
        zoom: 2, // Low zoom until location is obtained
        // Reduce network requests
        maxTileCacheSize: 50,
        transformRequest: (url, resourceType) => {
          console.log('Requesting:', resourceType, url);
          return { url };
        }
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e.error);
        toast.error('Failed to load map. Please refresh the page.');
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      toast.error('Failed to initialize map: ' + error.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Request location permission after map loads
  useEffect(() => {
    if (!mapLoaded || locationPermissionAsked) return;

    console.log('📍 Map loaded, requesting location permission...');
    setLocationPermissionAsked(true);

    if (navigator.geolocation) {
      // Show loading toast
      const loadingToast = toast.info('🔍 Getting your location...', { autoClose: false });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss(loadingToast);

          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('✅ Location permission granted!');
          console.log('📍 Your coordinates:', coords);
          console.log('🎯 Accuracy:', position.coords.accuracy, 'meters');
          console.log('🌍 Location method:', position.coords.accuracy < 100 ? 'GPS' : 'Network/WiFi');
          
          // Check if accuracy is too low
          if (position.coords.accuracy > 5000) {
            toast.warning(`Location accuracy is low (±${Math.round(position.coords.accuracy)}m). Results may be approximate.`, {
              autoClose: 8000
            });
          } else {
            toast.success(`📍 Location found with ±${Math.round(position.coords.accuracy)}m accuracy`, {
              autoClose: 3000
            });
          }
          
          setUserLocation(coords);
          
          if (map.current) {
            // Remove old user marker if exists
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }

            // Fly to actual user location
            map.current.flyTo({
              center: [coords.lng, coords.lat],
              zoom: 15,
              duration: 2000,
              essential: true
            });

            // Add user location marker with accuracy circle
            const userMarkerEl = document.createElement('div');
            userMarkerEl.innerHTML = '📍';
            userMarkerEl.style.fontSize = '36px';
            userMarkerEl.style.cursor = 'pointer';
            userMarkerEl.style.filter = 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))';
            userMarkerEl.style.animation = 'pulse 2s ease-in-out infinite';

            // Add pulsing animation
            const style = document.createElement('style');
            style.textContent = `
              @keyframes pulse {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.8)); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(79, 70, 229, 1)); }
              }
            `;
            document.head.appendChild(style);

            userMarkerRef.current = new mapboxgl.Marker(userMarkerEl)
              .setLngLat([coords.lng, coords.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="padding: 12px;">
                      <strong style="color: #4F46E5; font-size: 1rem;">📍 You are here</strong>
                      <p style="margin: 8px 0 0 0; font-size: 0.85rem; color: #6b7280;">
                        <strong>Latitude:</strong> ${coords.lat.toFixed(6)}<br/>
                        <strong>Longitude:</strong> ${coords.lng.toFixed(6)}<br/>
                        <strong>Accuracy:</strong> ±${Math.round(position.coords.accuracy)}m<br/>
                        <strong>Method:</strong> ${position.coords.accuracy < 100 ? '🛰️ GPS' : '📶 Network'}
                      </p>
                      ${position.coords.altitude ? `
                        <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #94a3b8;">
                          Altitude: ${Math.round(position.coords.altitude)}m
                        </p>
                      ` : ''}
                    </div>
                  `)
              )
              .addTo(map.current);
            
            // Show the popup immediately
            userMarkerRef.current.togglePopup();
            
            console.log('✅ User marker placed at exact location');
            
            // Auto-trigger nearby search after 2 seconds
            setTimeout(() => {
              const btn = document.querySelector('[data-find-nearby]');
              if (btn && !loading) {
                console.log('🔍 Auto-searching nearby pharmacies...');
                btn.click();
              }
            }, 2000);
          }
        }, 
        (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Geolocation error:', error);
          
          let errorMessage = '';
          let errorDetails = '';
          
          if (error.code === 1) {
            errorMessage = '❌ Location Access Denied';
            errorDetails = 'Please click the 🔒 icon in your address bar and allow location access, then refresh the page.';
          } else if (error.code === 2) {
            errorMessage = '❌ Location Unavailable';
            errorDetails = 'Unable to determine your location. Please check:\n• GPS/Location services are enabled on your device\n• You have a stable internet connection\n• Your browser has location permission';
          } else if (error.code === 3) {
            errorMessage = '❌ Location Request Timeout';
            errorDetails = 'The location request took too long. Please try again or check your device GPS settings.';
          } else {
            errorMessage = '❌ Unknown Location Error';
            errorDetails = 'An unexpected error occurred while getting your location.';
          }
          
          toast.error(
            <div>
              <strong>{errorMessage}</strong>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', whiteSpace: 'pre-line' }}>{errorDetails}</p>
            </div>, 
            { autoClose: 10000 }
          );
          
          console.log('💡 Troubleshooting tips:');
          console.log('   1. Check browser location permission (🔒 icon in address bar)');
          console.log('   2. Enable device GPS/Location services');
          console.log('   3. Ensure internet connection is stable');
          console.log('   4. Try in a different browser');
        },
        {
          enableHighAccuracy: true, // Use GPS if available
          timeout: 30000, // Increased timeout to 30 seconds
          maximumAge: 0 // Don't use cached location
        }
      );
    } else {
      console.error('❌ Geolocation not supported');
      toast.error('Your browser does not support location services. Please use a modern browser like Chrome, Firefox, or Safari.');
    }
  }, [mapLoaded, locationPermissionAsked, loading]);

  // Add pharmacy markers to map
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    console.log(`Adding ${filteredPharmacies.length} pharmacy markers to map...`);

    // Add new markers
    filteredPharmacies.forEach((pharmacy, index) => {
      
      if (pharmacy.geoLocation?.coordinates) {
        const [lng, lat] = pharmacy.geoLocation.coordinates;
        
        console.log(`${index + 1}. ${pharmacy.name}: [${lng}, ${lat}]`);
        
        // Create custom marker element with styling
        const el = document.createElement('div');
        el.className = 'pharmacy-marker';
        el.innerHTML = '🏥';
        el.style.fontSize = '28px';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';
        el.style.filter = selectedPharmacy?._id === pharmacy._id 
          ? 'drop-shadow(0 0 10px rgba(79, 70, 229, 0.8))' 
          : 'none';

        // Hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.filter = 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.6))';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.filter = selectedPharmacy?._id === pharmacy._id 
            ? 'drop-shadow(0 0 10px rgba(79, 70, 229, 0.8))' 
            : 'none';
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'pharmacy-popup' })
              .setHTML(`
                <div style="padding: 12px; max-width: 280px;">
                  <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 1rem;">${pharmacy.name}</h4>
                  <p style="margin: 4px 0; font-size: 0.85rem; color: #6b7280;">${pharmacy.address || 'Address not available'}</p>
                  ${pharmacy.contactNo ? `<p style="margin: 6px 0; font-size: 0.85rem; color: #374151;"><strong style="color: #4F46E5;">📞</strong> ${pharmacy.contactNo}</p>` : ''}
                  ${pharmacy.isOpen !== undefined ? `
                    <p style="margin: 6px 0; font-size: 0.9rem;">
                      <span style="
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        background: ${pharmacy.isOpen ? '#dcfce7' : '#fee2e2'};
                        color: ${pharmacy.isOpen ? '#166534' : '#991b1b'};
                        font-weight: 600;
                        font-size: 0.8rem;
                      ">● ${pharmacy.isOpen ? 'Open Now' : 'Closed'}</span>
                    </p>
                  ` : ''}
                  ${pharmacy.openingHours ? `
                    <p style="margin: 4px 0; font-size: 0.85rem; color: #6b7280;">
                      <strong style="color: #4F46E5;">🕐</strong> ${pharmacy.openingHours.open} - ${pharmacy.openingHours.close}
                    </p>
                  ` : ''}
                </div>
              `)
          )
          .addTo(map.current);

        el.addEventListener('click', () => {
          setSelectedPharmacy(pharmacy);
          marker.togglePopup();
          
          // Fly to the pharmacy location
          if (map.current) {
            map.current.flyTo({
              center: [lng, lat],
              zoom: 15,
              duration: 1500
            });
          }
        });

        markers.current.push(marker);
      } else {
        console.warn(`⚠️ Pharmacy "${pharmacy.name}" has no valid coordinates`);
      }
    });

    console.log(`✅ Added ${markers.current.length} markers successfully`);
  }, [filteredPharmacies, selectedPharmacy]);

  const handleFindNearby = async () => {
    if (!userLocation) {
      toast.error('Please enable location access');
      return;
    }

    setLoading(true);
    try {
      const response = await findNearbyPharmacies({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: radius * 1000 // convert km to meters
      });
      
      const data = response.data.data || [];
      setPharmacies(data);
      setFilteredPharmacies(data);
      
      if (data.length === 0) {
        toast.info(`No pharmacies found within ${radius}km`);
      } else {
        toast.success(`Found ${data.length} pharmacies nearby`);
      }

      // Fit map to show all pharmacies
      if (data.length > 0 && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Add user location
        bounds.extend([userLocation.lng, userLocation.lat]);
        
        // Add all pharmacy locations
        data.forEach(pharmacy => {
          if (pharmacy.geoLocation?.coordinates) {
            bounds.extend(pharmacy.geoLocation.coordinates);
          }
        });

        map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      toast.error(error.response?.data?.message || 'Failed to find pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPharmacies(pharmacies);
      return;
    }

    const filtered = pharmacies.filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPharmacies(filtered);
    
    if (filtered.length === 0) {
      toast.info('No pharmacies match your search');
    }
  };

  const filterByStatus = (status) => {
    if (status === 'all') {
      setFilteredPharmacies(pharmacies);
    } else if (status === 'open') {
      setFilteredPharmacies(pharmacies.filter(p => p.isOpen === true));
    } else if (status === 'verified') {
      setFilteredPharmacies(pharmacies.filter(p => p.verification?.status === 'verified'));
    }
  };

  const calculateDistance = (pharmacy) => {
    if (!userLocation || !pharmacy.geoLocation?.coordinates) return null;
    
    const [lng, lat] = pharmacy.geoLocation.coordinates;
    const R = 6371; // Earth's radius in km
    const dLat = (lat - userLocation.lat) * Math.PI / 180;
    const dLon = (lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const openInMaps = (pharmacy) => {
    if (pharmacy.geoLocation?.coordinates) {
      const [lng, lat] = pharmacy.geoLocation.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiShoppingBag /> Find Pharmacies</h1>
          <p>Locate nearby pharmacies and check medicine availability</p>
        </div>

        {/* Map Container */}
        <div className="page-section">
          <div style={{ position: 'relative' }}>
            {/* Location Permission Prompt */}
            {!userLocation && mapLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                textAlign: 'center',
                maxWidth: '400px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                  Enable Location Access
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  We need your location to show nearby pharmacies on the map
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setLocationPermissionAsked(false);
                  }}
                  style={{ width: '100%' }}
                >
                  Allow Location Access
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  💡 Click the 🔒 icon in your address bar if the prompt doesn't appear
                </p>
              </div>
            )}
            
            <div 
              ref={mapContainer}
              className="map-container"
              style={{
                width: '100%',
                height: '500px',
                minHeight: '500px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                border: '2px solid rgba(79, 70, 229, 0.1)',
                filter: !userLocation && mapLoaded ? 'blur(3px)' : 'none'
              }}
            />
            
            {/* Loading Overlay */}
            {!mapLoaded && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '12px',
                zIndex: 1000
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading map...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Legend */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <span>Your Location</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏥</span>
              <span>Pharmacy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10b981'
              }}></span>
              <span>Open Now</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ef4444'
              }}></span>
              <span>Closed</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="page-section">
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            {/* Search Input */}
            <div style={{ flex: '1', minWidth: '250px', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by pharmacy name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleSearch}>
                <FiSearch /> Search
              </button>
            </div>

            {/* Radius Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Radius:
              </label>
              <select
                className="form-input"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ width: 'auto', minWidth: '100px' }}
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>

            {/* Find Nearby Button */}
            <button 
              className="btn btn-primary" 
              onClick={handleFindNearby}
              disabled={loading || !userLocation}
              data-find-nearby
            >
              <FiNavigation /> {loading ? 'Searching...' : 'Find Nearby'}
            </button>

            {/* Refresh Location Button */}
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setLocationPermissionAsked(false);
                setUserLocation(null);
                if (userMarkerRef.current) {
                  userMarkerRef.current.remove();
                  userMarkerRef.current = null;
                }
                toast.info('Requesting location again...');
              }}
              title="Refresh your location"
            >
              <FiMapPin /> Get My Location
            </button>

            {/* Filter Button */}
            <button 
              className="btn btn-secondary" 
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FiFilter /> Filter
            </button>
          </div>

          {/* Current Location Display */}
          {userLocation && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(79, 70, 229, 0.1)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <span>
                Your location: <strong>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</strong>
              </span>
            </div>
          )}

          {/* Filter Options */}
          {filterOpen && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <button className="btn btn-secondary" onClick={() => filterByStatus('all')}>
                All ({pharmacies.length})
              </button>
              <button className="btn btn-secondary" onClick={() => filterByStatus('open')} style={{ background: '#10b981', color: 'white' }}>
                Open Now
              </button>
              <button className="btn btn-secondary" onClick={() => filterByStatus('verified')} style={{ background: '#3b82f6', color: 'white' }}>
                Verified Only
              </button>
            </div>
          )}

          {/* Results Info */}
          {pharmacies.length > 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Showing {filteredPharmacies.length} of {pharmacies.length} pharmacies
            </p>
          )}
        </div>

        {/* Pharmacy List */}
        <div className="page-section">
          {filteredPharmacies.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredPharmacies.map((pharmacy) => {
                const distance = calculateDistance(pharmacy);
                
                return (
                  <div 
                    key={pharmacy._id} 
                    style={{
                      padding: '1.5rem',
                      background: selectedPharmacy?._id === pharmacy._id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-secondary)',
                      borderRadius: '12px',
                      border: selectedPharmacy?._id === pharmacy._id ? '2px solid var(--bright-teal-blue)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{pharmacy.name}</h3>
                          {pharmacy.isOpen !== undefined && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: pharmacy.isOpen ? '#dcfce7' : '#fee2e2',
                              color: pharmacy.isOpen ? '#166534' : '#991b1b'
                            }}>
                              {pharmacy.isOpen ? '● Open' : '● Closed'}
                            </span>
                          )}
                          {pharmacy.verification?.status === 'verified' && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: '#dbeafe',
                              color: '#1e40af'
                            }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiMapPin style={{ color: 'var(--bright-teal-blue)' }} />
                            {pharmacy.address || 'Address not available'}
                            {distance && <span style={{ marginLeft: '0.5rem', color: 'var(--bright-teal-blue)', fontWeight: '600' }}>({distance})</span>}
                          </p>
                          
                          {pharmacy.contactNo && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FiPhone style={{ color: 'var(--bright-teal-blue)' }} />
                              {pharmacy.contactNo}
                            </p>
                          )}
                          
                          {pharmacy.openingHours && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FiClock style={{ color: 'var(--bright-teal-blue)' }} />
                              {pharmacy.openingHours.open} - {pharmacy.openingHours.close}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInMaps(pharmacy);
                          }}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          <FiNavigation /> Directions
                        </button>
                        
                        {pharmacy.contactNo && (
                          <a 
                            href={`tel:${pharmacy.contactNo}`}
                            className="btn btn-secondary"
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none', textAlign: 'center' }}
                          >
                            <FiPhone /> Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <h3>No pharmacies found</h3>
              <p>
                {!userLocation 
                  ? 'Please enable location access to find nearby pharmacies' 
                  : pharmacies.length === 0
                  ? 'Click "Find Nearby" to locate pharmacies around you'
                  : 'Try adjusting your search or filters'}
              </p>
              {!userLocation && (
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Refresh Page
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pharmacies;

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string;
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('status', 'active')
      .eq('is_visible_on_map', true);
    
    if (data) {
      setLocations(data);
      
      // Check which locations need geocoding
      const needGeocoding = data.filter(loc => !loc.latitude && loc.address);
      
      if (needGeocoding.length > 0) {
        setGeocodingStatus(`Finding coordinates for ${needGeocoding.length} location(s)...`);
        
        // Geocode them one by one
        for (const loc of needGeocoding) {
          await geocodeAddress(loc.id, loc.address);
        }
        
        setGeocodingStatus('');
        // Refresh after geocoding
        setTimeout(() => fetchLocations(), 1000);
      }
    }
    setLoading(false);
  };

  const geocodeAddress = async (locationId: string, address: string) => {
    try {
      // Try different search formats
      const searches = [
        address,
        `${address}, Akure, Nigeria`,
        `${address}, Ondo State, Nigeria`,
        `${address}, Nigeria`
      ];
      
      for (const searchQuery of searches) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          await supabase
            .from('locations')
            .update({
              latitude: lat,
              longitude: lon
            })
            .eq('id', locationId);
          
          console.log(`Geocoded ${address} to ${lat}, ${lon}`);
          return; // Success, stop trying
        }
      }
      
      console.log(`Could not geocode: ${address}`);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Initialize Leaflet map when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && typeof window !== 'undefined' && !mapLoaded) {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        const L = (window as any).L;
        
        const locationsWithCoords = locations.filter(l => l.latitude && l.longitude);
        
        // Default to Nigeria if no coordinates
        const defaultCenter: [number, number] = [7.2571, 5.2054];
        const defaultZoom = 6;
        
        const map = L.map('map').setView(defaultCenter, defaultZoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (locationsWithCoords.length > 0) {
          const bounds = L.latLngBounds(
            locationsWithCoords.map(l => [l.latitude!, l.longitude!])
          );
          map.fitBounds(bounds, { padding: [20, 20] });

          locationsWithCoords.forEach((loc) => {
            const marker = L.marker([loc.latitude!, loc.longitude!]).addTo(map);
            const popupContent = `
              <div style="min-width: 150px;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${loc.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${loc.address}</p>
                ${loc.phone ? `<p style="margin: 5px 0 0 0; font-size: 12px;">📞 ${loc.phone}</p>` : ''}
              </div>
            `;
            marker.bindPopup(popupContent);
          });
        }
        
        setMapLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [locations]);

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>📍 OKcharge Stations</h1>
      
      {loading ? (
        <p>Loading map...</p>
      ) : (
        <>
          {geocodingStatus && (
            <div style={{
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '15px',
              color: '#856404'
            }}>
              {geocodingStatus}
            </div>
          )}
          
          <div 
            id="map" 
            style={{ 
              width: '100%', 
              height: '400px', 
              borderRadius: '12px',
              marginBottom: '20px',
              zIndex: 1
            }}
          />
          
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>All Stations ({locations.length})</h2>
            {locations.map((loc) => (
              <div 
                key={loc.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: loc.latitude ? '#f9f9f9' : '#fff3cd'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{loc.name}</h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{loc.address}</p>
                {loc.phone && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>📞 {loc.phone}</p>}
                {loc.latitude ? (
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'green' }}>✓ Has GPS coordinates</p>
                ) : (
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'orange' }}> No coordinates yet</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}

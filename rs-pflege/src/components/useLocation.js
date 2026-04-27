import { useState, useEffect } from 'react';

// Geocode reverse lookup via Nominatim
async function reverseGeocode(lat, lon) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'Accept-Language': 'de' } }
        );
        const data = await res.json();
        return (
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            null
        );
    } catch { return null; }
}

// Singleton: Standort wird nur einmal pro Session abgefragt
let _cachedLocation = null;  // { lat, lon, city } | 'denied' | null
let _listeners = [];

function notifyListeners() {
    _listeners.forEach(fn => fn(_cachedLocation));
}

function subscribeToLocation(fn) {
    _listeners.push(fn);
    // Sofort mit aktuellem Stand aufrufen falls schon vorhanden
    if (_cachedLocation !== null) fn(_cachedLocation);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function requestLocation() {
    if (_cachedLocation !== null) return; // bereits vorhanden oder verweigert
    if (!('geolocation' in navigator)) {
        _cachedLocation = 'denied';
        notifyListeners();
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            const city = await reverseGeocode(lat, lon);
            _cachedLocation = { lat, lon, city: city || 'Vöcklabruck' };
            notifyListeners();
        },
        () => {
            // Verweigert → Fallback Vöcklabruck
            _cachedLocation = { lat: 48.00, lon: 13.65, city: 'Vöcklabruck', isFallback: true };
            notifyListeners();
        },
        { timeout: 8000, maximumAge: 300_000 } // 5 min Cache
    );
}

/**
 * Hook — gibt { location, loading } zurück.
 * location: null (loading) | { lat, lon, city, isFallback? } | 'denied'
 */
export function useLocation() {
    const [location, setLocation] = useState(_cachedLocation);

    useEffect(() => {
        const unsub = subscribeToLocation(setLocation);
        requestLocation();
        return unsub;
    }, []);

    return {
        location,
        loading: location === null,
        coords: location && location !== 'denied' ? { lat: location.lat, lon: location.lon } : null,
        city: location && location !== 'denied' ? location.city : 'Vöcklabruck',
    };
}
import React, { useState, useEffect, useRef } from "react";

function TransportForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    transportType: "car",
    fuelType: "gasoline",
    distance: "",
    occupants: "1",
  });

  const [tracking, setTracking] = useState(false);
  const [locations, setLocations] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [routeSummary, setRouteSummary] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const transportEmissionFactors = {
    car: {
      gasoline: 0.192, // kg CO2 per km
      diesel: 0.171, // kg CO2 per km
      electric: 0.053, // kg CO2 per km
      hybrid: 0.106, // kg CO2 per km
    },
    bus: 0.105, // kg CO2 per km per person
    train: 0.041, // kg CO2 per km per person
    subway: 0.037, // kg CO2 per km per person
    bicycle: 0, // kg CO2 per km
    walking: 0, // kg CO2 per km
    motorcycle: 0.103, // kg CO2 per km
    airplane: 0.255, // kg CO2 per km per person
  };

  // Initialize map
  useEffect(() => {
    // Load Leaflet script and CSS
    const loadLeaflet = async () => {
      if (window.L && mapRef.current) {
        initMap();
        return;
      }

      const linkTag = document.createElement("link");
      linkTag.rel = "stylesheet";
      linkTag.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(linkTag);

      const scriptTag = document.createElement("script");
      scriptTag.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      scriptTag.onload = () => {
        if (mapRef.current) {
          initMap();
        }
      };
      document.head.appendChild(scriptTag);
    };

    if (mapRef.current) {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [mapRef.current]);

  // Initialize the map instance
  const initMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      const L = window.L;
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create layers for markers and route
      markerLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Store the map instance
      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Make sure map gets sized properly
      setTimeout(() => {
        map.invalidateSize();

        // Try to get user's current location to center the map
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
          },
          (error) => {
            console.log("Could not get initial location:", error);
          }
        );
      }, 250);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Update map with current locations - separate from tracking logic
  useEffect(() => {
    // Ensure map and layers are ready
    if (
      !mapLoaded ||
      !mapInstanceRef.current ||
      !markerLayerRef.current ||
      !routeLayerRef.current ||
      locations.length === 0
    ) {
      return;
    }

    try {
      const L = window.L;
      const map = mapInstanceRef.current;

      // Clear previous markers and route
      markerLayerRef.current.clearLayers();
      routeLayerRef.current.clearLayers();

      // Add start marker
      const startLocation = locations[0];
      const startIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([startLocation.latitude, startLocation.longitude], {
        icon: startIcon,
      })
        .bindPopup("Start")
        .addTo(markerLayerRef.current);

      // Add intermediate waypoint markers
      for (let i = 1; i < locations.length - 1; i++) {
        const waypoint = locations[i];
        L.circleMarker([waypoint.latitude, waypoint.longitude], {
          radius: 3,
          color: "#3388ff",
          fillColor: "#3388ff",
          fillOpacity: 0.7,
          weight: 1,
        }).addTo(markerLayerRef.current);
      }

      // Add end marker if journey is complete
      if (locations.length > 1 && !tracking) {
        const endLocation = locations[locations.length - 1];
        const endIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker([endLocation.latitude, endLocation.longitude], {
          icon: endIcon,
        })
          .bindPopup("End")
          .addTo(markerLayerRef.current);
      }

      // Create polyline for the route
      const points = locations.map((loc) => [loc.latitude, loc.longitude]);
      L.polyline(points, {
        color: "blue",
        weight: 4,
        opacity: 0.7,
      }).addTo(routeLayerRef.current);

      // Add current position marker with pulsing effect if tracking
      if (tracking && locations.length > 0) {
        const latest = locations[locations.length - 1];

        // Custom CSS for pulsing effect
        if (!document.getElementById("pulsing-marker-style")) {
          const style = document.createElement("style");
          style.id = "pulsing-marker-style";
          style.innerHTML = `
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.5); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
            .pulsing-marker {
              background-color: #0078FF;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 2px rgba(0,120,255,0.5);
              animation: pulse 1.5s infinite;
              display: block;
            }
          `;
          document.head.appendChild(style);
        }

        // Current position
        const pulsingIcon = L.divIcon({
          className: "custom-div-icon",
          html: '<div class="pulsing-marker"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([latest.latitude, latest.longitude], {
          icon: pulsingIcon,
        }).addTo(markerLayerRef.current);

        // Pan to the most recent location
        map.panTo([latest.latitude, latest.longitude]);
      }

      // Fit map to show all points if more than one
      if (points.length > 1) {
        map.fitBounds(points);
      }
    } catch (error) {
      console.error("Error updating map:", error);
    }
  }, [locations, tracking, mapLoaded]);

  // Start location tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setTracking(true);
    setLocations([]);
    setCalculatedDistance(0);
    setRouteSummary(null);

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocations([
          { latitude, longitude, timestamp: new Date().getTime() },
        ]);

        // Then start interval for tracking every 10 seconds
        const id = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocations((prevLocations) => {
                if (prevLocations.length === 0) {
                  return [
                    { latitude, longitude, timestamp: new Date().getTime() },
                  ];
                }

                // Check if position has changed enough to warrant a new point
                const lastLocation = prevLocations[prevLocations.length - 1];
                const distance = calculateDistance(
                  lastLocation.latitude,
                  lastLocation.longitude,
                  latitude,
                  longitude
                );

                // Only add new point if moved at least 5 meters
                if (distance > 0.005) {
                  return [
                    ...prevLocations,
                    { latitude, longitude, timestamp: new Date().getTime() },
                  ];
                }
                return prevLocations;
              });
            },
            (error) => {
              console.log("Error getting location:", error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            }
          );
        }, 10000); // Track every 10 seconds

        setIntervalId(id);
      },
      (error) => {
        alert(`Error getting initial location: ${error.message}`);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // Stop location tracking
  const stopTracking = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTracking(false);

    // Calculate route distance
    if (locations.length > 1) {
      const distance = calculateRouteDistance(locations);
      setCalculatedDistance(distance);
      setFormData((prev) => ({ ...prev, distance: distance.toFixed(2) }));

      // Generate route summary
      generateRouteSummary(locations);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Calculate total route distance
  const calculateRouteDistance = (locations) => {
    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      totalDistance += calculateDistance(
        locations[i].latitude,
        locations[i].longitude,
        locations[i + 1].latitude,
        locations[i + 1].longitude
      );
    }
    return totalDistance;
  };

  // Generate summary of the route
  const generateRouteSummary = async (locations) => {
    if (locations.length < 2) return;

    try {
      const startPoint = locations[0];
      const endPoint = locations[locations.length - 1];

      // Using reverse geocoding to get addresses
      const startResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${startPoint.latitude}&lon=${startPoint.longitude}`
      );
      const endResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${endPoint.latitude}&lon=${endPoint.longitude}`
      );

      if (startResponse.ok && endResponse.ok) {
        const startData = await startResponse.json();
        const endData = await endResponse.json();

        setRouteSummary({
          start: startData.display_name,
          end: endData.display_name,
          duration:
            (locations[locations.length - 1].timestamp -
              locations[0].timestamp) /
            60000, // in minutes
        });
      }
    } catch (error) {
      console.error("Error generating route summary:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFootprint = () => {
    const { transportType, fuelType, distance, occupants } = formData;

    if (!distance) return 0;

    let baseEmission;

    // For cars, we need to consider fuel type
    if (transportType === "car") {
      baseEmission =
        parseFloat(distance) * transportEmissionFactors.car[fuelType];

      // Divide by number of occupants for shared ride efficiency
      baseEmission = baseEmission / parseInt(occupants || 1);
    } else {
      baseEmission =
        parseFloat(distance) * transportEmissionFactors[transportType];
    }

    return parseFloat(baseEmission.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      distance: parseFloat(formData.distance),
      occupants: parseInt(formData.occupants),
      footprint,
      routeSummary,
      route: locations.map((loc) => ({
        lat: loc.latitude,
        lng: loc.longitude,
        time: loc.timestamp,
      })),
    });
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Transport Type
        </label>
        <select
          name="transportType"
          value={formData.transportType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="car">Car</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="subway">Subway/Metro</option>
          <option value="bicycle">Bicycle</option>
          <option value="walking">Walking</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="airplane">Airplane</option>
        </select>
      </div>

      {formData.transportType === "car" && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Fuel Type
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      )}

      {/* Map component */}
      <div className="mb-4">
        <div
          ref={mapRef}
          className="h-64 bg-gray-100 rounded-lg border border-gray-300 mb-2"
          style={{ width: "100%" }}
        ></div>
        {tracking && (
          <div className="text-xs text-gray-600 text-center">
            Tracking location every 10 seconds
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Distance (km)
        </label>

        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={tracking ? stopTracking : startTracking}
            className={`px-4 py-2 font-bold rounded focus:outline-none focus:shadow-outline ${
              tracking
                ? "bg-red-500 hover:bg-red-700 text-white"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
            disabled={!mapLoaded}
          >
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </button>

          {tracking && (
            <div className="animate-pulse text-green-600 font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              Recording your journey...
            </div>
          )}
        </div>

        {locations.length > 0 && !tracking && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-800 font-medium">
              Journey tracked! Distance: {calculatedDistance.toFixed(2)} km
            </p>
            {routeSummary && (
              <div className="mt-2 text-sm text-green-700">
                <p>From: {routeSummary.start}</p>
                <p>To: {routeSummary.end}</p>
                <p>Duration: {routeSummary.duration.toFixed(1)} minutes</p>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-2">
          Enter distance manually or use the tracking feature above
        </p>

        <input
          type="number"
          name="distance"
          value={formData.distance}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter distance in km"
          min="0"
          step="0.1"
          required
        />
      </div>

      {(formData.transportType === "car" ||
        formData.transportType === "motorcycle") && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Number of Occupants
          </label>
          <input
            type="number"
            name="occupants"
            value={formData.occupants}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter number of occupants"
            min="1"
            max="10"
            required
          />
        </div>
      )}

      {formData.distance && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">
            Estimated Carbon Footprint: {calculateFootprint()} kg CO<sub>2</sub>
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading || tracking}
        >
          {loading ? "Submitting..." : "Save Carbon Entry"}
        </button>
      </div>
    </form>
  );
}

export default TransportForm;

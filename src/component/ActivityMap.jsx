import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function ActivityMap({ session }) {
  const [loading, setLoading] = useState(true);
  const [treePlantings, setTreePlantings] = useState([]);
  const [error, setError] = useState(null);
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Current date/time: 2025-04-16 12:18:21
  // Current user: Ayushsh1

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCurrentLocation({
            latitude,
            longitude,
          });
        },
        (err) => {
          console.error("Error getting current location:", err);
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    async function fetchTreeData() {
      try {
        setLoading(true);

        // Fixed query: removed trailing comma and used proper syntax
        const { data: allTreeData, error: treeError } = await supabase
          .from("tree_plantings")
          .select(
            "id, user_id, latitude, longitude, description, location, photo_path"
          );

        if (treeError) {
          console.error("Error fetching tree_plantings:", treeError);
          throw treeError;
        }

        console.log("Tree data:", allTreeData);
        setTreePlantings(allTreeData || []);
      } catch (error) {
        console.error("Error fetching tree data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTreeData();
  }, []);

  useEffect(() => {
    if (!loading && mapContainerRef.current) {
      // Remove existing map if it exists
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Initialize map with default view
      let initialCenter = [0, 0];
      let initialZoom = 2;

      // Set initial view based on available data
      if (userCurrentLocation) {
        initialCenter = [
          userCurrentLocation.latitude,
          userCurrentLocation.longitude,
        ];
        initialZoom = 13;
      } else if (treePlantings.length > 0) {
        const firstTree = treePlantings.find(
          (tree) => tree.latitude && tree.longitude
        );
        if (firstTree) {
          initialCenter = [firstTree.latitude, firstTree.longitude];
          initialZoom = 13;
        }
      }

      const map = L.map(mapContainerRef.current).setView(
        initialCenter,
        initialZoom
      );
      mapRef.current = map;

      // Add base tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      updateMap();
    }
  }, [loading]);

  // Update map when data changes
  useEffect(() => {
    if (mapRef.current && markersLayerRef.current) {
      updateMap();
    }
  }, [treePlantings, userCurrentLocation]);

  const updateMap = () => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    // Clear existing markers
    markersLayer.clearLayers();

    const markers = [];

    // Add all tree planting locations
    treePlantings.forEach((tree) => {
      if (tree.latitude && tree.longitude) {
        const isMyTree = tree.user_id === session.user.id;
        const marker = L.marker([tree.latitude, tree.longitude], {
          icon: getTreeIcon(isMyTree),
        }).addTo(markersLayer);

        const photoHtml = tree.photo_path
          ? `<img src="${getImageUrl(
              tree.photo_path
            )}" style="max-width:100%;max-height:150px;margin-top:5px;">`
          : "";

        marker.bindPopup(`
          <strong>${isMyTree ? "My Tree" : "Community Tree"}</strong><br>
          <strong>Location:</strong> ${tree.location || "N/A"}<br>
          <strong>Coordinates:</strong> ${tree.latitude}, ${tree.longitude}<br>
          <strong>Description:</strong> ${tree.description || "N/A"}<br>
          ${photoHtml}
        `);

        markers.push(marker);
      }
    });

    // Add current user location if available
    if (userCurrentLocation) {
      const userMarker = L.marker(
        [userCurrentLocation.latitude, userCurrentLocation.longitude],
        {
          icon: getUserLocationIcon(),
          zIndexOffset: 1000,
        }
      ).addTo(markersLayer);

      userMarker.bindPopup("<strong>Your Current Location</strong>");
      markers.push(userMarker);
    }

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
  };

  const getTreeIcon = (isMyTree) => {
    // Tree-like icons
    return L.icon({
      iconUrl: isMyTree
        ? "https://cdn-icons-png.flaticon.com/512/489/489969.png" // Green tree icon for personal trees
        : "https://cdn-icons-png.flaticon.com/512/1933/1933994.png", // Brown/orange tree icon for community trees
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const getUserLocationIcon = () => {
    return L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return supabase.storage
      .from("reduction-activity-uploads")
      .getPublicUrl(path).data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Tree Map</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="flex flex-wrap mb-4 gap-3">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-600 rounded-full mr-2"></div>
              <span>My Trees</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-orange-500 rounded-full mr-2"></div>
              <span>Community Trees</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-violet-500 rounded-full mr-2"></div>
              <span>Current Location</span>
            </div>
          </div>

          <div ref={mapContainerRef} className="h-96 w-full rounded-lg"></div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              {treePlantings.filter((tree) => tree.user_id === session.user.id)
                .length > 0
                ? `You've planted ${
                    treePlantings.filter(
                      (tree) => tree.user_id === session.user.id
                    ).length
                  } trees!`
                : "You haven't planted any trees yet. Add a tree planting activity to get started!"}
            </p>
            <p className="mt-1">
              {treePlantings.filter((tree) => tree.user_id !== session.user.id)
                .length > 0
                ? `The community has planted ${
                    treePlantings.filter(
                      (tree) => tree.user_id !== session.user.id
                    ).length
                  } trees!`
                : "No community tree plantings recorded yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityMap;

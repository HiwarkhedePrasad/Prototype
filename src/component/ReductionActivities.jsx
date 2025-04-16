import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function ReductionActivities({ session }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [userData, setUserData] = useState({
    id: session?.user?.id,
    points: 0,
    level: 0,
    next_level_points: 100,
  });
  const [formData, setFormData] = useState({
    activity_type: "tree_planting",
    impact_value: "",
    details: {
      description: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      photo: null,
      receipt: null,
      latitude: null,
      longitude: null,
      start_location: "",
      end_location: "",
      distance: "",
      duration: "",
      quantity: "",
    },
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [error, setError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [geoLocationStatus, setGeoLocationStatus] = useState("");
  const [showReward, setShowReward] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [levelUp, setLevelUp] = useState(false);

  const activityTypes = [
    {
      id: "tree_planting",
      name: "Tree Planting",
      defaultImpact: 20,
      pointsMultiplier: 10,
      requiresPhoto: true,
      requiresLocation: true,
      requiresQuantity: true,
      requiresGeoLocation: true,
    },
    {
      id: "energy_saving",
      name: "Energy Saving",
      defaultImpact: 5,
      pointsMultiplier: 5,
      requiresReceipt: true,
    },
    {
      id: "public_transport",
      name: "Using Public Transport",
      defaultImpact: 7,
      pointsMultiplier: 3,
      requiresReceipt: true,
      requiresStartLocation: true,
      requiresEndLocation: true,
      requiresDistance: true,
      requiresGeoLocation: true,
    },
    {
      id: "cycling",
      name: "Cycling Instead of Driving",
      defaultImpact: 8,
      pointsMultiplier: 4,
      requiresStartLocation: true,
      requiresEndLocation: true,
      requiresDistance: true,
      requiresGeoLocation: true,
    },
    {
      id: "waste_reduction",
      name: "Waste Reduction",
      defaultImpact: 3,
      pointsMultiplier: 2,
      requiresQuantity: true,
      requiresPhoto: true,
    },
    {
      id: "renewable_energy",
      name: "Renewable Energy Usage",
      defaultImpact: 15,
      pointsMultiplier: 8,
      requiresReceipt: true,
    },
    {
      id: "water_conservation",
      name: "Water Conservation",
      defaultImpact: 2,
      pointsMultiplier: 2,
      requiresQuantity: true,
    },
    {
      id: "eco_product",
      name: "Eco-Friendly Product Purchase",
      defaultImpact: 4,
      pointsMultiplier: 3,
      requiresReceipt: true,
      requiresPhoto: true,
    },
    {
      id: "meatless_day",
      name: "Meatless Day",
      defaultImpact: 6,
      pointsMultiplier: 3,
      requiresPhoto: true,
    },
    {
      id: "composting",
      name: "Composting",
      defaultImpact: 3,
      pointsMultiplier: 2,
      requiresPhoto: true,
      requiresQuantity: true,
    },
  ];

  // Level thresholds
  const levelThresholds = [
    0, // Level 0
    100, // Level 1
    300, // Level 2
    600, // Level 3
    1000, // Level 4
    1500, // Level 5
    2500, // Level 6
    4000, // Level 7
    6000, // Level 8
    9000, // Level 9
    12000, // Level 10
  ];

  // Achievement badges
  const achievementBadges = {
    firstActivity: {
      name: "First Step",
      description: "Complete your first carbon reduction activity",
      icon: "🌱",
    },
    treePlanter: {
      name: "Tree Planter",
      description: "Plant at least 5 trees",
      icon: "🌳",
    },
    energySaver: {
      name: "Energy Guardian",
      description: "Complete 3 energy saving activities",
      icon: "⚡",
    },
    ecoBiker: {
      name: "Eco Biker",
      description: "Travel at least 50km by bike",
      icon: "🚴",
    },
    wasteReducer: {
      name: "Waste Warrior",
      description: "Complete 5 waste reduction activities",
      icon: "♻️",
    },
  };

  useEffect(() => {
    fetchActivities();
    fetchUserData();
  }, [session]);

  useEffect(() => {
    // Update form fields based on selected activity type
    const selectedActivity = activityTypes.find(
      (act) => act.id === formData.activity_type
    );
    if (selectedActivity) {
      setFormData((prev) => ({
        ...prev,
        impact_value: selectedActivity.defaultImpact,
      }));

      // Get geolocation if required by activity type
      if (selectedActivity.requiresGeoLocation) {
        getUserLocation();
      }
    }
  }, [formData.activity_type]);

  const fetchUserData = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("points, level")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      if (data) {
        const currentLevel = data.level || 0;
        const currentPoints = data.points || 0;
        const nextLevelThreshold =
          levelThresholds[currentLevel + 1] ||
          levelThresholds[levelThresholds.length - 1] * 1.5;

        setUserData({
          id: session.user.id,
          points: currentPoints,
          level: currentLevel,
          next_level_points: nextLevelThreshold,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setGeoLocationStatus("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            details: {
              ...prev.details,
              latitude,
              longitude,
            },
          }));
          setGeoLocationStatus("Location successfully captured!");
          setTimeout(() => setGeoLocationStatus(""), 3000);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGeoLocationStatus(
            "Unable to get your location. Please try again."
          );
        }
      );
    } else {
      setGeoLocationStatus("Geolocation is not supported by your browser");
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reduction_activities")
        .select("*")
        .eq("user_id", session.user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      setActivities(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "activity_type") {
      // Set default impact value when activity type changes
      const selectedActivity = activityTypes.find((act) => act.id === value);
      setFormData({
        ...formData,
        activity_type: value,
        impact_value: selectedActivity.defaultImpact,
      });
    } else if (name.startsWith("details.")) {
      // Handle details object properties
      const detailField = name.split(".")[1];
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          [detailField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      const fileType = name === "details.photo" ? "photo" : "receipt";

      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (fileType === "photo") {
          setPhotoPreview(e.target.result);
        } else {
          setReceiptPreview(e.target.result);
        }
      };
      fileReader.readAsDataURL(file);

      // Update form data
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          [fileType]: file,
        },
      });
    }
  };

  const uploadFile = async (file, path) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("reduction-activity-uploads")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  };

  // Calculate points based on activity and impact
  const calculatePoints = (activityType, impactValue, quantity = 1) => {
    const activity = activityTypes.find((act) => act.id === activityType);
    if (!activity) return 0;

    // Base points calculation
    let points = Math.round(impactValue * activity.pointsMultiplier);

    // Bonus points for quantity if applicable
    if (quantity > 1) {
      points = points * quantity;
    }

    return points;
  };

  // Check for achievements
  const checkAchievements = async (newActivity) => {
    const userAchievements = [];

    // First activity achievement
    if (activities.length === 0) {
      userAchievements.push(achievementBadges.firstActivity);
    }

    // Tree planter achievement
    if (newActivity.activity_type === "tree_planting") {
      const treePlantings = activities.filter(
        (a) => a.activity_type === "tree_planting"
      );
      const totalTrees = treePlantings.reduce((sum, act) => {
        return sum + (parseInt(act.details?.quantity) || 1);
      }, parseInt(newActivity.details?.quantity) || 1);

      if (totalTrees >= 5) {
        userAchievements.push(achievementBadges.treePlanter);
      }
    }

    // Energy saver achievement
    if (newActivity.activity_type === "energy_saving") {
      const energySavings =
        activities.filter((a) => a.activity_type === "energy_saving").length +
        1;
      if (energySavings >= 3) {
        userAchievements.push(achievementBadges.energySaver);
      }
    }

    // Eco biker achievement
    if (newActivity.activity_type === "cycling") {
      const totalDistance =
        activities
          .filter((a) => a.activity_type === "cycling")
          .reduce(
            (sum, act) => sum + (parseFloat(act.details?.distance) || 0),
            0
          ) + (parseFloat(newActivity.details?.distance) || 0);

      if (totalDistance >= 50) {
        userAchievements.push(achievementBadges.ecoBiker);
      }
    }

    // Waste reducer achievement
    if (newActivity.activity_type === "waste_reduction") {
      const wasteReductions =
        activities.filter((a) => a.activity_type === "waste_reduction").length +
        1;
      if (wasteReductions >= 5) {
        userAchievements.push(achievementBadges.wasteReducer);
      }
    }

    return userAchievements;
  };

  // Update user points in database
  const updateUserPoints = async (pointsToAdd) => {
    try {
      // Get current user data
      const { data: currentUserData, error: fetchError } = await supabase
        .from("users")
        .select("points, level")
        .eq("id", session.user.id)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new points and check for level up
      const currentPoints = currentUserData?.points || 0;
      const currentLevel = currentUserData?.level || 0;
      const newPoints = currentPoints + pointsToAdd;

      // Determine if user leveled up
      let newLevel = currentLevel;
      let didLevelUp = false;

      for (let i = currentLevel + 1; i < levelThresholds.length; i++) {
        if (newPoints >= levelThresholds[i]) {
          newLevel = i;
          didLevelUp = true;
        } else {
          break;
        }
      }

      // Update user data
      const { error: updateError } = await supabase
        .from("users")
        .update({
          points: newPoints,
          level: newLevel,
        })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      // Update local state
      setUserData({
        ...userData,
        points: newPoints,
        level: newLevel,
        next_level_points:
          levelThresholds[newLevel + 1] ||
          levelThresholds[levelThresholds.length - 1] * 1.5,
      });

      setLevelUp(didLevelUp);

      return { newPoints, newLevel, didLevelUp };
    } catch (error) {
      console.error("Error updating user points:", error);
      return { error };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setUploading(true);
      setMessage({ text: "", type: "" });

      const selectedActivity = activityTypes.find(
        (act) => act.id === formData.activity_type
      );

      // Check if we need location but don't have it
      if (
        selectedActivity.requiresGeoLocation &&
        (formData.details.latitude === null ||
          formData.details.longitude === null)
      ) {
        // Try to get location one more time
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setFormData((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  latitude,
                  longitude,
                },
              }));
              resolve();
            },
            (error) => {
              console.error("Error getting location:", error);
              // Continue anyway
              resolve();
            }
          );
        });
      }

      // Prepare the data
      const activityData = {
        user_id: session.user.id,
        activity_type: formData.activity_type,
        impact_value: parseFloat(formData.impact_value),
        details: {
          description: formData.details.description,
          location: formData.details.location,
          date: formData.details.date,
          latitude: formData.details.latitude,
          longitude: formData.details.longitude,
        },
        timestamp: new Date().toISOString(),
      };

      // Add activity-specific fields
      if (
        selectedActivity.requiresStartLocation &&
        formData.details.start_location
      ) {
        activityData.details.start_location = formData.details.start_location;
      }

      if (
        selectedActivity.requiresEndLocation &&
        formData.details.end_location
      ) {
        activityData.details.end_location = formData.details.end_location;
      }

      if (selectedActivity.requiresDistance && formData.details.distance) {
        activityData.details.distance = formData.details.distance;
      }

      if (selectedActivity.requiresQuantity && formData.details.quantity) {
        activityData.details.quantity = formData.details.quantity;
      }

      if (selectedActivity.requiresDuration && formData.details.duration) {
        activityData.details.duration = formData.details.duration;
      }

      // Upload photo if provided
      let photoPath = null;
      if (formData.details.photo) {
        photoPath = await uploadFile(formData.details.photo, "photos");
        activityData.details.photo_path = photoPath;
      }

      // Upload receipt if provided
      if (formData.details.receipt) {
        const receiptPath = await uploadFile(
          formData.details.receipt,
          "receipts"
        );
        activityData.details.receipt_path = receiptPath;
      }

      // Insert into reduction_activities database and get the ID
      const { data: insertedActivity, error } = await supabase
        .from("reduction_activities")
        .insert([activityData])
        .select();

      if (error) throw error;

      // If this is a tree planting activity, also insert into tree_plantings table
      if (formData.activity_type === "tree_planting") {
        try {
          // Prepare tree planting data with minimal fields that are likely to exist
          const treePlantingData = {
            user_id: session.user.id,
            reduction_activity_id: insertedActivity[0].id,
            latitude: formData.details.latitude,
            longitude: formData.details.longitude,
            description: formData.details.description,
            location: formData.details.location,
            timestamp: new Date().toISOString(),
            photo_path: photoPath,
            quantity: parseInt(formData.details.quantity) || 1,
          };

          const { error: treePlantingError } = await supabase
            .from("tree_plantings")
            .insert([treePlantingData]);

          if (treePlantingError) {
            console.error("Error inserting tree planting:", treePlantingError);
          }
        } catch (treeError) {
          console.error("Error with tree planting table:", treeError);
        }
      }

      // ===== REWARD SYSTEM IMPLEMENTATION =====

      // Calculate points based on the activity
      const quantity = parseInt(formData.details.quantity) || 1;
      const pointsEarned = calculatePoints(
        formData.activity_type,
        parseFloat(formData.impact_value),
        quantity
      );

      // Update user points in database
      const { newPoints, newLevel, didLevelUp } = await updateUserPoints(
        pointsEarned
      );

      // Check for achievements
      const newAchievements = await checkAchievements(activityData);

      // Set reward notification data
      setEarnedPoints(pointsEarned);
      setShowReward(true);

      // Reset form and show success message
      setFormData({
        activity_type: "tree_planting",
        impact_value: activityTypes[0].defaultImpact,
        details: {
          description: "",
          location: "",
          date: new Date().toISOString().split("T")[0],
          photo: null,
          receipt: null,
          latitude: null,
          longitude: null,
          start_location: "",
          end_location: "",
          distance: "",
          duration: "",
          quantity: "",
        },
      });
      setPhotoPreview(null);
      setReceiptPreview(null);

      // Construct success message with points and achievements
      let successMessage = `Carbon reduction activity added successfully! You earned ${pointsEarned} points!`;
      if (didLevelUp) {
        successMessage += ` Congratulations! You reached Level ${newLevel}!`;
      }
      if (newAchievements.length > 0) {
        successMessage += ` Achievement unlocked: ${newAchievements
          .map((a) => a.name)
          .join(", ")}`;
      }

      setMessage({
        text: successMessage,
        type: "success",
      });

      // Reload activities
      fetchActivities();

      // Hide reward notification after 5 seconds and clear message
      setTimeout(() => {
        setShowReward(false);
        setMessage({ text: "", type: "" });
      }, 5000);
    } catch (error) {
      setMessage({
        text: `Error adding activity: ${error.message}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const totalImpact = activities.reduce(
    (sum, activity) => sum + activity.impact_value,
    0
  );

  const getImageUrl = (path) => {
    if (!path) return null;
    return supabase.storage
      .from("reduction-activity-uploads")
      .getPublicUrl(path).data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading activities data...</div>
      </div>
    );
  }

  // Get the currently selected activity type details
  const currentActivity = activityTypes.find(
    (act) => act.id === formData.activity_type
  );

  // Calculate progress for level bar
  const calculateLevelProgress = () => {
    const currentLevelThreshold = levelThresholds[userData.level] || 0;
    const nextLevelThreshold = userData.next_level_points;
    const pointsForCurrentLevel = userData.points - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;

    return Math.min(
      100,
      Math.floor((pointsForCurrentLevel / pointsNeededForNextLevel) * 100)
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Carbon Reduction Activities
      </h1>

      {/* User Points and Level Display */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide opacity-80">
              Your Impact
            </div>
            <div className="text-2xl font-bold">{userData.points} Points</div>
            <div className="text-lg">Level {userData.level}</div>
          </div>

          <div className="text-5xl">
            {userData.level < 3
              ? "🌱"
              : userData.level < 6
              ? "🌿"
              : userData.level < 9
              ? "🌳"
              : "🌍"}
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Level {userData.level}</span>
            <span>Level {userData.level + 1}</span>
          </div>
          <div className="w-full bg-green-800 rounded-full h-2.5">
            <div
              className="bg-green-300 h-2.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${calculateLevelProgress()}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1">
            {userData.points} / {userData.next_level_points} points
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`${
            message.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          } px-4 py-3 rounded border`}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading activities: {error}
        </div>
      )}

      {/* Reward Animation - Conditionally rendered */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center transform animate-bounceIn">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Activity Recorded!
            </h3>
            <p className="text-4xl font-bold text-green-800 mb-4">
              +{earnedPoints} points
            </p>
            {levelUp && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-xl font-bold text-green-700">Level Up!</p>
                <p className="text-lg">You've reached Level {userData.level}</p>
              </div>
            )}
            <button
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              onClick={() => setShowReward(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Activity Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity Type
                </label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  {activityTypes.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} (+
                      {calculatePoints(activity.id, activity.defaultImpact)}{" "}
                      pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carbon Impact (kg CO2e)
                </label>
                <input
                  type="number"
                  name="impact_value"
                  value={formData.impact_value}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-green-600 mt-1">
                  Estimated points: +
                  {calculatePoints(
                    formData.activity_type,
                    parseFloat(formData.impact_value) || 0,
                    parseInt(formData.details.quantity) || 1
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="details.description"
                  value={formData.details.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Briefly describe your activity..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="details.location"
                  value={formData.details.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Where did this activity take place?"
                  required={currentActivity?.requiresLocation}
                />
              </div>

              {currentActivity?.requiresGeoLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Geolocation
                  </label>
                  <div className="flex items-center mt-1">
                    <button
                      type="button"
                      onClick={getUserLocation}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {formData.details.latitude && formData.details.longitude
                        ? "Update Location"
                        : "Get My Location"}
                    </button>
                    {formData.details.latitude && formData.details.longitude ? (
                      <span className="ml-3 text-sm text-green-600">
                        ✓ Location captured
                      </span>
                    ) : (
                      <span className="ml-3 text-sm text-gray-500">
                        {geoLocationStatus || "Location needed"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {currentActivity?.requiresStartLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Location
                  </label>
                  <input
                    type="text"
                    name="details.start_location"
                    value={formData.details.start_location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Where did your journey start?"
                    required
                  />
                </div>
              )}

              {currentActivity?.requiresEndLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Location
                  </label>
                  <input
                    type="text"
                    name="details.end_location"
                    value={formData.details.end_location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Where did your journey end?"
                    required
                  />
                </div>
              )}

              {currentActivity?.requiresDistance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    name="details.distance"
                    value={formData.details.distance}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Distance traveled"
                    required
                  />
                </div>
              )}

              {currentActivity?.requiresQuantity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="details.quantity"
                    value={formData.details.quantity}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="How many/how much?"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="details.date"
                  value={formData.details.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              {currentActivity?.requiresPhoto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Photo
                  </label>
                  <input
                    type="file"
                    name="details.photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                    required
                  />
                  {photoPreview && (
                    <div className="mt-2">
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="h-24 w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}

              {currentActivity?.requiresReceipt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Receipt/Proof
                  </label>
                  <input
                    type="file"
                    name="details.receipt"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                    required
                  />
                  {receiptPreview && (
                    <div className="mt-2">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="h-24 w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {submitting
                  ? uploading
                    ? "Uploading..."
                    : "Saving..."
                  : "Add Activity"}
              </button>
            </form>
          </div>
        </div>

        {/* Activities List */}
        <div className="md:col-span-2">
          {/* Achievements Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.values(achievementBadges).map((badge, index) => {
                // This is a placeholder logic - in a real app you'd check if user has earned this badge
                const isEarned = index === 0 && activities.length > 0; // Just for demo - first achievement is earned

                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 text-center ${
                      isEarned
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                    title={badge.description}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                    {isEarned && (
                      <div className="mt-1 text-xs text-green-600">Earned</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Activities</h2>
              <div className="text-green-600 font-semibold">
                Total Reduction: {totalImpact.toFixed(2)} kg CO2e
              </div>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const activityType = activityTypes.find(
                    (type) => type.id === activity.activity_type
                  );

                  const hasPhoto = activity.details?.photo_path;
                  const hasReceipt = activity.details?.receipt_path;
                  const photoUrl = hasPhoto
                    ? getImageUrl(activity.details.photo_path)
                    : null;
                  const receiptUrl = hasReceipt
                    ? getImageUrl(activity.details.receipt_path)
                    : null;

                  // Calculate points for this activity (for display purposes)
                  const activityPoints = calculatePoints(
                    activity.activity_type,
                    activity.impact_value,
                    activity.details?.quantity || 1
                  );

                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <h3 className="font-medium">
                              {activityType
                                ? activityType.name
                                : activity.activity_type}
                            </h3>
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                              +{activityPoints} points
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.timestamp)}
                            {activity.details?.location &&
                              ` at ${activity.details.location}`}
                          </p>

                          {activity.details?.start_location &&
                            activity.details?.end_location && (
                              <p className="text-sm text-gray-600 mt-1">
                                Journey: {activity.details.start_location} to{" "}
                                {activity.details.end_location}
                                {activity.details?.distance &&
                                  ` (${activity.details.distance} km)`}
                              </p>
                            )}

                          {activity.details?.quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {activity.details.quantity}
                            </p>
                          )}

                          <p className="mt-2">
                            {activity.details?.description}
                          </p>

                          {(hasPhoto || hasReceipt) && (
                            <div className="mt-3 flex space-x-3">
                              {hasPhoto && (
                                <a
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  View Photo
                                </a>
                              )}

                              {hasReceipt && (
                                <a
                                  href={receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  View Receipt
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-green-600 font-semibold">
                          -{activity.impact_value.toFixed(2)} kg CO2e
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't added any reduction activities yet.</p>
                <p className="mt-2">
                  Start adding activities to track your positive impact!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add a simple animation keyframes for reward animation */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-bounceIn {
          animation: bounceIn 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ReductionActivities;

// FILE: src/components/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function UserProfile({ session }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    email: "",
    name: "",
    settings: {
      notifications: true,
      theme: "light",
      privacyLevel: "normal",
      carbonGoal: 100,
      carbonUnit: "kg",
    },
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);

        // Get user data
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          throw userError;
        }

        if (existingUser) {
          setUserData({
            id: existingUser.id,
            email: session.user.email,
            name: existingUser.name || "",
            settings: existingUser.settings || {
              notifications: true,
              theme: "light",
              privacyLevel: "normal",
              carbonGoal: 100,
              carbonUnit: "kg",
            },
          });
        } else {
          // If user doesn't exist in the database yet (first login)
          setUserData({
            id: session.user.id,
            email: session.user.email,
            name: "",
            settings: {
              notifications: true,
              theme: "light",
              privacyLevel: "normal",
              carbonGoal: 100,
              carbonUnit: "kg",
            },
          });
        }
      } catch (error) {
        setMessage({
          text: `Error loading profile: ${error.message}`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("settings.")) {
      const settingName = name.split(".")[1];
      setUserData({
        ...userData,
        settings: {
          ...userData.settings,
          [settingName]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setMessage({ text: "", type: "" });

      // Prepare user data
      const userDataToUpdate = {
        id: session.user.id,
        name: userData.name,
        settings: userData.settings,
        updated_at: new Date().toISOString(),
      };

      // Upsert user data (update if exists, insert if not)
      const { error } = await supabase.from("users").upsert(userDataToUpdate);

      if (error) throw error;

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      setMessage({
        text: `Error updating profile: ${error.message}`,
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setMessage({
        text: `Error signing out: ${error.message}`,
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1 bg-gray-50 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account information and preferences.
            </p>
          </div>
          <div className="md:col-span-2 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={userData.email}
                  className="mt-1 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Your email cannot be changed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Preferences
                </h3>
              </div>

              <div>
                <label
                  htmlFor="carbonGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Monthly Carbon Footprint Goal ({userData.settings.carbonUnit})
                </label>
                <input
                  type="number"
                  name="settings.carbonGoal"
                  id="carbonGoal"
                  min="0"
                  step="5"
                  value={userData.settings.carbonGoal}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="carbonUnit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Carbon Measurement Unit
                </label>
                <select
                  id="carbonUnit"
                  name="settings.carbonUnit"
                  value={userData.settings.carbonUnit}
                  onChange={handleChange}
                  // FILE: src/components/UserProfile.jsx (continued)
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tons">Metric Tons</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-medium text-gray-700"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  name="settings.theme"
                  value={userData.settings.theme}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="privacyLevel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Privacy Level
                </label>
                <select
                  id="privacyLevel"
                  name="settings.privacyLevel"
                  value={userData.settings.privacyLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="high">High (Store minimal data)</option>
                  <option value="normal">Normal (Recommended)</option>
                  <option value="low">Low (Enable all features)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="notifications"
                  name="settings.notifications"
                  type="checkbox"
                  checked={userData.settings.notifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="notifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Enable notifications
                </label>
              </div>

              <div className="flex justify-between pt-5">
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign Out
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1 bg-gray-50 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Data Management
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your carbon footprint data and account.
            </p>
          </div>
          <div className="md:col-span-2 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900">
                  Export Your Data
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Download all your carbon footprint data and activities.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Export Data (.csv)
                </button>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h4 className="text-base font-medium text-red-600">
                  Danger Zone
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  These actions cannot be undone. Please proceed with caution.
                </p>
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete All Carbon Data
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

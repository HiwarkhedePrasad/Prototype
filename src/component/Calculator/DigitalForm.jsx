import React, { useState } from "react";

function DigitalForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    activityType: "streaming",
    hours: "",
    dataUsage: "",
    deviceType: "smartphone",
    energySaving: false,
  });

  const digitalEmissionFactors = {
    streaming: {
      smartphone: 0.1, // kg CO2 per hour
      tablet: 0.15, // kg CO2 per hour
      laptop: 0.22, // kg CO2 per hour
      desktop: 0.35, // kg CO2 per hour
      tv: 0.42, // kg CO2 per hour
    },
    videoCall: {
      smartphone: 0.08, // kg CO2 per hour
      tablet: 0.12, // kg CO2 per hour
      laptop: 0.17, // kg CO2 per hour
      desktop: 0.28, // kg CO2 per hour
      tv: 0, // N/A
    },
    gaming: {
      smartphone: 0.12, // kg CO2 per hour
      tablet: 0.18, // kg CO2 per hour
      laptop: 0.3, // kg CO2 per hour
      desktop: 0.5, // kg CO2 per hour
      tv: 0.7, // kg CO2 per hour (console)
    },
    browsing: {
      smartphone: 0.04, // kg CO2 per hour
      tablet: 0.06, // kg CO2 per hour
      laptop: 0.1, // kg CO2 per hour
      desktop: 0.15, // kg CO2 per hour
      tv: 0, // N/A
    },
  };

  // Data emission factor (kg CO2 per GB)
  const dataEmissionFactor = 0.06;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateFootprint = () => {
    const { activityType, hours, dataUsage, deviceType, energySaving } =
      formData;

    if (!hours && !dataUsage) return 0;

    let totalEmission = 0;

    // Calculate emissions from time spent
    if (
      hours &&
      activityType &&
      deviceType &&
      digitalEmissionFactors[activityType][deviceType]
    ) {
      totalEmission +=
        parseFloat(hours) * digitalEmissionFactors[activityType][deviceType];
    }

    // Add emissions from data usage if provided
    if (dataUsage) {
      totalEmission += parseFloat(dataUsage) * dataEmissionFactor;
    }

    // Apply energy-saving reduction if applicable
    if (energySaving) {
      totalEmission *= 0.8; // 20% reduction for energy-saving mode
    }

    return parseFloat(totalEmission.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      hours: formData.hours ? parseFloat(formData.hours) : 0,
      dataUsage: formData.dataUsage ? parseFloat(formData.dataUsage) : 0,
      footprint,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Digital Activity
        </label>
        <select
          name="activityType"
          value={formData.activityType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="streaming">Video Streaming</option>
          <option value="videoCall">Video Calls/Meetings</option>
          <option value="gaming">Online Gaming</option>
          <option value="browsing">Web Browsing</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Device Used
        </label>
        <select
          name="deviceType"
          value={formData.deviceType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="smartphone">Smartphone</option>
          <option value="tablet">Tablet</option>
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop Computer</option>
          <option value="tv">TV/Console</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Hours Spent
        </label>
        <input
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter hours"
          min="0"
          step="0.5"
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Data Used (GB)
        </label>
        <input
          type="number"
          name="dataUsage"
          value={formData.dataUsage}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter data usage in GB"
          min="0"
          step="0.1"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="energySaving"
          checked={formData.energySaving}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-gray-700">Low Power / Energy Saving Mode</label>
      </div>

      {(formData.hours || formData.dataUsage) && (
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
          disabled={loading}
        >
          {loading ? "Submitting..." : "Save Carbon Entry"}
        </button>
      </div>
    </form>
  );
}

export default DigitalForm;

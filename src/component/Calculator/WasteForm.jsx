import React, { useState } from "react";

function WasteForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    wasteType: "general",
    amount: "",
    recyclingPercentage: "0",
  });

  const wasteEmissionFactors = {
    general: 0.5, // kg CO2 per kg of waste
    organic: 0.2,
    plastic: 0.35,
    paper: 0.9,
    glass: 0.18,
    metal: 0.15,
    electronic: 25, // higher impact
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFootprint = () => {
    const { wasteType, amount, recyclingPercentage } = formData;

    if (!amount) return 0;

    // Base calculation
    let baseEmission = parseFloat(amount) * wasteEmissionFactors[wasteType];

    // Apply recycling reduction
    if (recyclingPercentage) {
      const recycling = parseInt(recyclingPercentage) / 100;
      // Recycling reduces footprint but doesn't eliminate it completely
      baseEmission = baseEmission * (1 - recycling * 0.7);
    }

    return parseFloat(baseEmission.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      recyclingPercentage: parseInt(formData.recyclingPercentage),
      footprint,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Waste Type
        </label>
        <select
          name="wasteType"
          value={formData.wasteType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="general">General Waste</option>
          <option value="organic">Organic/Food Waste</option>
          <option value="plastic">Plastic</option>
          <option value="paper">Paper/Cardboard</option>
          <option value="glass">Glass</option>
          <option value="metal">Metal</option>
          <option value="electronic">Electronic Waste</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount (kg)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter amount in kilograms"
          min="0"
          step="0.1"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Recycling Percentage
        </label>
        <input
          type="range"
          name="recyclingPercentage"
          value={formData.recyclingPercentage}
          onChange={handleChange}
          className="w-full"
          min="0"
          max="100"
          step="5"
        />
        <div className="text-right text-gray-600">
          {formData.recyclingPercentage}%
        </div>
      </div>

      {formData.amount && (
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

export default WasteForm;

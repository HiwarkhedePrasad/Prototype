import React, { useState } from "react";

function FoodForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    mealType: "regular",
    dietType: "omnivore",
    servingSize: "medium",
    wastePercentage: "0",
  });

  const foodEmissionFactors = {
    dietType: {
      vegan: 0.4,
      vegetarian: 0.7,
      pescatarian: 1.2,
      omnivore: 1.8,
    },
    mealType: {
      regular: 1,
      organic: 0.8,
      local: 0.9,
      processed: 1.5,
    },
    servingSize: {
      small: 0.7,
      medium: 1,
      large: 1.3,
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFootprint = () => {
    const { dietType, mealType, servingSize, wastePercentage } = formData;

    // Base calculation
    const baseEmission =
      foodEmissionFactors.dietType[dietType] *
      foodEmissionFactors.mealType[mealType] *
      foodEmissionFactors.servingSize[servingSize];

    // Add waste factor (each % of waste adds slightly to the footprint)
    const wasteMultiplier = 1 + parseInt(wastePercentage) / 100;

    return parseFloat((baseEmission * wasteMultiplier).toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      wastePercentage: parseInt(formData.wastePercentage),
      footprint,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Diet Type
        </label>
        <select
          name="dietType"
          value={formData.dietType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="omnivore">Omnivore</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Meal Type
        </label>
        <select
          name="mealType"
          value={formData.mealType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="regular">Regular</option>
          <option value="organic">Organic</option>
          <option value="local">Locally Sourced</option>
          <option value="processed">Highly Processed</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Serving Size
        </label>
        <select
          name="servingSize"
          value={formData.servingSize}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Food Waste Percentage
        </label>
        <input
          type="range"
          name="wastePercentage"
          value={formData.wastePercentage}
          onChange={handleChange}
          className="w-full"
          min="0"
          max="50"
          step="5"
        />
        <div className="text-right text-gray-600">
          {formData.wastePercentage}%
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">
          Estimated Carbon Footprint: {calculateFootprint()} kg CO<sub>2</sub>
        </p>
      </div>

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

export default FoodForm;

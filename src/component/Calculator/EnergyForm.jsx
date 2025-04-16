import React, { useState } from "react";

function EnergyForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    energyType: "electricity",
    amount: "",
    renewablePercentage: "0",
    usageHours: "1",
  });

  const energyEmissionFactors = {
    electricity: 0.45, // kg CO2 per kWh (average)
    naturalGas: 0.18, // kg CO2 per kWh
    heating: 0.27, // kg CO2 per kWh
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFootprint = () => {
    const { energyType, amount, renewablePercentage, usageHours } = formData;

    if (!amount) return 0;

    // Base calculation
    let baseEmission = parseFloat(amount) * energyEmissionFactors[energyType];

    // Apply renewable energy reduction if applicable
    if (energyType === "electricity" && renewablePercentage) {
      const renewable = parseInt(renewablePercentage) / 100;
      baseEmission = baseEmission * (1 - renewable);
    }

    // Multiply by usage hours if applicable
    if (energyType === "electricity") {
      baseEmission = baseEmission * parseInt(usageHours || 1);
    }

    return parseFloat(baseEmission.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      renewablePercentage: parseInt(formData.renewablePercentage),
      usageHours: parseInt(formData.usageHours),
      footprint,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Energy Type
        </label>
        <select
          name="energyType"
          value={formData.energyType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="electricity">Electricity</option>
          <option value="naturalGas">Natural Gas</option>
          <option value="heating">Heating Oil</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount (kWh)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter amount in kWh"
          min="0"
          step="0.1"
          required
        />
      </div>

      {formData.energyType === "electricity" && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Usage Hours
            </label>
            <input
              type="number"
              name="usageHours"
              value={formData.usageHours}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Hours of usage"
              min="1"
              max="24"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Renewable Energy Percentage
            </label>
            <input
              type="range"
              name="renewablePercentage"
              value={formData.renewablePercentage}
              onChange={handleChange}
              className="w-full"
              min="0"
              max="100"
              step="5"
            />
            <div className="text-right text-gray-600">
              {formData.renewablePercentage}%
            </div>
          </div>
        </>
      )}

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

export default EnergyForm;

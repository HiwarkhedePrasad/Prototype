import React from "react";

function CarbonSummary({ totalFootprint, totalReduction }) {
  const netFootprint = totalFootprint - totalReduction;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Carbon Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Total Carbon Footprint</p>
          <p className="text-2xl font-bold text-red-600">
            {totalFootprint.toFixed(2)} kg CO<sub>2</sub>
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Total Carbon Reduction</p>
          <p className="text-2xl font-bold text-green-600">
            {totalReduction.toFixed(2)} kg CO<sub>2</sub>
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Net Carbon Footprint</p>
          <p className="text-2xl font-bold text-blue-600">
            {netFootprint.toFixed(2)} kg CO<sub>2</sub>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CarbonSummary;

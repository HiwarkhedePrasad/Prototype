import React, { useState } from "react";

function ShoppingForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    itemType: "clothing",
    purchaseAmount: "",
    isSecondhand: false,
    isEcoFriendly: false,
  });

  const shoppingEmissionFactors = {
    clothing: 10, // kg CO2 per item
    electronics: 50, // kg CO2 per item
    furniture: 40, // kg CO2 per item
    appliances: 100, // kg CO2 per item
    toys: 8, // kg CO2 per item
    cosmetics: 5, // kg CO2 per item
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateFootprint = () => {
    const { itemType, purchaseAmount, isSecondhand, isEcoFriendly } = formData;

    if (!purchaseAmount) return 0;

    // Base calculation
    let baseEmission =
      parseFloat(purchaseAmount) * shoppingEmissionFactors[itemType];

    // Apply reductions based on other factors
    if (isSecondhand) {
      baseEmission *= 0.3; // 70% reduction for secondhand items
    }

    if (isEcoFriendly) {
      baseEmission *= 0.7; // 30% reduction for eco-friendly products
    }

    return parseFloat(baseEmission.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const footprint = calculateFootprint();

    onSubmit({
      ...formData,
      purchaseAmount: parseFloat(formData.purchaseAmount),
      footprint,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Item Type
        </label>
        <select
          name="itemType"
          value={formData.itemType}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="clothing">Clothing</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="appliances">Appliances</option>
          <option value="toys">Toys</option>
          <option value="cosmetics">Cosmetics</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number of Items Purchased
        </label>
        <input
          type="number"
          name="purchaseAmount"
          value={formData.purchaseAmount}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter number of items"
          min="0"
          step="1"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isSecondhand"
          checked={formData.isSecondhand}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-gray-700">Secondhand / Thrifted Items</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isEcoFriendly"
          checked={formData.isEcoFriendly}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-gray-700">
          Eco-friendly / Sustainable Products
        </label>
      </div>

      {formData.purchaseAmount && (
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

export default ShoppingForm;

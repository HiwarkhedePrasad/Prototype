import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import TransportForm from "./Calculator/TransportForm";
import FoodForm from "./Calculator/FoodForm";
import EnergyForm from "./Calculator/EnergyForm";
import WasteForm from "./Calculator/WasteForm";
import DigitalForm from "./Calculator/DigitalForm";
import ShoppingForm from "./Calculator/ShoppingForm";

function CarbonCalculator({ session }) {
  const [category, setCategory] = useState("transport");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const { error } = await supabase.from("carbon_entries").insert([
        {
          user_id: session.user.id,
          category: category,
          data: data,
          footprint_value: data.footprint,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setSuccess(true);

      // Reset form (this will be handled in each form component)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (category) {
      case "transport":
        return <TransportForm onSubmit={handleSubmit} loading={loading} />;
      case "food":
        return <FoodForm onSubmit={handleSubmit} loading={loading} />;
      case "energy":
        return <EnergyForm onSubmit={handleSubmit} loading={loading} />;
      case "waste":
        return <WasteForm onSubmit={handleSubmit} loading={loading} />;
      case "shopping":
        return <ShoppingForm onSubmit={handleSubmit} loading={loading} />;
      case "digital":
        return <DigitalForm onSubmit={handleSubmit} loading={loading} />;
      default:
        return <TransportForm onSubmit={handleSubmit} loading={loading} />;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Carbon Calculator
      </h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Your carbon footprint data has been recorded successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto">
          {["transport", "food", "energy", "waste", "shopping", "digital"].map(
            (cat) => (
              <button
                key={cat}
                className={`px-6 py-3 text-center focus:outline-none ${
                  category === cat
                    ? "bg-green-600 text-white font-medium"
                    : "bg-white text-gray-600 hover:bg-green-50"
                }`}
                onClick={() => handleCategoryChange(cat)}
              >
                <span className="capitalize">{cat}</span>
              </button>
            )
          )}
        </div>

        {/* Form Area */}
        <div className="p-6">{renderForm()}</div>
      </div>
    </div>
  );
}

export default CarbonCalculator;

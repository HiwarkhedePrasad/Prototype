import React from "react";
import { Link } from "react-router-dom";

function ActionRecommendations({ carbonData }) {
  // Generate recommendations based on carbon data
  const getRecommendations = () => {
    const recommendations = [];

    if (!carbonData || !carbonData.categoriesData) {
      return [
        {
          id: "start-tracking",
          title: "Start Tracking Your Carbon Footprint",
          description:
            "Begin by adding your daily activities to get personalized recommendations.",
          action: "Get Started",
          link: "/calculator",
          icon: "📝",
        },
      ];
    }

    const categories = carbonData.categoriesData;

    // Find the highest emission category
    let highestCategory = null;
    let highestValue = 0;

    for (const [category, value] of Object.entries(categories)) {
      if (value > highestValue) {
        highestValue = value;
        highestCategory = category;
      }
    }

    // Add category-specific recommendations
    if (highestCategory) {
      switch (highestCategory) {
        case "transport":
          recommendations.push({
            id: "transport-reduction",
            title: "Reduce Transport Emissions",
            description:
              "Consider carpooling, public transit, or cycling for your daily commute.",
            action: "Track Trip",
            link: "/calculator",
            icon: "🚗",
          });
          break;
        case "food":
          recommendations.push({
            id: "food-reduction",
            title: "Lower Food Carbon Impact",
            description:
              "Try eating more plant-based meals and reducing food waste.",
            action: "Log Meals",
            link: "/calculator",
            icon: "🍽️",
          });
          break;
        case "energy":
          recommendations.push({
            id: "energy-reduction",
            title: "Reduce Home Energy Use",
            description:
              "Turn off lights, unplug devices, and adjust your thermostat.",
            action: "Log Energy",
            link: "/calculator",
            icon: "⚡",
          });
          break;
        case "shopping":
          recommendations.push({
            id: "shopping-reduction",
            title: "Shop More Sustainably",
            description:
              "Buy fewer items, choose second-hand, and look for eco-friendly products.",
            action: "Track Purchases",
            link: "/calculator",
            icon: "🛍️",
          });
          break;
        default:
          recommendations.push({
            id: "general-reduction",
            title: `Reduce ${highestCategory} Emissions`,
            description: `Focus on lowering your impact in this category.`,
            action: "Learn More",
            link: "/calculator",
            icon: "📊",
          });
      }
    }

    // Always suggest tree planting
    recommendations.push({
      id: "plant-trees",
      title: "Plant Trees to Offset",
      description:
        "Offset your carbon footprint by planting trees or supporting reforestation projects.",
      action: "Add Activity",
      link: "/activities",
      icon: "🌱",
    });

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{recommendation.icon}</span>
              <h3 className="font-medium text-green-800">
                {recommendation.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-3">{recommendation.description}</p>
            <Link
              to={recommendation.link}
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              {recommendation.action}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActionRecommendations;

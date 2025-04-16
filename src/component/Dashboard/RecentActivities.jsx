import React from "react";

function RecentActivities({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <p className="text-gray-500 text-center py-8">
          No activities recorded yet. Start tracking your carbon footprint!
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "travel":
        return "✈️";
      case "food":
        return "🍽️";
      case "waste":
        return "🗑️";
      case "transport":
        return "🚗";
      case "shopping":
        return "🛍️";
      case "digital":
        return "💻";
      case "energy":
        return "⚡";
      default:
        return "📊";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center p-3 border-b border-gray-100"
          >
            <div className="text-2xl mr-3">
              {getCategoryIcon(entry.category)}
            </div>
            <div className="flex-grow">
              <div className="font-medium text-gray-800 capitalize">
                {entry.category}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(entry.timestamp)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">
                +{entry.footprint_value.toFixed(2)} kg CO<sub>2</sub>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivities;

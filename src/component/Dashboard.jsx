import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import CarbonSummary from "./Dashboard/CarbonSummary";
import RecentActivities from "./Dashboard/RecentActivities";
import ActionRecommendations from "./Dashboard/ActionRecommendations";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [carbonData, setCarbonData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (userError) throw userError;

        // Fetch carbon entries
        const { data: carbonEntries, error: entriesError } = await supabase
          .from("carbon_entries")
          .select("*")
          .eq("user_id", session.user.id)
          .order("timestamp", { ascending: false });

        if (entriesError) throw entriesError;

        // Fetch reduction activities
        const { data: reductionActivities, error: activitiesError } =
          await supabase
            .from("reduction_activities")
            .select("*")
            .eq("user_id", session.user.id)
            .order("timestamp", { ascending: false });

        if (activitiesError) throw activitiesError;

        setUserData(userData);

        // Process carbon data for charts
        const processedData = processCarbonData(
          carbonEntries,
          reductionActivities
        );
        setCarbonData(processedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session]);

  // Process carbon data for visualization
  const processCarbonData = (entries, activities) => {
    // Group entries by category
    const categoriesData = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = 0;
      }
      acc[entry.category] += entry.footprint_value;
      return acc;
    }, {});

    // Calculate total footprint
    const totalFootprint = entries.reduce(
      (sum, entry) => sum + entry.footprint_value,
      0
    );

    // Calculate total reduction
    const totalReduction = activities.reduce(
      (sum, activity) => sum + activity.impact_value,
      0
    );

    // Weekly data (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData = Array(7).fill(0);
    entries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= lastWeek && entryDate <= today) {
        const dayIndex =
          6 - Math.floor((today - entryDate) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 7) {
          weeklyData[dayIndex] += entry.footprint_value;
        }
      }
    });

    // Last 10 activities
    const recentEntries = entries.slice(0, 10);

    return {
      categoriesData,
      totalFootprint,
      totalReduction,
      netFootprint: totalFootprint - totalReduction,
      weeklyData,
      recentEntries,
    };
  };

  const chartData = {
    categories: {
      labels: carbonData.categoriesData
        ? Object.keys(carbonData.categoriesData)
        : [],
      datasets: [
        {
          data: carbonData.categoriesData
            ? Object.values(carbonData.categoriesData)
            : [],
          backgroundColor: [
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    },
    weekly: {
      labels: [
        "6 days ago",
        "5 days ago",
        "4 days ago",
        "3 days ago",
        "2 days ago",
        "Yesterday",
        "Today",
      ],
      datasets: [
        {
          label: "Carbon Footprint (kg CO2)",
          data: carbonData.weeklyData || [],
          backgroundColor: "rgba(75, 192, 192, 0.7)",
        },
      ],
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {userData?.name || session.user.email}
      </h1>

      {/* Carbon Summary */}
      <CarbonSummary
        totalFootprint={carbonData.totalFootprint || 0}
        totalReduction={carbonData.totalReduction || 0}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Carbon Footprint by Category
          </h2>
          <div className="h-64">
            {carbonData.categoriesData &&
            Object.keys(carbonData.categoriesData).length > 0 ? (
              <Doughnut
                data={chartData.categories}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available yet
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Weekly Carbon Footprint
          </h2>
          <div className="h-64">
            {carbonData.weeklyData &&
            carbonData.weeklyData.some((value) => value > 0) ? (
              <Bar
                data={chartData.weekly}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No weekly data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivities entries={carbonData.recentEntries || []} />
        <ActionRecommendations carbonData={carbonData} />
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Dashboard from "./component/Dashboard";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import Navbar from "./component/Navbar";
import CarbonCalculator from "./component/CarbonCalculator";
import ActivityMap from "./component/ActivityMap";
import ReductionActivities from "./component/ReductionActivities";
import UserProfile from "./component/UserProfile";
import "./App.css";
import SimpleChatbot from "./component/bot/bot";
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <div className="container mx-auto py-8 px-4">
        <Routes>
          <Route
            path="/"
            element={
              session ? (
                <Dashboard session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!session ? <Register /> : <Navigate to="/" />}
          />
          <Route
            path="/calculator"
            element={
              session ? (
                <CarbonCalculator session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/map"
            element={
              session ? (
                <ActivityMap session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/activities"
            element={
              session ? (
                <ReductionActivities session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              session ? (
                <UserProfile session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/bot" element={<SimpleChatbot />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

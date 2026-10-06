/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Sports from "./pages/Sports";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import TeamList from "./pages/TeamList";
import TeamProfile from "./pages/TeamProfile";
import RegisterTeam from "./pages/RegisterTeam";
import Bracket from "./pages/Bracket";
import AddTournament from "./pages/AddTournament";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

/**
 * SessionRouteRestorer:
 * Prevents unwanted redirection to the home screen when reloading inside an admin session.
 * If user is authenticated and reloads while on /dashboard, this immediately restores the dashboard view.
 */
function SessionRouteRestorer() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      const activeAdminSession = localStorage.getItem("sportsnest_active_admin_session");
      const deliberateHome = sessionStorage.getItem("sportsnest_deliberate_home");

      if (isAuthenticated && activeAdminSession === "true" && !deliberateHome) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, navigate]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <Router>
        <AuthProvider>
          <ErrorBoundary>
            <SessionRouteRestorer />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournament/:id" element={<TournamentDetails />} />
              <Route path="/tournament/:id/teams" element={<TeamList />} />
              <Route path="/team/:id" element={<TeamProfile />} />
              <Route path="/register/:tournamentId" element={<RegisterTeam />} />
              <Route path="/bracket/:tournamentId" element={<Bracket />} />
              <Route path="/add-tournament" element={<AddTournament />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

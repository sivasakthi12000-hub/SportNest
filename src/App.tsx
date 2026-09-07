/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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

export default function App() {
  return (
    <Router>
      <AuthProvider>
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

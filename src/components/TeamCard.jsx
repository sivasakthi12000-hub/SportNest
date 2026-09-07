import React from "react";
import { Link } from "react-router-dom";
import "../styles/teams.css";

const TeamCard = ({ team }) => (
  <div className="card team-card">
    <div className="card-content">
      <h3>{team.name}</h3>
      <p className="members"><strong>Members:</strong> {team.members}</p>
    </div>
    <div className="card-actions">
      <Link to={`/team/${team.id}`} className="btn-details">
        View Profile
      </Link>
    </div>
  </div>
);

export default TeamCard;

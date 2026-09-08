import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SportGroundBackground } from "./SportGroundBackground";
import { Sport3DAsset } from "./Sport3DAsset";
import { getSportTheme } from "../data/sportsThemeData";
import { getRealSportGround } from "../data/sportGroundImages";
import "../styles/sport-showcase.css";

const SportCard = ({ sport }) => {
  const theme = getSportTheme(sport.name);
  const realGround = getRealSportGround(sport.name, sport.image || sport.imageUrl || sport.bannerUrl);

  return (
    <Link to={`/tournaments?sport=${sport.id}`} className="ground-card" title={`View ${sport.name} Tournaments`}>
      {/* Real Stadium Ground Photography in background with split design */}
      <div className="ground-card-split">
        <div className="card-split-left">
          <img
            src={realGround.groundImage}
            alt={sport.name}
            className="card-ground-bg-img"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop";
            }}
          />
          <SportGroundBackground sportName={sport.name} variant="card" />
        </div>
        <div className="card-split-right">
          <img
            src={realGround.groundImage}
            alt={sport.name}
            className="card-ground-bg-img"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop";
            }}
          />
          <SportGroundBackground sportName={sport.name} variant="card" />
        </div>
      </div>

      <div className="ground-card-content">
        <div className="ground-card-header">
          <span className="ground-card-badge">{theme.surface}</span>
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "#ffffff",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "0.2rem 0.55rem",
              borderRadius: "9999px",
              backdropFilter: "blur(4px)",
            }}
          >
            Official Ground
          </span>
        </div>

        <div className="ground-card-center">
          <div className="ground-card-icon">
            <Sport3DAsset sportName={sport.name} size={90} />
          </div>
          <h3 className="ground-card-name">{sport.name}</h3>
          <span
            style={{
              fontSize: "0.76rem",
              color: "#cbd5e1",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            {theme.format}
          </span>
        </div>

        <div className="ground-card-footer">
          <span className="ground-card-stats">{theme.category}</span>
          <span className="ground-card-link">
            Explore Ground <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SportCard;


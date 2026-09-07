import React, { useState, useEffect } from "react";
import { getSports } from "../services/dataService";
import SportShowcaseHero from "../components/SportShowcaseHero";

const Home = () => {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    getSports().then(setSports);
  }, []);

  return (
    <div className="home-showcase-container">
      <SportShowcaseHero sports={sports} showAllGroundsGrid={true} />
    </div>
  );
};

export default Home;


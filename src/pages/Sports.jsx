import React, { useState, useEffect } from "react";
import { getSports } from "../services/dataService";
import SportShowcaseHero from "../components/SportShowcaseHero";

const Sports = () => {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    getSports().then(setSports);
  }, []);

  return (
    <div className="sports-page-wrapper">
      <SportShowcaseHero sports={sports} showAllGroundsGrid={true} />
    </div>
  );
};

export default Sports;


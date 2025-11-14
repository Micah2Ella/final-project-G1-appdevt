import { useRef, useState, useEffect } from "react";
import Dungeon from "./Dungeon";
import "../App.css";

export default function Game({ player }) {
  const dungeonRef = useRef();
  const [encounter, setEncounter] = useState(null);
  const [intro, setIntro] = useState(true);

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    setEncounter(type);
  };

  const handleExitEncounter = () => {
    console.log("Encounter ended!");
    setEncounter(null);
    dungeonRef.current.resume(); // Scrolling resumes
  }

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div className="dungeon-wrapper">
        <Dungeon ref={dungeonRef} onEncounter={handleEncounter} player={player}/>
      </div>
      <div
        style={{
          height: "40vh",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins, sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Intro */}
        {intro && (
          <div className="intro">
            <div>
              <h1>Welcome, {player.playerName}!</h1>
              <h2>You chose: {player.name}</h2>
              <p>HP: {player.baseStats.HP} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}</p>
            </div>
          </div>
        )}

        {/* Game UI */}
        <div className="game-ui">
          {/* Stats Bar */}
          <div className="statbar">
            <h2>{player.playerName} || {player.name}</h2>
            <div className="grouped-stats">
              <h2>♥️{player.baseStats.HP}</h2>
              <h2>🗡️{player.baseStats.ATK}</h2>
              <h2>👟{player.baseStats.SPD}</h2>
              <h2>🛡️{player.baseStats.DEF}</h2>
            </div>
          </div>

          {/* Encounter UI */}
          <div className="encounter-container">
            {encounter === "fountain" && (
              <div className="UI">
                <h3>HEALING FOUNTAIN</h3>
                <p>
                  You recover 10 health.
                </p>
                <button onClick={handleExitEncounter}>Continue</button>
              </div>
            )}
            {encounter === "bat1" && (
              <div className="UI">
                <h3>NORMAL BAT ENCOUNTER</h3>
                <p>
                  You face a normal bat.
                </p>
                <button onClick={handleExitEncounter}>Continue</button>
              </div>
            )}
            {encounter === "bat2" && (
              <div className="UI">
                <h3>STRONG BAT ENCOUNTER</h3>
                <p>
                  You face a strong bat.
                </p>
                <button onClick={handleExitEncounter}>Continue</button>
              </div>
            )}
            {encounter === "crossroads" && (
              <div className="UI">
                <h3>CROSSROADS</h3>
                <p>
                  You reached a fork in the road.
                  The left road continues on the void.
                  At the end of the right road, you see a glistening blue.
                </p>
                <button onClick={handleExitEncounter}>Continue</button>
              </div>
            )}
            {encounter === "aethercrest" && (
              <div className="UI">
                <h3>AETHERCREST</h3>
                <p>
                  Aethercrest obtained.
                </p>
                <button
                  onClick={() => {
                    setTimeout(() => {
                      dungeonRef.current.regenerateEncounters();
                      handleExitEncounter();
                    }, 500);
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

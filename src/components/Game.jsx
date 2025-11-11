import { useRef, useState } from "react";
import Dungeon from "./Dungeon";

export default function Game({ player }) {
  const dungeonRef = useRef();
  const [encounter, setEncounter] = useState(null);

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    setEncounter(type);
  };

  const handleExitEncounter = () => {
    console.log("Encounter ended!");
    setEncounter(null);
    dungeonRef.current.resume(); // Scrolling resumes
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Dungeon ref={dungeonRef} onEncounter={handleEncounter}/>
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
        <h1>Welcome, {player.playerName}!</h1>
        <h2>You chose: {player.name}</h2>
        <p>HP: {player.baseStats.HP} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}</p>

        {/* Encounter UI */}
        {encounter === "fountain" && (
          <div style ={{ marginTop: "20px", textAlign: "center"}}>
            <h3>HEALING FOUNTAIN</h3>
            <p>
              You recover 10 health.
            </p>
            <button
              onClick={handleExitEncounter}
              style={{
                marginTop: "10px",
                padding: "0.5rem 1rem",
                background: "linear-gradient(to right, #2f80ed, #56ccf2)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        )}
        {encounter === "enemy" && (
          <div style ={{ marginTop: "20px", textAlign: "center"}}>
            <h3>ENEMY ENCOUNTER</h3>
            <p>
              You face a bat.
            </p>
            <button
              onClick={handleExitEncounter}
              style={{
                marginTop: "10px",
                padding: "0.5rem 1rem",
                background: "linear-gradient(to right, #2f80ed, #56ccf2)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        )}
        {encounter === "crossroads" && (
          <div style ={{ marginTop: "20px", textAlign: "center"}}>
            <h3>CROSSROADS</h3>
            <p>
              You reached a fork in the road.
              The left road continues on the void.
              At the end of the right road, you see a glistening blue.
            </p>
            <button
              onClick={handleExitEncounter}
              style={{
                marginTop: "10px",
                padding: "0.5rem 1rem",
                background: "linear-gradient(to right, #2f80ed, #56ccf2)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        )}
        {encounter === "aethercrest" && (
          <div style ={{ marginTop: "20px", textAlign: "center"}}>
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
              style={{
                marginTop: "10px",
                padding: "0.5rem 1rem",
                background: "linear-gradient(to right, #2f80ed, #56ccf2)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

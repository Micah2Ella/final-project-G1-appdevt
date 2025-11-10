import { useRef } from "react";
import Dungeon from "./Dungeon";

export default function Game({ player }) {
  const dungeonRef = useRef();

  const handleEncounter = () => {
    dungeonRef.current.pause(); // pauses dungeon scrolling
    console.log("Encounter triggered!");

    // Simulating encounter duration
    setTimeout(() => {
      dungeonRef.current.resume(); // resumes dungeon scrolling
      console.log("Encounter ended!");
    }, 3000);
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Dungeon ref={dungeonRef}/>
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

        {/* Pause scroll testing */}
        <button onClick={handleEncounter} style={{marginTop: "20px"}}>
          Trigger Encounter (TEST BUTTON)
        </button>
      </div>
    </div>
  );
}

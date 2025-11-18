import { useRef, useState, useEffect } from "react";
import Dungeon from "./Dungeon";
import "../App.css";
import "./GameOver.css";
import { usePlayerHealth } from "../context/PlayerHealth";

export default function Game({ player, onReset }) {
  const dungeonRef = useRef();
  const [encounter, setEncounter] = useState(null);
  const [intro, setIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [crossroadsChoices, setCrossroadsChoices] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // to prevent spam clicking
  const { hp, takeDamage, heal } = usePlayerHealth();

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    setEncounter(type);
    setIsProcessing(false);
  };

  const handleCrossroadsChoice = (choices) => {
    console.log("Crossroads choices:", choices);
    setCrossroadsChoices(choices);
  };

  const handlePlayerChoice = (chosenType) => {
    if (isProcessing) return;

    setIsProcessing(true);
    console.log("Player chose:", chosenType);
    dungeonRef.current.setMysteryType(chosenType);
    setCrossroadsChoices(null);
    handleExitEncounter();
  };

  const handleExitEncounter = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    if (encounter === "fountain") heal(10);
    if (encounter === "bat1") takeDamage(10);
    if (encounter === "bat2") takeDamage(20);

    console.log("Encounter ended!");
    setEncounter(null);
    dungeonRef.current.resume(); // Scrolling resumes
  };

  const handleAethercrest = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      dungeonRef.current.regenerateEncounters();
      setEncounter(null);
      dungeonRef.current.resume();
      setIsProcessing(false);
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hp <= 0) {
      setIsProcessing(false);
      setGameOver(true);

      if (dungeonRef.current) {
        dungeonRef.current.pause();
      }

      setEncounter(null);
    }
  }, [hp]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div className="dungeon-wrapper">
        <Dungeon ref={dungeonRef} onEncounter={handleEncounter} onCrossroadsChoice={handleCrossroadsChoice} player={player}/>
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

        {/* Game Over */}
        {gameOver && (
          <div className="game-over">
            <div>
              <img src="/characters/player_death.png"/>
              <h1>💀 YOU DIED 💀</h1>
              <p>HP: {hp} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}</p>
              <button 
                  onClick={onReset} 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? "Processing..." : "Play Again"}
                </button>
            </div>
          </div>
        )}

        {/* Game UI */}
        <div className="game-ui">
          {/* Stats Bar */}
          <div className="statbar">
            <h2>{player.playerName} | {player.name}</h2>
            <div className="grouped-stats">
              <h2>♥️{hp}</h2>
              <h2>🗡️{player.baseStats.ATK}</h2>
              <h2>👟{player.baseStats.SPD}</h2>
              <h2>🛡️{player.baseStats.DEF}</h2>
            </div>
          </div>

          {/* Encounter UI */}
          <div className="encounter-container">
            {/* FOUNTAIN */}
            {encounter === "fountain" && (
              <div className="UI">
                <h3>HEALING FOUNTAIN</h3>
                <p>
                  You recover 10 health.
                </p>
                <button 
                  onClick={handleExitEncounter} 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}
            {/* BAT1 */}
            {encounter === "bat1" && (
              <div className="UI">
                <h3>NORMAL BAT ENCOUNTER</h3>
                <p>
                  You take 10 damage.
                </p>
                <button 
                  onClick={handleExitEncounter} 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}
            {/* BAT2 */}
            {encounter === "bat2" && (
              <div className="UI">
                <h3>STRONG BAT ENCOUNTER</h3>
                <p>
                  You take 20 damage.
                </p>
                <button 
                  onClick={handleExitEncounter} 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}
            {/* CROSSROADS */}
            {encounter === "crossroads" && (
              <div className="UI">
                <h3>CROSSROADS</h3>
                <p>
                  You reached a fork in the road.
                </p>
                {crossroadsChoices && (
                  <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                    <button 
                      onClick={() => handlePlayerChoice(crossroadsChoices[0])} 
                      disabled={isProcessing}
                      style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    >
                      {isProcessing ? "Processing..." : "Go Left"}
                    </button>
                    <button 
                      onClick={() => handlePlayerChoice(crossroadsChoices[1])} 
                      disabled={isProcessing}
                      style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    >
                      {isProcessing ? "Processing..." : "Go Right"}
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* AETHERCREST */}
            {encounter === "aethercrest" && (
              <div className="UI">
                <h3>AETHERCREST</h3>
                <p>
                  Aethercrest obtained.
                </p>
                <button 
                  onClick={handleAethercrest} 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

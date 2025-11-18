import { useRef, useState, useEffect } from "react";
import Dungeon from "./Dungeon";
import "../App.css";
import "./GameOver.css";
import { usePlayerHealth } from "../context/PlayerHealth";
import { usePlayerStats } from "../context/PlayerStats";

// export default function Game({ player, onReset, onBattle }) {
export default function Game({ player, onReset }) {
  const dungeonRef = useRef();
  // const { stats, setStats } = usePlayerStats();

  // 🔥 BGM
  const bgmRef = useRef(null);

  const [encounter, setEncounter] = useState(null);
  const [intro, setIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [crossroadsChoices, setCrossroadsChoices] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { hp, takeDamage, heal } = usePlayerHealth();

  // 🔊 MUSIC FILES
  const dungeonMusic = "/music/Dungeon.m4a";
  const bat1Music = "/music/Bat.m4a";
  const bat2Music = "/music/StrongerBat.m4a";

  // 🔊 FUNCTION TO SWAP TRACKS
  const swapMusic = (src) => {
    if (!bgmRef.current) return;

    // don't reload if same track
    if (bgmRef.current.src.includes(src)) return;

    bgmRef.current.src = src;
    bgmRef.current.load();
    bgmRef.current.play().catch(() => {});
  };

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    setEncounter(type);
    setIsProcessing(false);

    // 🔥 SWITCH MUSIC ON ENCOUNTER
    if (type === "bat1") swapMusic(bat1Music);
    else if (type === "bat2") swapMusic(bat2Music);
    else swapMusic(dungeonMusic);
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

    // 🔥 WHEN ENCOUNTER ENDS → RETURN TO NORMAL MUSIC
    swapMusic(dungeonMusic);

    dungeonRef.current.resume();
  };

  const handleAethercrest = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      dungeonRef.current.regenerateEncounters();
      setEncounter(null);
      dungeonRef.current.resume();
      setIsProcessing(false);

      // aethercrest isn't bat → return to dungeon music
      swapMusic(dungeonMusic);
    }, 500);
  };

  // const handleUpgrade = (stat) => {
  //   if (isProcessing) return;
  //   setIsProcessing(true);

  //   upgradeStat(stat);
  //   dungeonRef.current.removeAethercrest();
  //   setEncounter(null);
  //   swapMusic(dungeonMusic);

  //   setTimeout(() => {
  //     dungeonRef.current.resume();
  //     setIsProcessing(false);
  //   }, 300);
  // };

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 Autoplay fix — start music on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (bgmRef.current) {
        bgmRef.current.volume = 0.5;
        bgmRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", startMusic);
    };
    window.addEventListener("click", startMusic);

    return () => window.removeEventListener("click", startMusic);
  }, []);

  // 🔥 Pause on game over
  useEffect(() => {
    if (hp <= 0) {
      setIsProcessing(false);
      setGameOver(true);

      if (dungeonRef.current) dungeonRef.current.pause();
      if (bgmRef.current) bgmRef.current.pause();

      setEncounter(null);
    }
  }, [hp]);

  // 🔥 Resume music after reset
  useEffect(() => {
    if (!gameOver && bgmRef.current) {
      bgmRef.current.play().catch(() => {});
    }
  }, [gameOver]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* 🔊 BACKGROUND MUSIC */}
      <audio ref={bgmRef} src={dungeonMusic} loop />

      <div className="dungeon-wrapper">
        <Dungeon 
          ref={dungeonRef} 
          onEncounter={handleEncounter} 
          onCrossroadsChoice={handleCrossroadsChoice} 
          player={player}
        />
      </div>

      {/* UI BELOW IS UNCHANGED */}
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
        {intro && (
          <div className="intro">
            <div>
              <h1>Welcome, {player.playerName}!</h1>
              <h2>You chose: {player.name}</h2>
              <p>
                HP: {player.baseStats.HP} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}
              </p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-over">
            <div>
              <img src="/characters/player_death.png" />
              <h1>💀 YOU DIED 💀</h1>
              <p>
                HP: {hp} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}
              </p>
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

        {/* Rest of UI unchanged */}
        <div className="game-ui">
          <div className="statbar">
            <h2>{player.playerName} | {player.name}</h2>
            <div className="grouped-stats">
              <h2>♥️{hp}</h2>
              <h2>🗡️{player.baseStats.ATK}</h2>
              <h2>👟{player.baseStats.SPD}</h2>
              <h2>🛡️{player.baseStats.DEF}</h2>
            </div>
          </div>

          <div className="encounter-container">
            {encounter === "fountain" && (
              <div className="UI">
                <h3>HEALING FOUNTAIN</h3>
                <p>You recover 10 health.</p>
                <button 
                  onClick={handleExitEncounter} 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}

            {encounter === "bat1" && (
              <div className="UI">
                <h3>NORMAL BAT ENCOUNTER</h3>
                <p>You face a bat.</p>
                <button 
                  onClick={handleExitEncounter} 
                  // onClick={onBattle} 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}

            {encounter === "bat2" && (
              <div className="UI">
                <h3>STRONG BAT ENCOUNTER</h3>
                <p>You face a strong bat.</p>
                <button 
                  onClick={handleExitEncounter} 
                  // onClick={onBattle} 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}

            {encounter === "crossroads" && (
              <div className="UI">
                <h3>CROSSROADS</h3>
                <p>You reached a fork in the road.</p>

                {crossroadsChoices && (
                  <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                    <button 
                      onClick={() => handlePlayerChoice(crossroadsChoices[0])}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Go Left"}
                    </button>

                    <button 
                      onClick={() => handlePlayerChoice(crossroadsChoices[1])}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Go Right"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {encounter === "aethercrest" && (
              <div className="UI upgrade-ui">
                <h3>AETHERCREST</h3>
                <p>Aethercrest obtained. Choose one upgrade:</p>

                {/* <div className="upgrade-buttons">
                  <button onClick={() => handleUpgrade("ATK")}>+5 ATK</button>
                  <button onClick={() => handleUpgrade("SPD")}>+5 SPD</button>
                  <button onClick={() => handleUpgrade("DEF")}>+5 DEF</button>
                </div> */}
                <button 
                  onClick={handleAethercrest} 
                  disabled={isProcessing}
                  style={{margin: "1%"}}
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

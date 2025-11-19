import { useRef, useState, useEffect } from "react";
import Dungeon from "./Dungeon";
import "../App.css";
import "./GameOver.css";
import { usePlayerHealth } from "../context/PlayerHealth";
import { usePlayerStats } from "../context/PlayerStats";

export default function Game({ player, onReset, onBattle }) {
  const dungeonRef = useRef();
  const { stats, upgrade } = usePlayerStats();

  // 🔥 BGM
  const bgmRef = useRef(null);

  const [encounter, setEncounter] = useState(null);
  const [intro, setIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [crossroadsChoices, setCrossroadsChoices] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { hp, takeDamage, heal } = usePlayerHealth();
  const [aethercrestCount, setAethercrestCount] = useState(0);

  // 🔊 ONLY ONE MUSIC FILE NOW
  const dungeonMusic = "/music/Dungeon.m4a";

  // 🔊 ALWAYS PLAY DUNGEON MUSIC
  const swapMusic = () => {
    if (!bgmRef.current) return;
    if (bgmRef.current.src.includes(dungeonMusic)) return;

    bgmRef.current.src = dungeonMusic;
    bgmRef.current.load();
    bgmRef.current.play().catch(() => {});
  };

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    setEncounter(type);
    setIsProcessing(false);

    // 🎵 ALWAYS keep dungeon music
    swapMusic();
  };

  const handleCrossroadsChoice = (choices) => {
    console.log("Crossroads choices:", choices);
    setCrossroadsChoices(choices);
  };

  const handlePlayerChoice = (chosenType) => {
    if (isProcessing) return;

    setIsProcessing(true);
    dungeonRef.current.setMysteryType(chosenType);
    setCrossroadsChoices(null);
    handleExitEncounter();
  };

  const handleExitEncounter = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    const scalingBonus = aethercrestCount * 5;

    if (encounter === "fountain") heal(10 + scalingBonus);
    if (encounter === "bat1") takeDamage(10 + scalingBonus);
    if (encounter === "bat2") takeDamage(20 + scalingBonus);

    console.log("Encounter ended!");
    setEncounter(null);

    swapMusic(); // keep dungeon music
    dungeonRef.current.resume();
  };

  const handleUpgrade = (stat) => {
    if (!stats) return;
    if (isProcessing) return;
    setIsProcessing(true);

    upgrade(stat);

    setTimeout(() => {
      dungeonRef.current.regenerateEncounters();
      dungeonRef.current.removeAethercrest();
      setEncounter(null);
      dungeonRef.current.resume();
      setAethercrestCount((prev) => prev + 1);
      setIsProcessing(false);
      swapMusic();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 Autoplay fix
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
      setAethercrestCount(0);

      if (dungeonRef.current) dungeonRef.current.pause();
      if (bgmRef.current) bgmRef.current.pause();

      setEncounter(null);
    }
  }, [hp]);

  // 🔥 Resume dungeon music after reset
  useEffect(() => {
    if (!gameOver && bgmRef.current) {
      swapMusic();
      bgmRef.current.play().catch(() => {});
    }
  }, [gameOver]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
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
                HP: {hp} | ATK: {stats.ATK} | SPD: {stats.SPD} | DEF: {stats.DEF}
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
                HP: {hp} | ATK: {stats.ATATK} | SPD: {stats.SPD} | DEF: {stats.DEF}
              </p>
              <button
                onClick={onReset}
                disabled={isProcessing}
                style={{
                  opacity: isProcessing ? 0.5 : 1,
                  cursor: isProcessing ? "not-allowed" : "pointer",
                }}
              >
                {isProcessing ? "Processing..." : "Play Again"}
              </button>
            </div>
          </div>
        )}

        {/* ----------------- UI ----------------- */}
        <div className="game-ui">
          <div className="statbar">
            <h2>
              {player.playerName} | {player.name}
            </h2>
            <div className="grouped-stats">
              <h2>♥️{hp}</h2>
              <h2>🗡️{stats.ATK}</h2>
              <h2>👟{stats.SPD}</h2>
              <h2>🛡️{stats.DEF}</h2>
            </div>
          </div>

          <div className="encounter-container">
            {encounter === "fountain" && (
              <div className="UI">
                <h3>HEALING FOUNTAIN</h3>
                <p>You recover 10 health.</p>
                <button onClick={handleExitEncounter} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            )}

            {/* ⭐ Always dungeon music */}
            {encounter === "bat1" && (
              <div className="UI">
                <h3>NORMAL BAT ENCOUNTER</h3>
                <p>You face a bat.</p>
                <button
                  onClick={() => {
                    swapMusic();
                    onBattle("bat1");
                  }}
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
                  onClick={() => {
                    swapMusic();
                    onBattle("bat2");
                  }}
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
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginTop: "10px",
                    }}
                  >
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

                <div className="upgrade-buttons">
                  <button onClick={() => handleUpgrade("ATK")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "+5 🗡️"}
                  </button>
                  <button onClick={() => handleUpgrade("SPD")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "+5 👟"}
                  </button>
                  <button onClick={() => handleUpgrade("DEF")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "+5 🛡️"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

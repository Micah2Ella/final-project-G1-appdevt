// Game.jsx
import { useRef, useState, useEffect } from "react";
import Dungeon from "./Dungeon";
import Combat from "./Combat";
import "../App.css";
import "./GameOver.css";
import { usePlayerHealth } from "../context/PlayerHealth";
import { usePlayerStats } from "../context/PlayerStats";

export default function Game({ player, onReset }) {
  const dungeonRef = useRef();
  const { stats, upgrade } = usePlayerStats();

  // 🔥 BGM
  const bgmRef = useRef(null);

  const [mode, setMode] = useState("dungeon"); // 'dungeon' | 'combat'
  const [combatEnemy, setCombatEnemy] = useState(null);

  const [encounter, setEncounter] = useState(null);
  const [intro, setIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [crossroadsChoices, setCrossroadsChoices] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { hp, takeDamage, heal } = usePlayerHealth();
  const [aethercrestCount, setAethercrestCount] = useState(0);
  const [fadeToCombat, setFadeToCombat] = useState(false);
  const [fadeFromCombat, setFadeFromCombat] = useState(false);
  const scalingBonus = aethercrestCount * 5;
  const [defeatedEnemies, setDefeatedEnemies] = useState(new Set());
  const [defeated, setDefeated] = useState({});

  // 🔊 ONLY ONE MUSIC FILE NOW
  const dungeonMusic = "/music/Dungeon.m4a";

  // 🔊 ALWAYS PLAY DUNGEON MUSIC (switch/resume helper)
  const swapMusic = () => {
    if (!bgmRef.current) return;
    if (bgmRef.current.src.includes(dungeonMusic)) return;

    bgmRef.current.src = dungeonMusic;
    bgmRef.current.load();
    bgmRef.current.play().catch(() => {});
  };

  // START combat overlay: pause dungeon & music
  const startCombat = (enemyType) => {
    setFadeToCombat(true);

    setTimeout(() => {
      setCombatEnemy(enemyType);
      setMode("combat");
      setFadeToCombat(false);
      setFadeFromCombat(true);

      setTimeout(() => setFadeFromCombat(false), 600);
    }, 600);

    if (dungeonRef.current && typeof dungeonRef.current.pause === "function") {
      try {
        dungeonRef.current.pause();
      } catch (e) {}
    }

    if (bgmRef.current) {
      try {
        bgmRef.current.pause();
      } catch (e) {}
    }
  };

  // END combat overlay: resume dungeon & music
  const endCombat = () => {
    setFadeToCombat(true);
    stopAllMusic();
    swapMusic();

    // Mark enemy as defeated before switching modes
    setDefeatedEnemies((prev) => new Set(prev).add(combatEnemy));

    setTimeout(() => {
      setDefeated(prev => ({ ...prev, [encounter.id]: true }));
      setEncounter(null);
      setMode("dungeon");
      setFadeToCombat(false);
      setFadeFromCombat(true);
      setTimeout(() => setFadeFromCombat(false), 600);
      dungeonRef.current?.resume();
    }, 600);
  };

  const handleEncounter = (type) => {
    console.log("Encounter triggered:", type);
    const id = Date.now() + Math.random();
    setEncounter({ id, type });
    setIsProcessing(false);

    // ensure dungeon music is playing if not in combat
    if (mode === "dungeon") swapMusic();
  };

  const handleCrossroadsChoice = (choices) => {
    console.log("Crossroads choices:", choices);
    setCrossroadsChoices(choices);
  };

  const handlePlayerChoice = (chosenType) => {
    if (isProcessing) return;

    setIsProcessing(true);
    if (dungeonRef.current && typeof dungeonRef.current.setMysteryType === "function") {
      dungeonRef.current.setMysteryType(chosenType);
    }
    setCrossroadsChoices(null);
    handleExitEncounter();
  };

  const handleExitEncounter = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    if (encounter?.type === "fountain") heal(10 + scalingBonus);
    if (encounter?.type === "bat1") takeDamage(10 + scalingBonus);
    if (encounter?.type === "bat2") takeDamage(20 + scalingBonus);

    console.log("Encounter ended!");
    setEncounter(null);

    // keep dungeon music (unless we immediately start combat)
    if (mode === "dungeon") swapMusic();
    if (dungeonRef.current && typeof dungeonRef.current.resume === "function") {
      dungeonRef.current.resume();
    }
    setIsProcessing(false);
  };

  const handleUpgrade = (stat) => {
    if (!stats) return;
    if (isProcessing) return;
    setIsProcessing(true);

    upgrade(stat);

    setTimeout(() => {
      if (dungeonRef.current && typeof dungeonRef.current.regenerateEncounters === "function") {
        dungeonRef.current.regenerateEncounters();
      }
      if (dungeonRef.current && typeof dungeonRef.current.removeAethercrest === "function") {
        dungeonRef.current.removeAethercrest();
      }
      setEncounter(null);
      if (dungeonRef.current && typeof dungeonRef.current.resume === "function") {
        dungeonRef.current.resume();
      }
      setAethercrestCount((prev) => prev + 1);
      setIsProcessing(false);
      swapMusic();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 Autoplay fix for dungeon music
  useEffect(() => {
    const startMusic = () => {
      if (bgmRef.current && mode === "dungeon") {
        bgmRef.current.volume = 0.5;
        bgmRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", startMusic);
    };
    window.addEventListener("click", startMusic);
    return () => window.removeEventListener("click", startMusic);
  }, [mode]);

  // 🔥 Pause on game over
  useEffect(() => {
    if (hp <= 0) {
      setIsProcessing(false);
      setGameOver(true);
      setAethercrestCount(0);

      if (dungeonRef.current && typeof dungeonRef.current.pause === "function") {
        dungeonRef.current.pause();
      }
      stopAllMusic();

      setEncounter(null);
      // keep mode as dungeon but show gameOver UI
    }
  }, [hp]);

  // 🔥 Resume dungeon music after reset or after exiting combat
  useEffect(() => {
    if (!gameOver && bgmRef.current && mode === "dungeon") {
      swapMusic();
      bgmRef.current.play().catch(() => {});
    }
  }, [gameOver, mode]);

  return (
    <div>
      <div
        style={{
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {fadeToCombat && (
          <div className="black-fade-overlay fade-to-black" />
        )}
        {fadeFromCombat && (
          <div className="black-fade-overlay fade-from-black" />
        )}

        {/* 🔊 BACKGROUND MUSIC */}
        <audio ref={bgmRef} src={dungeonMusic} loop />

        <div className="dungeon-wrapper">
          {/* Dungeon is always mounted and preserved */}
          <Dungeon
            ref={dungeonRef}
            onEncounter={handleEncounter}
            onCrossroadsChoice={handleCrossroadsChoice}
            player={player}
            onStartCombat={startCombat} // in case your Dungeon wants to trigger combat directly
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
                <img src="/characters/player_death.png" alt="death" />
                <h1>💀 YOU DIED 💀</h1>
                <p>
                  HP: {hp} | ATK: {stats.ATK} | SPD: {stats.SPD} | DEF: {stats.DEF}
                </p>
                <button
                  onClick={() => {
                    // Reset flow: call parent onReset to go back to character select
                    onReset?.();
                  }}
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
              {encounter?.type === "fountain" && (
                <div className="UI">
                  <h3>HEALING FOUNTAIN</h3>
                  <p>You recover {10 + scalingBonus} health.</p>
                  <button onClick={handleExitEncounter} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Continue"}
                  </button>
                </div>
              )}

              {encounter?.type === "bat1" && !defeated[encounter.id] && (
                <div className="UI">
                  <h3>NORMAL BAT ENCOUNTER</h3>
                  <p>You face a bat.</p>
                  <button
                    onClick={() => {
                      // Start combat overlay inside Game (dungeon music will be paused)
                      startCombat("bat1");
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Fight"}
                  </button>
                </div>
              )}

              {encounter?.type === "bat2" && !defeated[encounter.id] && (
                <div className="UI">
                  <h3>STRONG BAT ENCOUNTER</h3>
                  <p>You face a strong bat.</p>
                  <button
                    onClick={() => {
                      startCombat("bat2");
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Fight"}
                  </button>
                </div>
              )}

              {encounter?.type === "crossroads" && (
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

              {encounter?.type === "aethercrest" && (
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

        {/* ----------------- COMBAT OVERLAY ----------------- */}
        {mode === "combat" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Combat
              player={player}
              enemyType={combatEnemy}
              onExitCombat={() => {
                // Called by Combat when finished/defeated
                endCombat();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const stopAllMusic = () => {
    const audios = document.querySelectorAll("audio");
    audios.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    });
  };
// App.jsx
import { useState, useRef, useEffect } from "react";
import TitleScreen from "./components/TitleScreen";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game";
import Controls from "./components/Controls";
import "./App.css";
import { PlayerHealthProvider } from "./context/PlayerHealth";
import { BrowserRouter } from "react-router-dom";
import { PlayerStatsProvider } from "./context/PlayerStats";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [fade, setFade] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  // -------------------- 🎵 TITLE MUSIC --------------------
  const titleMusicRef = useRef(null);

  useEffect(() => {
    // Create audio only once
    if (!titleMusicRef.current) {
      const audio = new Audio("/music/Title.m4a");
      audio.loop = true;
      audio.volume = 0.5;
      titleMusicRef.current = audio;
    }

    // Auto-play unlock
    const unlock = () => {
      titleMusicRef.current.play().catch(() => {});
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);

  // Always reset + restart when going to TITLE
  const restartTitleMusic = () => {
    if (!titleMusicRef.current) return;

    titleMusicRef.current.pause();
    titleMusicRef.current.currentTime = 0; // ← RESET
    titleMusicRef.current.play().catch(() => {});
  };

  // Stop Title music when entering gameplay
  const stopTitleMusic = () => {
    if (!titleMusicRef.current) return;

    titleMusicRef.current.pause();
    titleMusicRef.current.currentTime = 0; // ensure clean stop
  };

  // ---------------------------------------------------------
  // SCREEN TRANSITIONS
  // ---------------------------------------------------------

  const handleStart = () => {
    stopTitleMusic();
    setFade(true);
    setTimeout(() => {
      setScreen("characterSelect");
      setFade(false);
    }, 600);
  };

  const handleControls = () => {
    setFade(true);
    setTimeout(() => {
      setScreen("controls");
      setFade(false);
    }, 600);
  };

  const handleCharacterSelect = (character) => {
    setPlayerData(character);
    stopTitleMusic(); // Starting game → stop music
    setFade(true);
    setTimeout(() => {
      setScreen("gameplay");
      setFade(false);
    }, 600);
  };

  const handleReset = () => {
    setFade(true);
    setTimeout(() => {
      setPlayerData(null);
      // Returning to character select does NOT restart the music
      setScreen("characterSelect");
      setFade(false);
    }, 600);
  };

  return (
    <BrowserRouter>
      <div className={`fade-wrapper ${fade ? "fade-out" : "fade-in"}`}>
        {/* ---------------------- TITLE SCREEN ---------------------- */}
        {screen === "title" && (
          <>
            {restartTitleMusic()}
            <TitleScreen onStart={handleStart} onControls={handleControls} />
          </>
        )}

        {/* ---------------------- CONTROLS ---------------------- */}
        {screen === "controls" && <Controls onBack={() => setScreen("title")} />}

        {/* ---------------------- CHARACTER SELECT ---------------------- */}
        {screen === "characterSelect" && (
          <CharacterSelect onSelect={handleCharacterSelect} />
        )}

        {/* ---------------------- GAMEPLAY (PERSISTENT) ---------------------- */}
        {screen === "gameplay" && (
          <PlayerHealthProvider baseHP={playerData?.baseStats?.HP ?? 100}>
            <PlayerStatsProvider baseStats={playerData?.baseStats}>
              {/* Game now handles combat overlay internally */}
              <Game player={playerData} onReset={handleReset} />
            </PlayerStatsProvider>
          </PlayerHealthProvider>
        )}
      </div>
    </BrowserRouter>
  );
}

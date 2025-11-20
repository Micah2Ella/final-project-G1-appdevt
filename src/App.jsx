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
import AudioManager from "./components/AudioManager";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [fade, setFade] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const unlockHandler = () => {
      AudioManager.unlock();
      AudioManager.play("/music/Title.m4a");
      window.removeEventListener("pointerdown", unlockHandler);
    };

    window.addEventListener("pointerdown", unlockHandler);

    return () => window.removeEventListener("pointerdown", unlockHandler);
  }, []);

  // ---------------------------------------------------------
  // SCREEN TRANSITIONS
  // ---------------------------------------------------------

  const handleStart = () => {
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
    AudioManager.stop();
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

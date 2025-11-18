import { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game";
import Controls from "./components/Controls";   // ← ADD THIS
import "./App.css";
import { PlayerHealthProvider } from "./context/PlayerHealth";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [fade, setFade] = useState(false);
  const [playerData, setPlayerData] = useState(null);

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
      setScreen("characterSelect");
      setFade(false);
    }, 600);
  };

  return (
    <BrowserRouter>
      <div className={`fade-wrapper ${fade ? "fade-out" : "fade-in"}`}>

        {screen === "title" && (
          <TitleScreen 
            onStart={handleStart} 
            onControls={handleControls}   // ⭐ NEW
          />
        )}

        {screen === "controls" && (
          <Controls onBack={() => setScreen("title")} />  
        )}

        {screen === "characterSelect" && (
          <CharacterSelect onSelect={handleCharacterSelect} />
        )}

        <PlayerHealthProvider baseHP={playerData?.baseStats?.HP ?? 100}>
          {screen === "gameplay" && (
            <Game player={playerData} onReset={handleReset} />
          )}
        </PlayerHealthProvider>
      </div>
    </BrowserRouter>
  );
}

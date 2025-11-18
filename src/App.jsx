import { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game"; // make sure you create this file
import "./App.css"; // fade styles here
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

  const handleCharacterSelect = (character) => {
    setPlayerData(character); // store selected character + player name
    setFade(true);
    setTimeout(() => {
      setScreen("gameplay"); // move to gameplay
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
  }

  return (
    <BrowserRouter>
      <div className={`fade-wrapper ${fade ? "fade-out" : "fade-in"}`}>
      {screen === "title" && <TitleScreen onStart={handleStart} />}
      {screen === "characterSelect" && (
        <CharacterSelect onSelect={handleCharacterSelect} />
      )}
      <PlayerHealthProvider baseHP={playerData?.baseStats?.HP ?? 100}>
        {screen === "gameplay" && <Game player={playerData} onReset={handleReset} />}
      </PlayerHealthProvider>
    </div>
    </BrowserRouter>
  );
}

import { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game"; // make sure you create this file
import "./App.css"; // fade styles here

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

  return (
    <div className={`fade-wrapper ${fade ? "fade-out" : "fade-in"}`}>
      {screen === "title" && <TitleScreen onStart={handleStart} />}
      {screen === "characterSelect" && (
        <CharacterSelect onSelect={handleCharacterSelect} />
      )}
      {screen === "gameplay" && <Game player={playerData} />}
    </div>
  );
}

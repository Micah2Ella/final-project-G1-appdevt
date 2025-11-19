// PlayerStats.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { loadGame, saveGame } from "./GameStorage";

const PlayerStatsContext = createContext();

export function PlayerStatsProvider({ children, baseStats, playerName }) {
  const initialStats = baseStats || { HP: 100, ATK: 10, SPD: 10, DEF: 10 };
  const [stats, setStats] = useState(initialStats);
  const [loaded, setLoaded] = useState(false);

  const normalizedName =
    playerName?.toLowerCase().replace(/\s+/g, "_") || "player";

  useEffect(() => {
    const save = loadGame(normalizedName);
    if (save.stats !== undefined) setStats(save.stats);
    setLoaded(true);
  }, [normalizedName]);

  useEffect(() => {
    if (!loaded) return;
    saveGame(normalizedName, { stats });
  }, [stats, loaded, normalizedName]);

  const upgrade = (stat) => {
    setStats((prev) => ({
      ...prev,
      [stat]: (prev[stat] ?? 0) + 5,
    }));
  };

  const resetStats = () => {
    setStats(initialStats);
  };

  return (
    <PlayerStatsContext.Provider value={{ stats, upgrade, resetStats }}>
      {children}
    </PlayerStatsContext.Provider>
  );
}

export function usePlayerStats() {
  const context = useContext(PlayerStatsContext);
  if (!context) {
    throw new Error("usePlayerStats must be used within PlayerStatsProvider");
  }
  return context;
}

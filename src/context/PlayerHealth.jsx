// PlayerHealth.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { loadGame, saveGame } from "./GameStorage";

const HealthContext = createContext();

export function PlayerHealthProvider({ children, baseHP, playerName }) {
  const [hp, setHp] = useState(baseHP ?? 100);
  const [loaded, setLoaded] = useState(false);

  const normalizedName =
    playerName?.toLowerCase().replace(/\s+/g, "_") || "player";

  useEffect(() => {
    const save = loadGame(normalizedName);
    if (save.hp !== undefined) setHp(save.hp);
    setLoaded(true);
  }, [normalizedName]);

  useEffect(() => {
    if (!loaded) return;
    saveGame(normalizedName, { hp });
  }, [hp, loaded, normalizedName]);

  const maxHp = baseHP;

  const takeDamage = (amount) => {
    setHp((h) => Math.max(h - amount, 0));
  };

  const heal = (amount) => {
    setHp((h) => Math.min(h + amount, maxHp));
  };

  const resetHP = () => {
    setHp(baseHP ?? 100);
  };

  return (
    <HealthContext.Provider value={{ hp, maxHp, takeDamage, heal, resetHP }}>
      {children}
    </HealthContext.Provider>
  );
}

export function usePlayerHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("usePlayerHealth must be used within PlayerHealthProvider");
  }
  return context;
}

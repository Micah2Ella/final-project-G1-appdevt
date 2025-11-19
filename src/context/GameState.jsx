// GameState.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { loadGame, saveGame, resetGameState } from "./GameStorage";

const GameStateContext = createContext();

export function GameStateProvider({ children, playerName }) {
  const normalizedName = playerName?.toLowerCase().replace(/\s+/g, "_");

  const [aethercrestCount, setAethercrestCount] = useState(0);
  const [offsetPosition, setOffsetPosition] = useState(0);
  const [visibleEncounters, setVisibleEncounters] = useState([]);
  const [encounterMap, setEncounterMap] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // persistent crossroads
  const [crossroadsState, setCrossroadsState] = useState(null);

  useEffect(() => {
    const save = loadGame(normalizedName);

    setAethercrestCount(save.aethercrestCount ?? 0);
    setOffsetPosition(save.offsetPosition ?? 0);
    setVisibleEncounters(save.visibleEncounters ?? []);
    setEncounterMap(save.encounterMap ?? []);
    setIsPaused(save.isPaused ?? false);
    setIsDead(save.isDead ?? false);
    setPlayerData(save.playerData ?? null);
    setCurrentEncounter(save.currentEncounter ?? null);

    setCrossroadsState(save.crossroadsState ?? null);

    setLoaded(true);
  }, [normalizedName]);

  useEffect(() => {
    if (!loaded) return;

    saveGame(normalizedName, {
      aethercrestCount,
      offsetPosition,
      visibleEncounters,
      encounterMap,
      isPaused,
      isDead,
      playerData,
      currentEncounter,
      crossroadsState
    });
  }, [
    loaded,
    normalizedName,
    aethercrestCount,
    offsetPosition,
    visibleEncounters,
    encounterMap,
    isPaused,
    isDead,
    playerData,
    currentEncounter,
    crossroadsState
  ]);

  const resetGame = () => {
    resetGameState(normalizedName);

    setAethercrestCount(0);
    setOffsetPosition(0);
    setVisibleEncounters([]);
    setEncounterMap([]);
    setIsPaused(false);
    setIsDead(false);
    setCurrentEncounter(null);
    setCrossroadsState(null);
  };

  return (
    <GameStateContext.Provider
      value={{
        aethercrestCount,
        setAethercrestCount,
        offsetPosition,
        setOffsetPosition,
        visibleEncounters,
        setVisibleEncounters,
        encounterMap,
        setEncounterMap,
        isPaused,
        setIsPaused,
        isDead,
        setIsDead,
        currentEncounter,
        setCurrentEncounter,
        playerData,
        setPlayerData,
        crossroadsState,
        setCrossroadsState,
        resetGame,
        loaded
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  return useContext(GameStateContext);
}

import { createContext, useContext, useState, useEffect } from "react";

const PlayerStatsContext = createContext();

export function PlayerStatsProvider({ children, baseStats }) {
    const [ stats, setStats ] = useState(baseStats);

    const upgradeStat = (stat) => {
        setPlayer(prev => ({
            ...prev,
            baseStats: {
                ...prev.baseStats,
                [stat]: prev.baseStats[stat] + 5
            }
        }));
    };

    return (
        <PlayerStatsContext.Provider value={{ stats, upgradeStat }}>
            {children}
        </PlayerStatsContext.Provider>
    )
}

export function usePlayerStats() {
    return useContext({PlayerStatsContext});
}
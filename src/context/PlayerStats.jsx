import { createContext, useContext, useState } from "react";

const PlayerStatsContext = createContext();

export function PlayerStatsProvider({ children, baseStats }) {
    const initialStats = baseStats || { HP: 100, ATK: 10, SPD: 10, DEF: 10 };
    const [ stats, setStats ] = useState(initialStats);

    const upgrade = (stat) => {
        setStats(prev => ({
            ...prev,
            [stat]: prev[stat] + 5
        }));
    };

    return (
        <PlayerStatsContext.Provider value={{ stats, upgrade }}>
            {children}
        </PlayerStatsContext.Provider>
    )
}

export function usePlayerStats() {
    return useContext(PlayerStatsContext);
}
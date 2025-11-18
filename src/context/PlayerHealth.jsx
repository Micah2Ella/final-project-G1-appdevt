import { createContext, useContext, useState, useEffect } from "react";

const HealthContext = createContext();

export function PlayerHealthProvider({ children, baseHP }) {
    const [ hp, setHp ] = useState(100);
    const maxHp = baseHP;

    const takeDamage = (amount) => {
        setHp((h) => Math.max(h - amount, 0));
    };
    
    const heal = (amount) => {
        setHp((h) => Math.min(h + amount, maxHp));
    };

    return (
        <HealthContext.Provider value={{ hp, maxHp, takeDamage, heal }}>
            {children}
        </HealthContext.Provider>
    )
}

export function usePlayerHealth() {
    return useContext(HealthContext);
}
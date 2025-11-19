export function loadGame(normalizedName) {
    const raw = localStorage.getItem(`aethercrest_${normalizedName}_demo`);
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export function saveGame(normalizedName, updates) {
    const current = loadGame(normalizedName);
    const merged = { ...current, ...updates, timestamp: Date.now() };
    localStorage.setItem(
        `aethercrest_${normalizedName}_demo`,
        JSON.stringify(merged)
    );
}

export function resetGameState(normalizedName) {
    localStorage.removeItem(`aethercrest_${normalizedName}_demo`);
}

export function findAnySaveKey() {
    return Object.keys(localStorage).find(
        (k) => k.startsWith("aethercrest_") && k.endsWith("_demo")
    ) || null;
}

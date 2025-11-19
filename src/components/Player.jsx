import React from "react";

export default function({ isPaused, player }) {
    const charKey = player?.name?.toLowerCase();

    const idleSprite = `/characters/${charKey}-idle.png`;
    const runSprite = `/characters/${charKey}-run.png`;

    const sprite = isPaused ? idleSprite : runSprite;

    const height =
        player?.name === "Rogue"
            ? 345
            : player?.name === "Barbarian"
            ? 345
            : 345

    return (
        <img 
            src={sprite}
            alt={player?.name || "Player"}
            className={!isPaused ? "run" : ""}
            style={{
                position: "absolute",
                bottom: "15px",
                left: "35%",
                transform: "translateX(-50%)",
                width: "auto",
                height: `${height}px`,
                zIndex: "5",
                imageRendering: "pixelated",
                transition: "filter 0.2s ease-in-out",
                filter: "drop-shadow(0px 0px 10px rgba(0, 0, 0, 1))"
            }}
        />
    );
}
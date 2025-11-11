import React from "react";
import fountainSprite from "/fountain/sprite3.png";
import enemySprite from "/enemy/bat/bat.png";
import crossroadSprite from "/crossroads/crossroad.png";
import aethercrestSprite from "/aethercrest/aethercrest.png";

export default function Encounters({ type, x, y }) {
    const encounterData = {
        fountain: { img: fountainSprite, width: 222, height: 168 },
        enemy: { img: enemySprite, width: 81, height: 54 },
        crossroads: { img: crossroadSprite, width: 75, height: 231 },
        aethercrest: { img: aethercrestSprite, width: 54, height: 52},
    };

    const { img, width, height } = encounterData[type] || {};

    if (!img) return null;

    return (
        <img
            src={img}
            alt={type}
            style={{
                position: "absolute",
                left: `${x}px`,
                bottom: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                imageRendering: "pixelated",
                transition: "transform 0.1s linear",
                zIndex: 2,
            }}
        />
    );
}
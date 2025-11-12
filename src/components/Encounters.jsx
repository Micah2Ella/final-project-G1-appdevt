import React from "react";
import "../App.css";
import fountainSprite from "/fountain/sprite3.png";
import bat1 from "/enemy/bat/bat1.png";
import bat2 from "/enemy/bat/bat2.png";
import crossroadSprite from "/crossroads/crossroad.png";
import aethercrestSprite from "/aethercrest/aethercrest.png";

export default function Encounters({ type, x }) {
    const encounterData = {
        fountain: { img: fountainSprite, width: 296, height: 224, y: 50 },
        bat1: { img: bat1, width: 108, height: 72, y: 150 },
        bat2: { img: bat2, width: 108, height: 72, y: 150 },
        crossroads: { img: crossroadSprite, width: 100, height: 308, y: 50 },
        aethercrest: { img: aethercrestSprite, width: 54, height: 52, y: 100},
    };

    const { img, width, height, y } = encounterData[type] || {};

    if (!img) return null;

    const animation =
        type === "bat1" || type === "bat2"
            ? "figure8"
            : type === "aethercrest"
            ? "float"
            : ""

    return (
        <img
            src={img}
            alt={type}
            className={animation}
            style={{
                position: "absolute",
                left: `${x}px`,
                bottom: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                imageRendering: "pixelated",
                transition: "transform 0.1s linear",
                zIndex: 2,
                filter: "drop-shadow(0px 0px 10px rgba(0, 0, 0, 1))"
            }}
        />
    );
}
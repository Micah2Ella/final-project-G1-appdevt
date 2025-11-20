import React from "react";
import "../App.css";
import fountainSprite from "/fountain/fountain.PNG";
import bat1 from "/enemy/bat/bat1.png";
import bat2 from "/enemy/bat/bat2.png";
import crossroadSprite from "/crossroads/crossroad.png";
import aethercrestSprite from "/aethercrest/aethercrest.png";
import pedestalSprite from "/aethercrest/pedestal.png"

export default function Encounters({ type, x }) {
    const encounterData = {
        fountain: { img: fountainSprite, width: 309, height: 300, y: 50 },
        bat1: { img: bat1, width: 251, height: 132, y: 150 },
        bat2: { img: bat2, width: 342, height: 166, y: 150 },
        crossroads: { img: crossroadSprite, width: 232, height: 308, y: 70 },
        aethercrest: { img: aethercrestSprite, width: 87.5, height: 87, y: 200},
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
        <>
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

            {type === "aethercrest" && (
                <img
                    src={pedestalSprite}
                    style={{
                        position: "absolute",
                        left: `${x-25}px`,
                        bottom: `30px`,
                        width: "auto",
                        height: "200px",
                        imageRendering: "pixelated",
                        zIndex: 1,
                    }}
                />
            )}
        </>
    );
}
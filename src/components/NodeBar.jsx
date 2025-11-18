import React from "react";
import "../App.css";

const NodeBar = ({ encounters, playerPos }) => {
    // show encounters ahead of player
    const future = encounters.filter(e => e.position > playerPos);

    return (
        <div className="node-bar">
            {/* YOU marker */}
            <div className="you-marker">
                <div className="you-dot"></div>
                <span className="you-text">YOU</span>
            </div>

            {/* Future Encounter Icons */}
            {future.map((e, i) => {
                const distance = e.position - playerPos;

                // normalize distance: 0-5000 range
                const maxDistance = 5000;
                const clamped = Math.min(distance/maxDistance, 1);

                // scale image = 0.55 to 1 size
                const scale = 1 - clamped * 0.55;

                // shift opacity = 0.7 to 1
                const opacity = 1 - clamped * 0.7;
                
                return(
                    <img
                        key={i}
                        className="node-icon"
                        src={e.type === "mystery" ? `/encounters/${e.type}.png` : `/encounters/${e.type}.png`}
                        alt={e.type}
                        style={{
                            transform: `scale(${scale})`,
                            opacity: `${opacity}`,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default NodeBar;
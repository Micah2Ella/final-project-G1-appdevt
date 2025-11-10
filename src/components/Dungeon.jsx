import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import "./Dungeon.css";

const Dungeon = forwardRef((props, ref) => {
    const bgRef = useRef(null);
    const offsetRef = useRef(0);
    const [isPaused, setIsPaused] = useState(false);

    const speed = 0.5;
    const imageWidth = 720; // adjust according to image width in px
    const viewportWidth = window.innerWidth;

    useImperativeHandle(ref, () => ({
        pause() {
            setIsPaused(true);
            console.log("Scrolling paused");
        },
        resume() {
            setIsPaused(false);
            console.log("Scrolling resumed");
        },
    }));

    useEffect(() => {
        const element = bgRef.current;
        let frameId;

        const loop = () => {
            if (!isPaused && element){
                offsetRef.current -= speed;
                const offset = offsetRef.current;
                element.style.backgroundPosition = `${offset}px 0`;

                const centerPos = -(imageWidth / 2 - viewportWidth / 2);

                if (Math.abs(offset - centerPos) < speed) {
                    setIsPaused(true);
                    console.log("Encounter point reached!")
                    // Later: trigger encounter here.
                }
            }
            frameId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(frameId);
    }, [isPaused]);

    return (
        <div className="dungeon" ref={bgRef}>
            {/* Later: add <Player />, <Enemy />, <UI />, etc. */}
        </div>
    )
});

export default Dungeon;
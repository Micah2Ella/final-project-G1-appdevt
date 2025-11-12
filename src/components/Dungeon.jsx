import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import "../App.css";
import Encounters from "./Encounters";
import Player from "./Player";

const Dungeon = forwardRef(({ onEncounter, player }, ref) => {
    const bgRef = useRef(null);
    const offsetRef = useRef(0);
    const [isPaused, setIsPaused] = useState(false);
    const [visibleEncounters, setVisibleEncounters] = useState([]);
    const encounters = useRef([]);

    const speed = 1;
    const currentOffset = offsetRef.current;
    const viewportWidth = window.innerWidth;
    const triggerX = viewportWidth * 0.6;

    const generateEncounters = (cycle = 1) => {
        const encounterPool = [
            {type: "fountain", weight: 0.15}, 
            {type: "bat1", weight: 0.65}, 
            {type: "bat2", weight: 0.10}, 
            {type: "crossroads", weight: 0.10},
        ];

        const weightedRandom = () => {
            const r = Math.random();
            let acc = 0;
            for (const e of encounterPool) {
                acc += e.weight;
                if (r <= acc) return e.type;
            }
            return "bat1";
        };

        const list = [];
        let pos = currentOffset + viewportWidth + 800;
        
        // three randomly generated encounters
        for (let i = 0; i < 3; i++) {
            pos +=  1200 + Math.random() * 2000;
            list.push({ position: pos, type: weightedRandom(), triggered: false });
        }

        // aethercrest after 3 encounters
        pos += 1500;
        list.push({
            position: pos,
            type: "aethercrest",
            triggered: false,
        })

        console.log(`Cycle ${cycle}: Generated`, list);
        return list;
    }

    useImperativeHandle(ref, () => ({
        pause() {
            setIsPaused(true);
            console.log("Scrolling paused");
        },
        resume() {
            setIsPaused(false);
            console.log("Scrolling resumed");
        },
        regenerateEncounters() {
            // generate new encounter map
            const newEncounters = generateEncounters();
            encounters.current.push(...newEncounters);
            setIsPaused(false);
            console.log("New encounter map generated:", newEncounters);
        }
    }));

    useEffect(() => {
        encounters.current = generateEncounters();
        console.log("Generated encounters:", encounters.current);
    }, []);

    useEffect(() => {
        const element = bgRef.current;
        let frameId;

        const loop = () => {
            if (!isPaused && element){
                offsetRef.current += speed;
                const offset = offsetRef.current;
                element.style.backgroundPosition = `-${offset}px 0`;

                const updated = encounters.current.map((e) => ({
                    ...e,
                    x: e.position - offset
                }));
                setVisibleEncounters(updated);

                for (const e of encounters.current) {
                    if (!e.triggered && e.position - offset <= triggerX) {
                        e.triggered = true;
                        setIsPaused(true);
                        console.log("Encounter triggered:", e.type);
                        // Later: trigger encounters here.
                        if (onEncounter) onEncounter(e.type);
                        break;
                    }
                }
            }
            frameId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(frameId);
    }, [isPaused, onEncounter]);

    return (
        <div className="dungeon" ref={bgRef}>
            {/* Render moving encounter icons */}
            {visibleEncounters.map((e, index) => (
                <Encounters key={index} type={e.type} x={e.x} />
            ))}

            {/* Player fixed on screen */}
            <Player isPaused={isPaused} player={player}/>

            {/* Later: add <Player />, <Enemy />, <UI />, etc. */}
        </div>
    );
});

export default Dungeon;
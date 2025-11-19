import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import "../App.css";
import Encounters from "./Encounters";
import Player from "./Player";
import NodeBar from "./NodeBar";

const Dungeon = forwardRef(({ onEncounter, player, onCrossroadsChoice }, ref) => {
    const bgRef = useRef(null);
    const offsetRef = useRef(0);
    const [isPaused, setIsPaused] = useState(false);
    const [visibleEncounters, setVisibleEncounters] = useState([]);
    const encounters = useRef([]);
    const [encountersReady, setEncountersReady] = useState(false);
    const triggeredEncounterRef = useRef(null);
    const isResizingRef = useRef(false);
    const lockedVisibleRef = useRef([]);

    // modify for testing
    const speed = 50; // default: 4

    const generateEncounters = (cycle = 1) => {
        // modify for testing
        const encounterPool = [
            {type: "fountain", weight: 0.20}, // default: 0.20 
            {type: "bat1", weight: 0.40}, // default: 0.40
            {type: "bat2", weight: 0.10}, // default: 0.10
            {type: "crossroads", weight: 0.30}, // default: 0.30
        ];

        let placedFountain = false;

        const weightedRandom = () => {
            const r = Math.random();
            let acc = 0;

            // prevent fountain from being placed more than once per generation
            const availablePool = placedFountain
                ? encounterPool.filter(e => e.type !== "fountain")
                : encounterPool;

            const totalWeight = availablePool.reduce((sum, e) => sum + e.weight, 0);
            const normalizedRandom = r * totalWeight;

            for (const e of availablePool) {
                acc += e.weight;
                if (normalizedRandom <= acc) return e.type;
            }
            return "bat1";
        };

        const list = [];
        const currentOffset = offsetRef.current;
        let pos = currentOffset + 2000;

        let placedCrossroads = false;
        
        // three randomly generated encounters
        for (let i = 0; i < 3; i++) {
            pos +=  1200 + Math.random() * 2000;

            // crossroads mystery code
            if (placedCrossroads) {
                list.push({
                    position: pos,
                    type: "mystery",
                    triggered: false,
                    isMystery: true
                });
                placedCrossroads = false;
                continue;
            }

            let type = weightedRandom();

            // prevent crossroads from being the 3rd encounter
            if (i === 2 && type === "crossroads") {
                while (type === "crossroads") {
                    type = weightedRandom();
                }
            }
            
            if (type == "crossroads") placedCrossroads = true;
            if (type == "fountain") placedFountain = true;

            list.push({ position: pos, type, triggered: false });
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
            lockedVisibleRef.current = visibleEncounters;
            setIsPaused(true);
            console.log("Scrolling paused");
        },
        resume() {
            triggeredEncounterRef.current = null;
            setIsPaused(false);
            console.log("Scrolling resumed");
        },
        setMysteryType(chosenType) {
            for (const e of encounters.current) {
                if (e.isMystery) {
                    e.type = chosenType;
                    e.isMystery = false;
                    console.log("Mystery node set to:", chosenType);
                    break;
                }
            }
        },
        regenerateEncounters() {
            // generate new encounter map
            const newEncounters = generateEncounters();
            encounters.current.push(...newEncounters);
            setIsPaused(false);
            console.log("New encounter map generated:", newEncounters);
        },
        removeAethercrest() {
            const aethercrestIndex = encounters.current.findIndex(
                (e) => e.type !== "aethercrest" && e.triggered
            );
            if (aethercrestIndex !== -1) {
                encounters.current.splice(aethercrestIndex, 1)
            }
            console.log("Aethercrest removed.")
        }
    }));

    useEffect(() => {
        encounters.current = generateEncounters();
        console.log("Generated encounters:", encounters.current);

        requestAnimationFrame(() => setEncountersReady(true));
    }, []);

    useEffect(() => {
        const element = bgRef.current;
        let frameId;

        // let lastTime = performance.now();

        // const loop = (now) => {
        //     const dt = now - lastTime;
        //     lastTime = now;
        const loop = () => {
            if (!isPaused && element){
                // const SPEED = 150;
                // offsetRef.current += (SPEED * dt) / 1000;
                offsetRef.current += speed;
                const offset = offsetRef.current;
                element.style.backgroundPosition = `-${offset}px 0`;

                const updated = encounters.current
                    .map((e) => ({
                        ...e,
                        x: e.position - offset
                    }))
                    .filter((e) => {
                        if (isResizingRef.current) return false;
                        return e.x >= -200 && e.x <= window.innerWidth + 200;
                    })
                setVisibleEncounters(updated);

                const triggerX = window.innerWidth * 0.6;

                for (const e of encounters.current) {
                    if (!isResizingRef.current && !e.triggered && e.position - offset <= triggerX) {
                        e.triggered = true;
                        setIsPaused(true);
                        console.log("Encounter triggered:", e.type, "at position:", triggerX);
                        
                        // If crossroads, show available choices
                        if (e.type === "crossroads" && onCrossroadsChoice) {
                            const index = encounters.current.indexOf(e);
                            const next = encounters.current[index + 1];

                            if (next && next.isMystery) {
                                const options = [
                                    ["bat1", "bat2"],
                                    ["bat2", "bat1"],
                                    ["bat1", "fountain"],
                                    ["fountain", "bat1"],
                                    ["bat2", "fountain"],
                                    ["fountain", "bat2"],
                                ];

                                const pair = options[Math.floor(Math.random() * options.length)];
                                onCrossroadsChoice(pair);
                            }
                        }

                        // trigger encounters
                        if (onEncounter) onEncounter(e.type);
                        break;
                    }
                }
            }
            frameId = requestAnimationFrame(loop);
        };

        // requestAnimationFrame(loop);
        loop();
        return () => cancelAnimationFrame(frameId);
    }, [isPaused, onEncounter, onCrossroadsChoice]);

    useEffect(() => {
        let resizeTimeout;
        let oldWidth = window.innerWidth;

        const handleResize = () => {
            isResizingRef.current = true;
            const oldTriggerX = oldWidth * 0.6;

            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isPaused) { 
                    setVisibleEncounters(lockedVisibleRef.current);
                    isResizingRef.current = false; 
                    return; 
                }
                const newWidth = window.innerWidth;
                const newTriggerX = window.innerWidth * 0.6;

                const delta = newTriggerX - oldTriggerX;

                offsetRef.current -= delta;

                if (bgRef.current) {
                    bgRef.current.style.backgroundPosition = 
                        `-${offsetRef.current}px 0`;
                }

                setVisibleEncounters(
                    encounters.current
                        .map(e => ({ ...e, x: e.position - offsetRef.current }))
                        .filter(e => e.x >= -200 && e.x <= window.innerWidth + 200)
                );

                oldWidth = newWidth;
                isResizingRef.current = false;
            }, 80);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="dungeon" ref={bgRef}>
            {/* Render moving encounter icons */}
            {encountersReady && visibleEncounters.map((e, index) => (
                <Encounters key={index} type={e.type} x={e.x} />
            ))}

            {/* add <Player />, <Enemy />, <UI />, etc. */}

            {/* Player fixed on screen */}
            <Player isPaused={isPaused} player={player}/>

            {/* Node Bar */}
            <NodeBar 
                encounters={encounters.current}
                playerPos={offsetRef.current}
            />
        </div>
    );
});

export default Dungeon;
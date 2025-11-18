import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayerHealth } from '../context/PlayerHealth';

// Define canvas constants outside the component so they don't change on re-render
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MAX_HP = 20;
const PLAYER_SIZE = 20;

// You'll need to make sure this image file is accessible in your public folder
// or imported correctly if using the src folder structure.
const PLAYER_IMAGE_SRC = "determination.png";

// Initial player state
const initialPlayer = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT - 100,
  size: PLAYER_SIZE,
  speed: 5,
  hp: MAX_HP,
  maxHp: MAX_HP,
};

// export default function BulletHellGame({player}) {
export default function BulletHellGame() {
  const [player, setPlayer] = useState(initialPlayer);
  const [bullets, setBullets] = useState([]);
  const [keys, setKeys] = useState({});
  // const { hp, takeDamage, heal } = usePlayerHealth();
  // const MAX_HP = hp;

  // const initialPlayer = {
  //   x: CANVAS_WIDTH / 2,
  //   y: CANVAS_HEIGHT - 100,
  //   size: PLAYER_SIZE,
  //   speed: 5,
  //   hp: MAX_HP,
  //   maxHp: MAX_HP,
  // };

  // Refs for DOM elements and game loop IDs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const bulletIntervalRef = useRef(null);
  const playerImageRef = useRef(new Image()); // Ref to hold the Image object

  // --- Health Bar UI Logic (Uses React State directly) ---

  const hpPercent = (player.hp / player.maxHp) * 100;
  let hpBarColor = 'lime';
  if (hpPercent < 30) {
    hpBarColor = 'red';
  } else if (hpPercent < 60) {
    hpBarColor = 'orange';
  }

  // --- Game Loop Functions (Use useCallback for stability) ---

  const spawnBullet = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    
    // Use the functional update to ensure we have the latest bullets state
    setBullets(prevBullets => [
      ...prevBullets,
      {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 3,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: 5,
      },
    ]);
  }, []);

  // The main game update/draw loop
  const update = useCallback(() => {
    setPlayer(prevPlayer => {
      // Create a copy of the player state to modify
      let newPlayer = { ...prevPlayer };
      
      // 1. Movement (WASD)
      if (keys['A']) newPlayer.x -= newPlayer.speed;
      if (keys['D']) newPlayer.x += newPlayer.speed;
      if (keys['W']) newPlayer.y -= newPlayer.speed;
      if (keys['S']) newPlayer.y += newPlayer.speed;

      // 2. Boundaries
      newPlayer.x = Math.max(newPlayer.size, Math.min(CANVAS_WIDTH - newPlayer.size, newPlayer.x));
      newPlayer.y = Math.max(newPlayer.size, Math.min(CANVAS_HEIGHT - newPlayer.size, newPlayer.y));

      return newPlayer;
    });

    setBullets(prevBullets => {
      let newBullets = prevBullets.map(b => ({
        ...b,
        // 3. Move bullets
        x: b.x + b.dx,
        y: b.y + b.dy,
      }));

      let playerHit = false;

      // 4. Collision detection & HP check
      for (let i = 0; i < newBullets.length; i++) {
        const b = newBullets[i];
        const dx = b.x - player.x; // Use player from closure (should be current state)
        const dy = b.y - player.y;

        if (Math.sqrt(dx * dx + dy * dy) < b.size + player.size) {
          playerHit = true;
          // Remove the bullet from the screen by moving it off-canvas
          b.x = -999; 
          b.y = -999;
          break; // Process one hit per frame for simplicity
        }
      }

      // 5. Apply damage and check for game over
      if (playerHit) {
        setPlayer(prevPlayer => {
          let newHP = Math.max(0, prevPlayer.hp - 1);
          if (newHP === 0) {
            // Game Over logic
            clearInterval(bulletIntervalRef.current);
            cancelAnimationFrame(animationFrameRef.current);
            alert("You lost all health! Reloading...");
            document.location.reload(); 
          }
          return { ...prevPlayer, hp: newHP };
        });
      }

      // 6. Draw (Rendering)
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw player
      const playerImg = playerImageRef.current;
      if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x - 20, player.y - 20, 40, 40);
      } else {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw bullets
      ctx.fillStyle = "red";
      for (const b of newBullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      return newBullets;
    });

    animationFrameRef.current = requestAnimationFrame(update);
  }, [keys, player.x, player.y]); // Include player coords in dependency array

  // --- useEffect Hooks for Setup and Cleanup ---

  useEffect(() => {
    const playerImg = playerImageRef.current;
    playerImg.src = PLAYER_IMAGE_SRC;

    const handleKeyDown = (e) => {
      setKeys(prevKeys => ({ ...prevKeys, [e.key.toUpperCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prevKeys => ({ ...prevKeys, [e.key.toUpperCase()]: false }));
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Image load and game start logic
    playerImg.onload = () => {
      bulletIntervalRef.current = setInterval(spawnBullet, 100);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    
    // Cleanup function: remove event listeners and stop loops
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearInterval(bulletIntervalRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [spawnBullet, update]); // Dependencies: game loop functions

  // --- Rendered JSX (HTML Structure) ---
  
  return (
    <div className="game-container">
      <canvas 
        id="game" 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
      />

      <div id="hpContainer">
        <div id="hpText">HP {player.hp} / {player.maxHp}</div>
        <div id="hpBarBackground">
          <div 
            id="hpBar" 
            style={{ 
              width: `${hpPercent}%`, 
              backgroundColor: hpBarColor 
            }}
          ></div>
        </div>
      </div>

      {/* --- Styled-JSX or CSS Module equivalent for original styles --- */}
      <style jsx global>{`
        /* Global styles applied to the body */
        body {
          margin: 0;
          background: black;
          color: white;
          font-family: "Courier New", monospace;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
      `}</style>
      <style jsx>{`
        /* Component specific styles */
        canvas {
          background: #111;
          border: 2px solid white;
          display: block;
        }

        #hpContainer {
          margin-top: 20px;
          text-align: center;
          width: ${CANVAS_WIDTH}px;
        }

        #hpText {
          font-size: 20px;
          color: yellow;
          margin-bottom: 5px;
        }

        #hpBarBackground {
          width: 100%;
          height: 20px;
          background: #333;
          border: 2px solid white;
          border-radius: 5px;
        }

        #hpBar {
          height: 100%;
          width: 100%; /* Will be overridden by inline style */
          background: lime; /* Will be overridden by inline style */
          border-radius: 3px;
          transition: width 0.3s, background-color 0.3s;
        }
      `}</style>
    </div>
  );
}
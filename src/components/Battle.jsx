import React, { useEffect, useRef, useState } from "react";
import { usePlayerHealth } from "../context/PlayerHealth";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;

export default function Battle({
  duration = 10000,
  bulletDamage = 5,
  defendActive = false,
  playerClass = "",
  onEnd,
}) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const bullets = useRef([]);
  const player = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    speed: 2.5,
  });

  // ⭕ Read player HP ONCE only
  const { hp: globalHp, takeDamage } = usePlayerHealth();
  const startingHpRef = useRef(globalHp);

  // ⭕ Local battle HP that does NOT reset global HP
  const [tempHp, setTempHp] = useState(startingHpRef.current);

  // ⭐ Rogue slower bullets
  const isRogue = playerClass.toLowerCase() === "rogue";
  const bulletSpeedMultiplier = isRogue ? 0.6 : 1;

  const updatePlayer = () => {
    const p = player.current;
    if (keys.current["W"]) p.y -= p.speed;
    if (keys.current["S"]) p.y += p.speed;
    if (keys.current["A"]) p.x -= p.speed;
    if (keys.current["D"]) p.x += p.speed;

    p.x = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, p.x));
    p.y = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, p.y));
  };

  const spawnBullet = () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 2) * bulletSpeedMultiplier;

    bullets.current.push({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 3,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 8,
    });
  };

  const updateBullets = () => {
    const p = player.current;
    const dmgMultiplier = defendActive ? 0.5 : 1;

    bullets.current = bullets.current.filter((b) => {
      b.x += b.dx;
      b.y += b.dy;

      const dx = b.x - p.x;
      const dy = b.y - p.y;

      if (Math.sqrt(dx * dx + dy * dy) < b.size + PLAYER_SIZE) {
        const actualDamage = Math.floor(bulletDamage * dmgMultiplier);
        setTempHp((h) => Math.max(h - actualDamage, 0));
        return false;
      }

      return (
        b.x >= -50 &&
        b.x <= CANVAS_WIDTH + 50 &&
        b.y >= -50 &&
        b.y <= CANVAS_HEIGHT + 50
      );
    });
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Player
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(player.current.x, player.current.y, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Bullets
    ctx.fillStyle = "red";
    bullets.current.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const loop = () => {
    const ctx = canvasRef.current.getContext("2d");
    updatePlayer();
    updateBullets();
    draw(ctx);
    requestAnimationFrame(loop);
  };

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toUpperCase()] = true);
    const up = (e) => (keys.current[e.key.toUpperCase()] = false);

    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);

    requestAnimationFrame(loop);
    const interval = setInterval(spawnBullet, 120);

    // ⭕ FINAL FIX: use startingHpRef, NEVER globalHp
    const timer = setTimeout(() => {
      const damageTaken = startingHpRef.current - tempHp;

      // Apply final real damage
      takeDamage(Math.max(0, damageTaken));

      onEnd(Math.max(0, damageTaken));
    }, duration);

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []); // NEVER restart

  const hpPercent = (tempHp / startingHpRef.current) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "black",
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: "2px solid white", background: "#111" }}
      />

      {/* HP BAR */}
      <div style={{ width: CANVAS_WIDTH, marginTop: 20, textAlign: "center" }}>
        <div
          style={{
            marginBottom: 5,
            fontSize: 20,
            color: "white",
            fontFamily: "Retro Gaming",
          }}
        >
          HP {tempHp} / {startingHpRef.current}
        </div>

        <div
          style={{
            background: "#333",
            height: 20,
            border: "2px solid white",
            borderRadius: 5,
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background:
                hpPercent < 30 ? "red" : hpPercent < 60 ? "orange" : "#304d6d",
              borderRadius: 3,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

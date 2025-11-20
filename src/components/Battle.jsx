import React, { useEffect, useRef, useState } from "react";
import { usePlayerHealth } from "../context/PlayerHealth";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 430;
const PLAYER_SIZE = 20;

export default function Battle({
  duration = 10000,
  bulletDamage = 5,
  defendActive = false,
  playerClass = "",
  enemyType = "bat1",
  onEnd,
}) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const bullets = useRef([]);
  const player = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    speed: 5,
  });

  const spawnOrigin = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 3,
    t: 0,
  })

  const playerImg = useRef(new Image());
  const bulletImg = useRef(new Image());

  useEffect(() => {
    playerImg.current.onload = () => console.log("player loaded", playerImg.current.width, playerImg.current.height);
    bulletImg.current.onload = () => console.log("bullet loaded", bulletImg.current.width, bulletImg.current.height);

    playerImg.current.src = `/effect/${playerClass.toLowerCase()}-icon.png`;
    bulletImg.current.src = "/effect/bullet.png";
  }, [playerClass]);

  const { hp: globalHp, takeDamage } = usePlayerHealth();
  const [tempHp, setTempHp] = useState(globalHp);

  // ⭐ Rogue slower bullets
  const isRogue = playerClass.toLowerCase() === "rogue";
  const bulletSpeedMultiplier = isRogue ? 0.6 : 1;
  const spawnRate = isRogue ? 160 : 120
  const wiggle = isRogue ? 100 : 50

  const isBat2 = enemyType === "bat2";
  const enemySpeedMultiplier = isBat2 ? 2.2 : 1.8;
  const enemyPattern = isBat2 ? 300 : 30;
  const finalBulletSpeedMultiplier = bulletSpeedMultiplier * enemySpeedMultiplier;

  const updatePlayer = (dt) => {
    const p = player.current;
    const speed = p.speed * dt;

    if (keys.current["W"]) p.y -= speed;
    if (keys.current["S"]) p.y += speed;
    if (keys.current["A"]) p.x -= speed;
    if (keys.current["D"]) p.x += speed;

    p.x = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, p.x));
    p.y = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, p.y));
  };

  const spawnBullet = () => {
    const p = player.current;
    const origin = spawnOrigin.current;

    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    const distance = Math.hypot(dx, dy);

    // Normalize direction + apply speed multipliers
    const speed = 3 * finalBulletSpeedMultiplier;
    const angle = Math.atan2(dy, dx);

    bullets.current.push({
      x: origin.x,
      y: origin.y,
      dx: (dx / distance) * speed,
      dy: (dy / distance) * speed,
      angle,
      size: 8,
    });
  };

  const updateBullets = (dt) => {
    const p = player.current;
    const dmgMultiplier = defendActive ? 0.5 : 1;

    bullets.current = bullets.current.filter((b) => {
      b.x += b.dx * dt;
      b.y += b.dy * dt;

      const dx = b.x - p.x;
      const dy = b.y - p.y;

      if (Math.sqrt(dx * dx + dy * dy) < b.size + PLAYER_SIZE) {
        const actualDamage = Math.floor(bulletDamage * dmgMultiplier);
        takeDamage(actualDamage)
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

  const updateSpawn = (dt) => {
    // Attack Pattern
    spawnOrigin.current.t += 0.03 * dt;
    spawnOrigin.current.x =
      CANVAS_WIDTH / 2 + Math.sin(spawnOrigin.current.t) * 400;

    spawnOrigin.current.y =
      CANVAS_HEIGHT / 8 + Math.sin(spawnOrigin.current.t * wiggle) * enemyPattern;
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const bulletScale = 0.4;
    const playerScale = 0.4;

    // Player
    const p = player.current;
    const pw = playerImg.current.width;
    const ph = playerImg.current.height;

    ctx.drawImage(
      playerImg.current,
      p.x - (pw * playerScale) / 2,
      p.y - (ph * playerScale) / 2,
      pw * playerScale,
      ph * playerScale
    );

    // Bullets
    const bw = bulletImg.current.width;
    const bh = bulletImg.current.height;
    const BULLET_ROTATION_OFFSET = -Math.PI / 2;

    bullets.current.forEach((b) => {
      ctx.save();

      // Move pivot to bullet position
      ctx.translate(b.x, b.y);

      // Rotate to stored direction
      ctx.rotate(b.angle + BULLET_ROTATION_OFFSET);

      // Draw centered at pivot

    ctx.drawImage(
      bulletImg.current,
      -(bw * bulletScale) / 2,
      -(bh * bulletScale) / 2,
      bw * bulletScale,
      bh * bulletScale
    );

      ctx.restore();
    });
  };

  let lastTime = performance.now();

  const loop = (time) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const dt = (time - lastTime) / 16.67;
    lastTime = time;

    updatePlayer(dt);
    updateBullets(dt);
    updateSpawn(dt);
    draw(ctx);
    requestAnimationFrame(loop);
  };

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toUpperCase()] = true);
    const up = (e) => (keys.current[e.key.toUpperCase()] = false);

    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);

    requestAnimationFrame(loop);
    const interval = setInterval(spawnBullet, spawnRate);

    // ⭕ FINAL FIX: use globalHP
    const timer = setTimeout(() => {
      onEnd(0);
    }, duration);

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []); // NEVER restart

  const hpPercent = (tempHp / 100) * 100;

  useEffect(() => {
    if (globalHp <= 0) {
      onEnd(0);
    }
  }, [globalHp]);

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
          HP {tempHp} / 100
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

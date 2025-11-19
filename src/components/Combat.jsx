import React, { useState, useEffect, useRef } from "react";
import Battle from "./Battle";

export default function Combat({ player, enemyType, onExitCombat }) {

  // -------------------- MUSIC --------------------
  const bgmRef = useRef(null);

  const bat1Music = "/music/Bat.m4a";
  const bat2Music = "/music/StrongerBat.m4a";

  const swapMusic = (src) => {
    if (!bgmRef.current) return;
    if (bgmRef.current.src.includes(src)) return;
    bgmRef.current.src = src;
    bgmRef.current.load();
    bgmRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (enemyType === "bat1") swapMusic(bat1Music);
    if (enemyType === "bat2") swapMusic(bat2Music);
  }, [enemyType]);

  useEffect(() => {
    const startMusic = () => {
      if (bgmRef.current) {
        bgmRef.current.volume = 0.5;
        bgmRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", startMusic);
    };
    window.addEventListener("click", startMusic);

    return () => window.removeEventListener("click", startMusic);
  }, []);

  const exitCombatAndStopMusic = () => {
    if (bgmRef.current) bgmRef.current.pause();
    onExitCombat();
  };

  // -------------------- COMBAT LOGIC --------------------
  const [playerHp, setPlayerHp] = useState(player.HP || 100);
  const [enemyHp, setEnemyHp] = useState(enemyType === "bat1" ? 200 : 300);
  const [phase, setPhase] = useState("playerTurn");
  const [showFightMenu, setShowFightMenu] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);

  const playerSprite = `/characters/${player.name.toLowerCase()}_combat.png`;
  const enemySprite =
    enemyType === "bat1" ? "/enemy/bat/bat1.png" : "/enemy/bat/bat2.png";

  const startBattleHell = () => setPhase("bulletHell");

  const performAttack = (type) => {
    let dmg = 0;
    const atk = player.baseStats?.ATK || 30;

    if (type === "normal") dmg = Math.floor(atk / 2);
    else if (type === "strong" && Math.random() < 0.5) dmg = atk;

    // POW effect → delay bullet hell
    if (dmg > 0) {
      setShowHitEffect(true);

      setTimeout(() => {
        setShowHitEffect(false);
        setEnemyHp((hp) => Math.max(hp - dmg, 0));
        setPhase("enemyPhase");
        setShowFightMenu(false);
        startBattleHell(); // ⭐ NOW starts AFTER POW
      }, 850);

    } else {
      // Missed hit → no POW → instant bullet hell
      setEnemyHp((hp) => Math.max(hp - dmg, 0));
      setPhase("enemyPhase");
      setShowFightMenu(false);
      startBattleHell();
    }
  };

  useEffect(() => {
    if (enemyHp <= 0) exitCombatAndStopMusic();
  }, [enemyHp]);

  useEffect(() => {
    if (playerHp <= 0) {
      alert("YOU DIED!");
      exitCombatAndStopMusic();
    }
  }, [playerHp]);

  const endBattleHell = (damageTaken) => {
    setPlayerHp((hp) => Math.max(hp - damageTaken, 0));
    setPhase("playerTurn");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/background/combat-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        fontFamily: "Retro Gaming",
        position: "relative",
      }}
    >
      <audio ref={bgmRef} loop />

      {/* Player HP */}
      <div style={{ position: "absolute", bottom: 20, left: 20, textShadow: "0 0 10px black" }}>
        <h2>Player HP: {playerHp}</h2>
      </div>

      {/* Enemy HP */}
      <div style={{ position: "absolute", top: 20, right: 20, textShadow: "0 0 10px black" }}>
        <h2>Enemy HP: {enemyHp}</h2>
      </div>

      {/* Player Sprite */}
      <img
        src={playerSprite}
        style={{
          position: "absolute",
          bottom: 80,
          left: 40,
          width: 700,
          imageRendering: "pixelated",
          filter: "drop-shadow(0px 0px 25px black)",
          animation: "playerIdle 3s ease-in-out infinite",
        }}
      />

      {/* Enemy Sprite */}
      <img
        src={enemySprite}
        style={{
          position: "absolute",
          top: 80,
          right: 40,
          width: 500,
          imageRendering: "pixelated",
          filter: "drop-shadow(0px 0px 25px black)",
          animation: "batFloat 2.5s ease-in-out infinite",
        }}
      />

      {/* POW HIT EFFECT */}
      {showHitEffect && (
        <img
          src="/effect/AttackLanding.png"
          style={{
            position: "absolute",
            top: 180,
            right: 200,
            height: 250,
            imageRendering: "pixelated",
            pointerEvents: "none",
            filter: "drop-shadow(0 0 15px white)",
            animation: "hitPop 0.3s ease-out",
          }}
        />
      )}

      {/* --------------------------- PLAYER TURN ----------------------------- */}
      {phase === "playerTurn" && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 1000,
            display: "flex",
            gap: "20px",
            filter: "drop-shadow(0px 0px 25px black)",
          }}
        >
          <button
            onClick={() => setShowFightMenu(true)}
            style={{
              color: "black",
              background: "white",
              border: "2px solid white",
              padding: "10px 20px",
              fontSize: "35px",
              fontFamily: "Retro Gaming",
              cursor: "pointer",
            }}
          >
            FIGHT
          </button>

          <button
            style={{
              color: "black",
              background: "white",
              border: "2px solid white",
              padding: "10px 20px",
              fontSize: "35px",
              fontFamily: "Retro Gaming",
              cursor: "pointer",
            }}
          >
            DEFEND
          </button>
        </div>
      )}

      {/* Fight Menu */}
      {showFightMenu && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            left: 1015,
            border: "2px solid white",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "rgba(0,0,0,.7)",
            padding: 20,
          }}
        >
          <button onClick={() => performAttack("normal")}>
            Normal Attack (100% hit, half dmg)
          </button>

          <button onClick={() => performAttack("strong")}>
            Strong Attack (50% hit, full dmg)
          </button>

          <button onClick={() => setShowFightMenu(false)}>Cancel</button>
        </div>
      )}

      {/* --------------------------- BULLET HELL ----------------------------- */}
      {phase === "bulletHell" && (
        <Battle
          duration={10000}
          onEnd={(damageTaken) => endBattleHell(damageTaken)}
        />
      )}
    </div>
  );
}

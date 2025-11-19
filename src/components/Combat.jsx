import React, { useState, useEffect, useRef } from "react";
import Battle from "./Battle";
import { usePlayerHealth } from "../context/PlayerHealth";


export default function Combat({ player, enemyType, onExitCombat }) {
  const bgmRef = useRef(null);
  const { hp: playerHp, takeDamage, heal } = usePlayerHealth();
  const [enemyHp, setEnemyHp] = useState(enemyType === "bat1" ? 200 : 300);
  const [phase, setPhase] = useState("playerTurn");
  const [showFightMenu, setShowFightMenu] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [defendNextRound, setDefendNextRound] = useState(false);

  // 🎵 Music
  const bat1Music = "/music/Bat.m4a";
  const bat2Music = "/music/StrongerBat.m4a";
  useEffect(() => {
    const src = enemyType === "bat1" ? bat1Music : bat2Music;
    if (bgmRef.current) {
      bgmRef.current.src = src;
      bgmRef.current.volume = 0.5;
      bgmRef.current.play().catch(() => {});
    }
  }, [enemyType]);
  const stopMusic = () => bgmRef.current && bgmRef.current.pause();

  // 🪓 Attack Logic
  const performAttack = (type) => {
    let dmg = 0;
    const atk = player.baseStats?.ATK || 30;
    if (type === "normal") dmg = Math.floor(atk / 2);
    else if (type === "strong" && Math.random() < 0.5) dmg = atk;

    if (dmg > 0) {
      setShowHitEffect(true);
      setTimeout(() => {
        setShowHitEffect(false);
        setEnemyHp((hp) => Math.max(hp - dmg, 0));
        setShowFightMenu(false);
        setPhase("enemyPhase");
        startBattleHell();
      }, 850);
    } else {
      setShowFightMenu(false);
      setPhase("enemyPhase");
      startBattleHell();
    }
  };

  useEffect(() => {
    if (enemyHp <= 0) {
      stopMusic();
      onExitCombat();
    }
  }, [enemyHp]);

  useEffect(() => {
    if (playerHp <= 0) {
      stopMusic();
      alert("YOU DIED!");
      onExitCombat();
    }
  }, [playerHp]);

  const startBattleHell = () => setPhase("bulletHell");

  const endBattleHell = (damageTaken) => {
    setPlayerHp((hp) => Math.max(hp - damageTaken, 0));
    setDefendNextRound(false);
    setPhase("playerTurn");
  };

  const bulletDamage = enemyType === "bat1" ? 5 : 10;

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

      <div style={{ position: "absolute", bottom: 20, left: 20 }}>
        <h2>Player HP: {playerHp}</h2>
      </div>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <h2>Enemy HP: {enemyHp}</h2>
      </div>

      <img
        src={`/characters/${player.name.toLowerCase()}_combat.png`}
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
      <img
        src={
          enemyType === "bat1"
            ? "/enemy/bat/bat1.png"
            : "/enemy/bat/bat2.png"
        }
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

      {showHitEffect && (
        <img
          src="/effect/AttackLanding.png"
          style={{
            position: "absolute",
            top: 180,
            right: 200,
            height: 250,
            imageRendering: "pixelated",
            animation: "hitPop 0.3s ease-out",
          }}
        />
      )}

      {/* Player Turn */}
      {phase === "playerTurn" && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 1000,
            display: "flex",
            gap: "20px",
          }}
        >
          <button
            onClick={() => setShowFightMenu(true)}
            style={buttonStyle}
          >
            FIGHT
          </button>
          <button
            onClick={() => {
              setDefendNextRound(true);
              setPhase("enemyPhase");
              startBattleHell();
            }}
            style={buttonStyle}
          >
            DEFEND
          </button>
        </div>
      )}

      {/* Fight Menu */}
      {showFightMenu && (
        <div style={fightMenuStyle}>
          <button onClick={() => performAttack("normal")}>
            Normal Attack
          </button>
          <button onClick={() => performAttack("strong")}>
            Strong Attack
          </button>
          <button onClick={() => setShowFightMenu(false)}>Cancel</button>
        </div>
      )}

      {/* Bullet Hell */}
      {phase === "bulletHell" && (
        <Battle
          duration={10000}
          bulletDamage={bulletDamage}
          defendActive={defendNextRound}
          playerClass={player.name} 
          onEnd={endBattleHell}
        />
      )}
    </div>
  );
}

const buttonStyle = {
  color: "black",
  background: "white",
  border: "2px solid white",
  padding: "10px 20px",
  fontSize: "35px",
  fontFamily: "Retro Gaming",
  cursor: "pointer",
};

const fightMenuStyle = {
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
};

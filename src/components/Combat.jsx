import React, { useState, useEffect, useRef } from "react";
import Battle from "./Battle";
import { usePlayerHealth } from "../context/PlayerHealth";
import { usePlayerStats } from "../context/PlayerStats";
import { stopAllMusic } from "./Game";

export default function Combat({ player, enemyType, onExitCombat }) {
  const bgmRef = useRef(null);

  // 🌟 REAL HP SYSTEM FROM CONTEXT
  const { hp: playerHp, takeDamage } = usePlayerHealth();

  // Stats System from context
  const { stats } = usePlayerStats();

  const [enemyHp, setEnemyHp] = useState(enemyType === "bat1" ? 200 : 300);
  const [phase, setPhase] = useState("playerTurn");
  const [showFightMenu, setShowFightMenu] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [showMissEffect, setShowMissEffect] = useState(false);
  const [defendNextRound, setDefendNextRound] = useState(false);
  const [bonusDamage, setBonusDamage] = useState(0);
  const [bonusCritChance, setBonusCritChance] = useState(0);

  // ⭐ Battle Instance Key so React does NOT remount Battle repeatedly
  const [battleKey, setBattleKey] = useState(0);

  // 🎵 Music
  const bat1Music = "/music/Bat.m4a";
  const bat2Music = "/music/StrongerBat.m4a";

  useEffect(() => {
    stopAllMusic();

    const src = enemyType === "bat1" ? bat1Music : bat2Music;
    if (bgmRef.current) {
      bgmRef.current.src = src;
      bgmRef.current.volume = 0.5;
      bgmRef.current.play().catch(() => {});
    }
  }, [enemyType]);

  const stopMusic = () => {
    if (bgmRef.current) bgmRef.current.pause();
  };

  // 🪓 Attack Logic
  const performAttack = (type) => {
    let dmg = 0;
    const atk = stats.ATK || 30;

    let critChance = 0.30 + bonusCritChance / 100;
    let baseDamage = atk + bonusDamage;

    if (type === "normal") dmg = baseDamage;
    else if (type === "strong" && Math.random() < critChance) dmg = Math.floor(baseDamage * 2);

    if (dmg > 0) {
      setShowHitEffect(true);

      setTimeout(() => {
        setShowHitEffect(false);
        setEnemyHp((hp) => Math.max(hp - dmg, 0));
        setShowFightMenu(false);
        startBattleHell();
      }, 850);
    } else {
      setShowMissEffect(true);

      setTimeout(() => {
        setShowMissEffect(false);
        setShowFightMenu(false);
        startBattleHell();
      }, 850);
    }
  };

  // 🩸 Enemy dies
  useEffect(() => {
    if (enemyHp <= 0) {
      setBonusDamage(0);
      setBonusCritChance(0);
      setDefendNextRound(false);

      stopMusic();
      onExitCombat();
    }
  }, [enemyHp]);

  // 💀 Player dies
  useEffect(() => {
    if (playerHp <= 0) {
      stopMusic();
      onExitCombat();
    }
  }, [playerHp]);

  const startBattleHell = () => {
    setFadeCombat(true);

    setTimeout(() => {
      setPhase("bulletHell");
      setBattleKey(k => k + 1);
      setFadeCombat(false);
    }, 500);
    // // Move to bullet hell
    // setPhase("bulletHell");

    // // Generate a NEW key so Battle mounts ONCE
    // setBattleKey((prev) => prev + 1);
  };

  // 🟦 Battle ends → apply real damage + return to player turn
  const endBattleHell = () => {
    setFadeCombat(true);

    setTimeout(() => {
      setPhase("playerTurn");
      setFadeCombat(false); 
    }, 500);
    // const mitigated = Math.max(1, damageTaken - Math.floor(stats.DEF / 5));
    // takeDamage(mitigated);
    // setDefendNextRound(false);
    // setPhase("playerTurn");
  };

  const bulletDamage = enemyType === "bat1" ? 5 : 10;
  const finalBulletDamage = Math.max(1, bulletDamage - Math.floor(stats.DEF / 10));

  // read if bullet hell
  const isBulletHell = phase === "bulletHell";

  const [fadeCombat, setFadeCombat] = useState(false)

  return (
    <div className={`fade-wrapper ${fadeCombat ? "fade-out" : "fade-in"}`}>
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
        <div style={{
          position: "absolute",
          bottom: 20,
          left: 130, 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", 
          gap: "30px",
          animation: "playerIdle 3s ease-in-out infinite",
          textShadow: "2px 2px 4px black",
        }}>
          <h2>❤️{playerHp}</h2>
          <h2>🗡️{stats.ATK}</h2>
          <h2>👟{stats.SPD}</h2>
          <h2>🛡️{stats.DEF}</h2>
          {bonusDamage > 0 && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 45,
            color: "yellow",
            fontSize: "15px",
            fontFamily: "Retro Gaming",
          }}>
            DEFENSE BUFF: +{bonusDamage} DMG, +{bonusCritChance}% Crit
          </div>
        )}
        </div>

        {/* Enemy HP */}
        <div style={{
          position: "absolute",
          top: 30,
          right: 260,
          animation: "batFloat 2.5s ease-in-out infinite",
          textShadow: "2px 2px 4px black",
        }}>
          <h2>💜{enemyHp}</h2>
        </div>

        {/* Player Sprite */}
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

            opacity: isBulletHell ? 0.1 : 1,
            transition: "transform 0.5s ease, opacity 0.5s ease",
          }}
        />

        {/* Enemy Sprite */}
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

            opacity: isBulletHell ? 0.1 : 1,
            transition: "transform 0.5s ease, opacity 0.5s ease",
          }}
        />

        {/* POW HIT EFFECT */}
        {showHitEffect && (
          <img
            src="/effect/AttackLanding.png"
            style={{
              position: "absolute",
              top: 130,
              right: 230,
              height: 250,
              imageRendering: "pixelated",
              animation: "hitPop 0.3s ease-out forwards",
            }}
          />
        )}
        {showMissEffect && (
          <img
            src="/effect/AttackMissing.png"
            style={{
              position: "absolute",
              top: 130,
              right: 230,
              height: 250,
              imageRendering: "pixelated",
              animation: "missPop 0.3s ease-out forwards",
            }}
          />
        )}

        {/* Player Turn UI */}
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

                setBonusDamage(prev => prev + 10);
                setBonusCritChance(prev => prev + 5);

                setShowFightMenu(false);
                startBattleHell();
              }}
              style={buttonStyle}
            >
              DEFEND
              <div style={{ fontSize: "12px", color: "#304d6d" }}>
                +10 DMG, +5% Crit
              </div>
            </button>
          </div>
        )}

        {/* Fight Menu */}
        {showFightMenu && (
          <div style={fightMenuStyle}>
            <button onClick={() => performAttack("normal")}>
              Normal Attack
              <br/>
              <span style={{ fontSize: "12px", color: "lightblue" }}>
                DMG: {stats.ATK + bonusDamage}
              </span>
            </button>
            <button onClick={() => performAttack("strong")}>
              Strong Attack
              <br />
              <span style={{ fontSize: "12px", color: "lightblue" }}>
                Crit Chance: {30 + bonusCritChance}%  
                <br />
                DMG: {(stats.ATK + bonusDamage) * 2}
              </span>
            </button>
            <button onClick={() => setShowFightMenu(false)}>Cancel</button>
          </div>
        )}

        {/* Bullet Hell */}
        {phase === "bulletHell" && (
          <Battle
            key={battleKey}              // ← Makes sure timer runs EXACTLY 10 seconds
            duration={10000}
            bulletDamage={finalBulletDamage}
            defendActive={defendNextRound}
            playerClass={player.name}
            enemyType={enemyType}
            onEnd={endBattleHell}
          />
        )}
      </div>
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
  boxShadow: "2px 2px 4px black",
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

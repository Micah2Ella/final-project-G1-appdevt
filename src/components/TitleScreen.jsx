import React, { useEffect, useRef } from "react";

export default function TitleScreen({ onStart, onControls }) {
  const bgmRef = useRef(null);

  // AUTOPLAY FIX — browser requires user interaction first
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

  // Load the music once when component mounts
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.src = "/music/Title.m4a";
      bgmRef.current.load();
    }
  }, []);

  return (
    <div className="title-screen">
      {/* 🔊 MUSIC */}
      <audio ref={bgmRef} loop />

      <div className="Title">
        <h1>Aethercrest</h1>

        <button onClick={onStart}>START GAME</button><br />
        <button onClick={onControls}>CONTROLS</button>
      </div>

      <div className="Image">
        <img src="background/TitleScreenBG.png" />
      </div>

      <style jsx>{`
        .title-screen {
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          justify-content: center;
          align-items: center;
          background: black;
          color: white;
        }

        .title-screen img {
          width: 90%;
          height: 90%;
          object-fit: cover;
          justify-content: center;
          align-items: center;
        }

        .Title {
          z-index: 2;
          margin-left: 5%;
        }

        h1 {
          font-size: 5em;
          margin-bottom: 40px;
          letter-spacing: 2px;
          font-family: "Mleitod";
          text-shadow: 5px 5px 15px rgba(0, 0, 0, 1);
        }

        button {
          background: transparent;
          border: none;
          padding: 15px 40px;
          font-size: 1.8em;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s ease;
          color: white;
          font-family: "Retro Gaming";
          text-shadow: 5px 5px 15px rgba(0, 0, 0, 1);
        }

        button:hover {
          background: transparent;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

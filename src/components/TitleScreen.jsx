import React, { useEffect, useRef } from "react";
import AudioManager from "./AudioManager";

export default function TitleScreen({ onStart, onControls }) {
  return (
    <div className="title-screen">
      <div className="Title">
        <h1>Aethercrest</h1>

        <button
          onClick={() => {
            AudioManager.unlock();
            AudioManager.play("/music/Title.m4a");
            onStart();
          }}
        >
          START GAME
        </button>
        <br />
        <button onClick={() => { 
          AudioManager.unlock();
          AudioManager.play("/music/Title.m4a");
          onControls();
        }}>
        CONTROLS</button>
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

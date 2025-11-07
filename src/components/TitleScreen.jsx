import React from "react";

export default function TitleScreen({ onStart }) {
  return (
    <div className="title-screen">
      <h1>Aethercrest</h1>
      <button onClick={onStart}>Start Game</button>

      <style jsx>{`
        .title-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0a0a0a, #1e1e1e);
          color: white;
          font-family: "Poppins", sans-serif;
        }

        h1 {
          font-size: 3em;
          margin-bottom: 40px;
          letter-spacing: 2px;
        }

        button {
          background: #304D6d;
          border: none;
          padding: 15px 40px;
          font-size: 1.2em;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s ease;
        }

        button:hover {
          background: #4c6f94ff;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

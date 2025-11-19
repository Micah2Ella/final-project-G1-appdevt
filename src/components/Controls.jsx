import React from "react";

export default function Controls({ onBack }) {
  return (
    <div className="control">
      <h1>Controls</h1>

      <div className="arrow">
        <img src="/arrowKeys/wKey.PNG" /><p>Move Up</p>
      </div>

      <div className="arrow">
        <img src="/arrowKeys/aKey.PNG" /><p>Move Left</p>
      </div>

      <div className="arrow">
        <img src="/arrowKeys/sKey.PNG" /><p>Move Down</p>
      </div>

      <div className="arrow">
        <img src="/arrowKeys/dKey.PNG" /><p>Move Right</p>
      </div>
      
      <button onClick={onBack}>BACK</button>

      <style jsx>{`
        .arrow {
          display: flex;
          align-items: center;
          gap: 10px; /* only small spacing */
          margin: -100px 0;
        }

        .control {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-image: url("/background/CharSelectBG.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: white;
        }

        h1 {
          font-size: 5em;
          margin-bottom: 10px;
          letter-spacing: 2px;
          font-family: "Mleitod";
          text-shadow: 5px 5px 15px rgba(0, 0, 0, 1);
        }

        p {
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
          line-height: 0px;
        }

        img {
        height: 25%;
        }

      `}</style>
    </div>
  );
}

import React, { useState } from "react";

export default function CharacterSelect({ onSelect }) {
  const [selectedChar, setSelectedChar] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [shake, setShake] = useState(false);

  const MAX_CHAR_LIMIT = 7; // Define the maximum character limit

  const characters = [
    {
      name: "Barbarian",
      description:
        "A burnt out clown who smashes things to blow off some steam.",
      baseStats: { HP: 100, ATK: 50, SPD: 10, DEF: 20 },
    },
    {
      name: "Rogue",
      description:
        "An inferno fueled by the passion of youth. The rogue blazes their way through the dungeons in the hunt for gold.",
      baseStats: { HP: 100, ATK: 20, SPD: 50, DEF: 10 },
    },
  ];

  const handleSelect = (char) => setSelectedChar(char);

  const handleNameChange = (e) => {
    const rawNewName = e.target.value;
    
    // 1. Enforce the 7-character limit and trigger shake
    if (rawNewName.length > MAX_CHAR_LIMIT) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return; // Stop processing and don't update the state
    }

    // 2. Convert the input to uppercase for that retro style
    const capitalizedName = rawNewName.toUpperCase();

    // 3. Update the state with the capitalized name
    setPlayerName(capitalizedName);
  };

  const handleConfirm = () => {
    // Check for empty name before confirming
    if (playerName.trim() === "") {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSelect({ ...selectedChar, playerName });
  };

  return (
    <div className="character-select">
      <h1>Select Your Character</h1>

      <div className="character-grid">
        {characters.map((char) => (
          <div
            key={char.name}
            className="character-card"
            onClick={() => handleSelect(char)}
          >
            {/* Image hover swap */}
            <div className="char-image-wrapper">
              <img
                src={`/characters/char-select/${char.name.toLowerCase()}-select.png`}
                alt={char.name}
                className="default"
              />
              <img
                src={`/characters/char-select/${char.name.toLowerCase()}-hover.png`}
                alt={`${char.name} hover`}
                className="hover"
              />
            </div>

            <div className="hover-info">
              <div className="overlay">
                <h2>{char.name}</h2>
                <p>{char.description}</p>
                <div className="stats">
                  <div>ATK: {char.baseStats.ATK}</div>
                  <div>SPD: {char.baseStats.SPD}</div>
                  <div>DEF: {char.baseStats.DEF}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedChar && (
        <div className="popup">
          <div className={`popup-content ${shake ? "shake" : ""}`}>
            <h2>{selectedChar.name}</h2>
            <p>
              Enter your name, brave adventurer (Max: {MAX_CHAR_LIMIT} chars):
            </p>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange} // Using the updated handler
              placeholder="YOUR NAME"
              maxLength={MAX_CHAR_LIMIT} 
            />
            <div className="popup-buttons">
              <button onClick={handleConfirm}>Confirm</button>
              <button onClick={() => setSelectedChar(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .character-select {
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-image: url("/background/CharSelectBG.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: white;
          font-family: "Retro Gaming";
          position: relative;
        }

        h1 {
          margin-bottom: 40px;
          letter-spacing: 1px;
        }

        .character-grid {
          display: flex;
          gap: 40px;
        }

        .character-card {
          background: transparent;
          border-radius: 12px;
          height: 70vh;
          width: 45vh;
          cursor: pointer;
          transition: 0.2s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .character-card:hover {
          cursor: url("/cursor/Hand3.png"), pointer;
        }

        .char-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .char-image-wrapper img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 12px;
          transition: transform 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
        }

        .char-image-wrapper img.hover {
          opacity: 0;
        }

        .character-card:hover .char-image-wrapper img.default {
          opacity: 0;
          transform: scale(1.05);
          filter: brightness(0.8);
        }

        .character-card:hover .char-image-wrapper img.hover {
          opacity: 1;
          transform: scale(1.05);
          filter: brightness(0.8);
        }

        .hover-info {
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
        }

        .character-card:hover .hover-info {
          opacity: 1;
          transform: translateY(0);
        }

        .overlay {
          background: rgba(0, 0, 0, 0.6);
          padding: 20px;
          border-radius: 0 0 12px 12px;
        }

        .overlay h2 {
          margin-bottom: 10px;
          color: #4c6f94ff;
        }

        .overlay p {
          font-size: 0.9em;
          color: #bbb;
          margin-bottom: 15px;
        }

        .stats {
          display: flex;
          justify-content: center;
          gap: 5px;
          font-size: 0.9em;
          color: #ccc;
        }

        .stats div {
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 12px;
          border-radius: 6px;
        }

        .popup {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.3s ease;
        }

        .popup-content {
          background: #1b1b1b;
          padding: 10px 50px 30px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #304d6d;
          transition: transform 0.2s ease;
          font-family: "Retro Gaming";
        }

        .popup-content h2 {
          color: #4c6f94ff;
          margin-bottom: 10px;
        }

        input {
          margin-top: 10px;
          padding: 10px;
          font-size: 1em;
          border-radius: 6px;
          border: none;
          width: 80%;
          text-align: center;
          font-family: "Retro Gaming";
        }

        .popup-buttons {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .popup-buttons button {
          background: #304d6d;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s ease;
          font-family: "Retro Gaming";
        }

        .popup-buttons button:hover {
          background: #4c6f94ff;
          transform: scale(1.05);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
          75% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .shake {
          animation: shake 0.3s ease;
        }
      `}</style>
    </div>
  );
}
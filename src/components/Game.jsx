export default function Game({ player }) {
  return (
    <div
      style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1>Welcome, {player.playerName}!</h1>
      <h2>You chose: {player.name}</h2>
      <p>HP: {player.baseStats.HP} | ATK: {player.baseStats.ATK} | SPD: {player.baseStats.SPD} | DEF: {player.baseStats.DEF}</p>
    </div>
  );
}

const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
console.log(dbPath);
let db = null;

const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database connected successfully!");
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001");
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initialDBAndServer();

//Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  const ans = (playersArray) => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    };
  };
  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
});

//Creates a new player in the team (database). `player_id` is auto-incremented
app.post("/players/", async (request, response) => {
  const playersList = request.body;
  const { playerName, jerseyNumber, role } = playersList;
  const createNewPlayer = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (${playerName},${jerseyNumber},${role});`;
  const dbResponse = await db.run(createNewPlayer);
  console.log(dbResponse);
  const playerId = dbResponse.lastID;
  console.log(playerId);
  response.send({ playerId: playerId });
});

module.exports = app;

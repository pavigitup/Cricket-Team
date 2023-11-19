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
   INSERT INTO
      cricket_team (player_name, jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
         
      );`;
  const dbResponse = await db.run(createNewPlayer);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;

  const getPlayer = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  const ansPlayer = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  };
  response.send(ansPlayer(player));
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const player1Id = request.params.playerId;
  const updateDetails = request.body;
  const { playerName, jerseyNumber, role } = updateDetails;
  const updateTables = `
    UPDATE cricket_team
    SET 
      player_name= '${playerName}',
      jersey_number= ${jerseyNumber},
      role= '${role}'
    WHERE player_id = ${player1Id};`;
  await db.run(updateTables);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;

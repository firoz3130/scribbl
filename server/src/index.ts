import * as WebSocket from "ws";
import { config } from "dotenv";

config();

const PORT = Number(process.env.PORT || 8080);
const wss = new WebSocket.Server({ port: PORT });

console.log(`Firos's WS running on port ${PORT}`);

type Player = {
  id: string;
  socket: WebSocket;
  score:number;
};

type Room = {
  players: Player[];
  drawerId: string | null;
  drawerIndex: number;
  word: string | null;
  timer: number;
  interval?: NodeJS.Timeout;
};

const rooms: Record<string, Room> = {};

const WORDS = ["apple", "car", "house", "tree"];


    function endRound(roomId: string) {
        const room = rooms[roomId];

        clearInterval(room.interval);

        // send scores
        broadcast(roomId, {
            type: "SCORE",
            scores: room.players.map(p => ({
            id: p.id,
            score: p.score,
            })),
        });

        // clear canvas
        broadcast(roomId, { type: "CLEAR" });

        // ⏭ auto next round after 3s
        setTimeout(() => {
            nextRound(roomId);
        }, 3000);
        }

        function nextRound(roomId: string) {
        const room = rooms[roomId];

        room.word = null;
        room.timer = 15;

        // 🔁 rotate drawer
        room.drawerIndex =
            (room.drawerIndex + 1) % room.players.length;

        // assign roles
        const drawer = room.players[room.drawerIndex];
        room.players.forEach(p => {
            p.socket.send(
            JSON.stringify({
                type: "ROLE",
                role: p.id === drawer.id ? "DRAWER" : "GUESSER",
            })
            );
        });
        }
        function startTimer(roomId: string) {
        const room = rooms[roomId];
        room.timer = 15;

        room.interval = setInterval(() => {
            room.timer--;

            broadcast(roomId, {
            type: "TIMER",
            time: room.timer,
            });

        if (room.timer <= 0) {
        clearInterval(room.interval);

        // notify guessers
        room.players.forEach(p => {
            if (p.id !== room.players[room.drawerIndex].id) {
            p.socket.send(
                JSON.stringify({
                type: "ROUND_END",
                word: room.word,
                })
            );
            }
        });

        endRound(roomId);
        }

        }, 1000);
        }


function broadcast(roomId: string, data: any) {
  rooms[roomId].players.forEach(p => {
    p.socket.send(JSON.stringify(data));
  });
}

wss.on("connection", (socket, req) => {
  const url = req.url || "/";
  const roomId = url.split("/room/")[1] || "default";

  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: [],
      drawerId: null,
      drawerIndex: 0,
      word: null,
      timer: 15,
    };
  }

  const room = rooms[roomId];
  const id = Math.random().toString(36).slice(2);

  room.players.push({ id, socket , score:0});
  socket.send(
  JSON.stringify({
    type: "ID",
    id,
  })
);

  if (!room.drawerId) {
    room.drawerId = id;
    socket.send(JSON.stringify({ type: "ROLE", role: "DRAWER" }));
  } else {
    socket.send(JSON.stringify({ type: "ROLE", role: "GUESSER" }));
  }

  socket.on("message", data => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "WORD") {
      room.word = msg.word;
      broadcast(roomId, {
        type: "WORD",
        wordLength: msg.word.length,
      });
      startTimer(roomId);
      return;
    }
        


        if (msg.type === "GUESS") {
        if (!room.word) return;

        if (msg.guess.toLowerCase() === room.word.toLowerCase()) {
            // ✅ increase score
            const guesser = room.players.find(p => p.id === id);
            if (guesser) guesser.score += 10;

            // notify only guesser
            socket.send(JSON.stringify({ type: "CORRECT" }));

            endRound(roomId);
        }
        return;
        }



    broadcast(roomId, msg);
  });

    socket.on("close", () => {
        const room = rooms[roomId];
        if (!room) return;

        // remove player
        room.players = room.players.filter(p => p.id !== id);

        // fix drawerIndex if out of bounds
        if (room.drawerIndex >= room.players.length) {
            room.drawerIndex = 0;
        }

        // reset drawer if needed
        if (room.drawerId === id) {
            room.drawerId = room.players[room.drawerIndex]?.id ?? null;
        }

        // delete empty room
        if (room.players.length === 0) {
            delete rooms[roomId];
            return;
        }

        // broadcast updated scores/player list
        broadcast(roomId, {
            type: "SCORE",
            scores: room.players.map(p => ({
            id: p.id,
            score: p.score,
            })),
        });
        });

});

console.log("WS running on ws://localhost:8080");

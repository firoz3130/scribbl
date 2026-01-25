# 🎨 Scribbl - Real-time Multiplayer Drawing Game

A fast-paced, real-time multiplayer drawing and guessing game built with React and WebSocket. One player draws while others race to guess the word!

## 🎮 How to Play

1. **Get Assigned a Role**: When you join, you're either the **DRAWER** or **GUESSER**
2. **Drawer Picks a Word**: From a list of suggestions (apple, car, house, tree...)
3. **Race Against Time**: 15-second countdown starts
4. **Drawer**: Draw the word on the canvas
5. **Guessers**: Watch and type guesses in the input box
6. **First Correct Guess Wins**: Round ends, new game begins

---

## 🏗️ System Architecture

### **High-Level Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    SCRIBBL GAME SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌────────────────────┐  │
│  │   CLIENT (Web)   │◄────WS────►  │  SERVER (Node.js)  │  │
│  │  React + Vite    │   Messages   │  WebSocket Server  │  │
│  │                  │              │  (port 8080)       │  │
│  │  • Canvas Drawing│              │                    │  │
│  │  • Game UI       │              │  • Room Management │  │
│  │  • Guess Input   │              │  • Timer Logic     │  │
│  │  • Real-time Sync│              │  • Guess Validation│  │
│  └──────────────────┘              └────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            WebSocket Message Flow                   │   │
│  │                                                     │   │
│  │  Client → Server:                                  │   │
│  │    • DRAW (x, y) - Drawing strokes                 │   │
│  │    • WORD (word) - Drawer picks word               │   │
│  │    • GUESS (guess) - Guesser submits answer        │   │
│  │    • CLEAR - Erase canvas                          │   │
│  │                                                     │   │
│  │  Server → Clients:                                 │   │
│  │    • ROLE (role) - Assign drawer/guesser           │   │
│  │    • WORD (wordLength) - Round starts              │   │
│  │    • DRAW (x, y) - Broadcast strokes              │   │
│  │    • TIMER (time) - Countdown updates              │   │
│  │    • CLEAR - Clear canvas                          │   │
│  │    • CORRECT (winner) - Someone won               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Data Model**

#### Room
```typescript
{
  players: Player[],          // All connected players
  drawerId: string | null,    // ID of current drawer
  word: string | null,        // Secret word being drawn
  timer: number,              // Countdown (15 → 0)
  interval?: NodeJS.Timeout   // Timer interval reference
}
```

#### Player
```typescript
{
  id: string,        // Unique player ID
  socket: WebSocket  // Connection for messages
}
```

### **Game State Flow**

```
┌──────────────┐
│ Player Joins │
│              │
│ First player?
│   YES → DRAWER
│   NO  → GUESSER
└──────────────┘
      ↓
┌──────────────────────┐
│ Waiting for Word     │
│ (Drawer picks word)  │
└──────────────────────┘
      ↓
┌──────────────────────┐
│ Round Active         │
│ Timer: 15 → 0        │
│ • Drawer draws       │
│ • Guessers guess     │
└──────────────────────┘
      ↓
   ┌─ Timer ends? ──┐
   │                │
   YES             NO
   │       ┌─ Correct guess? ─┐
   │       │                  │
   │      YES               NO
   │       │                │
   └──────→┴────────────────┘
           ↓
    ┌─────────────────┐
    │  Round Ends     │
    │  Canvas clears  │
    │  Ready for next │
    └─────────────────┘
```

---

## 📁 Project Structure

```
scribbl/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx         # Drawing canvas component
│   │   │   ├── GuessBox.tsx       # Guess input component
│   │   │   ├── Timer.tsx          # Countdown display
│   │   │   └── WordPicker.tsx     # Word selection buttons
│   │   ├── hooks/
│   │   │   └── useSocket.ts       # WebSocket connection hook
│   │   ├── pages/
│   │   │   └── Game.tsx           # Main game page
│   │   ├── types/
│   │   │   └── socket.ts          # TypeScript message types
│   │   ├── App.tsx                # Root component
│   │   ├── main.tsx               # Entry point
│   │   └── styles (css files)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── eslint.config.js
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── index.ts               # Main server file (WebSocket logic)
│   │   ├── room.ts                # Room management (if modularized)
│   │   └── types.ts               # Shared TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                  # This file
```

### **Component Responsibilities**

#### **Client Components**

| Component | Purpose |
|-----------|---------|
| `Game.tsx` | Main game logic, state management, message handling |
| `Canvas.tsx` | Drawing area, handles mouse events, renders strokes |
| `GuessBox.tsx` | Input field for guesses (guesser only) |
| `Timer.tsx` | Displays countdown timer |
| `WordPicker.tsx` | Word selection buttons (drawer only) |
| `useSocket.ts` | WebSocket connection management, auto-reconnect |

#### **Server Components**

| File | Purpose |
|------|---------|
| `index.ts` | WebSocket server, room management, game logic |
| `room.ts` | (Future) Room operations isolated from main server |
| `types.ts` | (Future) Shared TypeScript types |

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- npm or yarn

### **Installation**

```bash
# Clone repository
git clone <repo-url>
cd scribbl

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### **Running the Game**

#### **1. Start the Server**
```bash
cd server
npm run dev
# or
npm start
```
Server runs on `ws://localhost:8080`

#### **2. Start the Client**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173` (Vite default)

#### **3. Open Multiple Browser Tabs**
- Open `http://localhost:5173` in multiple tabs/windows
- Each tab is a separate player
- First player is the DRAWER, others are GUESSERS

---

## 📊 Message Types & Protocol

### **Client → Server Messages**

```typescript
// Drawer picks a word
{ type: "WORD", word: "apple" }

// Drawer draws a stroke
{ type: "DRAW", x: 100, y: 200 }

// Guesser submits a guess
{ type: "GUESS", guess: "apple" }

// Clear canvas
{ type: "CLEAR" }
```

### **Server → Client Messages**

```typescript
// Assign role on connection
{ type: "ROLE", role: "DRAWER" | "GUESSER" }

// Round starts (tells guessers the word length)
{ type: "WORD", wordLength: 5 }

// Broadcast drawing stroke
{ type: "DRAW", x: 100, y: 200 }

// Timer tick
{ type: "TIMER", time: 14 }

// Clear canvas
{ type: "CLEAR" }

// Someone guessed correctly!
{ type: "CORRECT", winner: "player-id-123" }
```

---

## 🎯 Game Logic Explained

### **Game Flow on Server**

1. **Player Connects**
   - Extract room ID from URL: `ws://localhost:8080/room/game1`
   - Create room if doesn't exist
   - Assign first player as DRAWER, rest as GUESSERS

2. **Drawer Picks Word**
   - Server receives `{ type: "WORD", word: "apple" }`
   - Stores word in `room.word`
   - Broadcasts to all: `{ type: "WORD", wordLength: 5 }`
   - Starts 15-second timer

3. **During Round (15 seconds)**
   - Drawer's DRAW messages → broadcast to all guessers
   - Timer counts down every 1 second → broadcast to all
   - Guessers send GUESS messages

4. **Guess Validation**
   - Server compares `guess.toLowerCase()` with `room.word`
   - If **correct**: broadcast CORRECT, stop timer, clear canvas
   - If **wrong**: ignore, round continues

5. **Round Ends (Timer = 0 or Correct Guess)**
   - Clear word from memory
   - Next round ready to start

### **Game Flow on Client**

1. **Receive ROLE** → Show UI based on role
2. **Drawer picks word** → Send WORD message, buttons disappear
3. **Round Active** 
   - Draw → Send DRAW messages
   - Display incoming DRAW messages on canvas
   - Update timer every TIMER message
4. **Guess** → Guessers type, press Enter
5. **Round ends** → Reset all state, ready for next

---

## 🔧 Tech Stack

### **Frontend**
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **WebSocket (Browser API)**: Real-time communication
- **CSS3**: Styling

### **Backend**
- **Node.js**: JavaScript runtime
- **TypeScript**: Type safety
- **ws**: WebSocket server library

### **Development Tools**
- **ESLint**: Code linting
- **Vite**: Fast module bundling

---

## 📈 Features (Current)

✅ Real-time drawing synchronization
✅ Role assignment (drawer vs guesser)
✅ 15-second countdown timer
✅ Word guessing validation
✅ Canvas clearing/eraser
✅ Multiple room support
✅ Player disconnect handling
✅ TypeScript for type safety

---

## 🚧 Future Features & Roadmap

### **Phase 1: Core Enhancements**
- [ ] Score/points system per round
- [ ] Role rotation (drawer changes after round)
- [ ] Drawing colors and brush sizes
- [ ] Undo/Redo for drawing
- [ ] Chat messages during game
- [ ] Player name/display

### **Phase 2: Game Modes**
- [ ] Team mode (teams vs teams)
- [ ] Practice mode (vs computer)
- [ ] Timed leagues (daily challenges)
- [ ] Custom word lists
- [ ] Word categories (animals, food, objects)

### **Phase 3: Advanced Features**
- [ ] Hints system (reveal letters after X sec)
- [ ] Replay/save game recordings
- [ ] Leaderboards
- [ ] Achievement badges
- [ ] Sound effects & music
- [ ] Difficulty levels

### **Phase 4: Infrastructure**
- [ ] Database for persistence (MongoDB/PostgreSQL)
- [ ] User authentication & profiles
- [ ] Spectator mode
- [ ] Mobile app (React Native)
- [ ] Analytics & game stats
- [ ] Docker deployment

---

## 🐛 Known Issues & Limitations

- **Single-thread timer**: If server is busy, timer might skip
- **No persistence**: Games aren't saved
- **No authentication**: Anyone can join any room
- **No anti-cheat**: Drawer could potentially cheat
- **Drawing performance**: Large strokes might lag on slow connections
- **Room cleanup**: Old rooms stay in memory if players disconnect

---

## 🔐 Security Considerations

- ✅ Input validation on guesses (case-insensitive comparison)
- ⚠️ TODO: Rate limiting on message sending
- ⚠️ TODO: Validate drawing coordinates to prevent abuse
- ⚠️ TODO: Authentication/authorization
- ⚠️ TODO: HTTPS/WSS for production

---

## 📝 Development Notes

### **How to Add a New Message Type**

1. **Add to `socket.ts` type definition**:
```typescript
export type MyNewMessage = {
  type: "MYNEW";
  data: string;
};

export type SocketMessage = 
  | ... existing types ...
  | MyNewMessage;
```

2. **Handle in client (Game.tsx)**:
```typescript
case "MYNEW":
  // Do something
  break;
```

3. **Handle in server (index.ts)**:
```typescript
if (msg.type === "MYNEW") {
  broadcast(roomId, msg);
}
```

### **How to Add a New Game Feature**

Most features flow through the `broadcast()` function on the server, so:
1. Define new message type
2. Send message when action occurs
3. Broadcast to all players
4. Handle on client side

---

## 📞 Support & Contributions

For bugs or feature requests, create an issue in the repository.

---

## 📄 License

MIT License - feel free to use this project!

---

## 🎉 Credits

Built as a Hackathon project. Have fun drawing! 🎨

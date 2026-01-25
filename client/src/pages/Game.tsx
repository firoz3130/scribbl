import { useState } from "react";
import "../styles/Game.css";
import Canvas from "../components/Canvas";
import { useSocket } from "../hooks/useSocket";
import Toast from "../components/Toast";
import type { SocketMessage, DrawMessage } from "../types/socket";

const WORDS = ["apple", "car", "house"];

type ToastItem = {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
};

export default function Game() {
  const [isDrawer, setIsDrawer] = useState(false);
  const [stroke, setStroke] = useState<DrawMessage | null>(null);
  const [wordLength, setWordLength] = useState(0);
  const [guess, setGuess] = useState("");
  const [time, setTime] = useState(15);
  const [roundActive, setRoundActive] = useState(false);
  const [scores, setScores] = useState<{ id: string; score: number }[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };



  function handleRoundEnd() {
    setStroke(null);
    setWordLength(0);
    setRoundActive(false);
    setGuess("");
    setTime(15);
  }

  const { send } = useSocket((data: SocketMessage) => {
    switch (data.type) {
      case "ROLE":
        setIsDrawer(data.role === "DRAWER");
        setWordLength(0);
        setGuess("");
        addToast(
          data.role === "DRAWER"
            ? "You are the DRAWER! 🎨"
            : "You are the GUESSER! 🔍",
          "info"
        );
        break;

      case "DRAW":
        setStroke(data);
        break;

      case "WORD":
        if ("wordLength" in data) {
          setWordLength(data.wordLength);
          setRoundActive(true);
          addToast("Round started! 🎮", "info");
        }
        break;

      case "TIMER":
        setTime(data.time);
        if (data.time === 0) {
          handleRoundEnd();
        }
        break;

      case "CLEAR":
        setStroke(null);
        break;

      case "CORRECT":
        addToast("🎉 Correct guess! Well done!", "success");
        handleRoundEnd();
        break;

      case "SCORE":
        setScores(data.scores);
        break;

      case "ROUND_END":
        addToast(`⏰ Time's up! Word was: ${data.word}`, "warning");
        handleRoundEnd();
        break;

      case "ID":
        setMyId(data.id);
        break;
    }
  });



  return (
    <div className="game-container">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="game-header">
        <div className="header-content">
          <h1 className="game-title">🎨 Scribbl</h1>
          <p className="game-subtitle">Real-time Drawing & Guessing Game</p>
        </div>
        <div className="timer-badge">
          <span className="timer-icon">⏱</span>
          <span className="timer-value">{time}s</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="game-content">
        {/* Left Panel - Scores */}
        <div className="scores-panel">
          <h3 className="scores-title">Leaderboard</h3>
          <ul className="scores-list">
            {scores.map((s, idx) => (
              <li
                key={s.id}
                className={`score-item ${s.id === myId ? "my-score" : ""}`}
              >
                <span className="score-rank">#{idx + 1}</span>
                <span className="score-name">
                  {s.id === myId ? "You" : s.id.slice(0, 8)}
                </span>
                <span className="score-value">{s.score}</span>
              </li>
            ))}
          </ul>
          <div className="role-badge">
            {isDrawer ? (
              <div className="badge badge-drawer">🎨 Drawer</div>
            ) : (
              <div className="badge badge-guesser">🔍 Guesser</div>
            )}
          </div>
        </div>

        {/* Center - Canvas and Controls */}
        <div className="game-center">
          {/* Word Display */}
          {!isDrawer && roundActive && (
            <div className="word-display">
              <p className="word-text">{"_ ".repeat(wordLength)}</p>
            </div>
          )}

          {/* Drawer Controls */}
          {isDrawer && !roundActive && (
            <div className="controls-section">
              <h3 className="controls-title">Pick a Word to Draw</h3>
              <div className="word-buttons">
                {WORDS.map((w) => (
                  <button
                    key={w}
                    className="word-button"
                    onClick={() => send({ type: "WORD", word: w })}
                  >
                    {w.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Canvas */}
          <Canvas
            send={send}
            isDrawer={isDrawer}
            incomingStroke={stroke}
          />

          {/* Eraser Button */}
          {isDrawer && roundActive && (
            <div className="eraser-section">
              <button
                className="eraser-button"
                onClick={() => send({ type: "CLEAR" })}
              >
                🧹 Clear Canvas
              </button>
            </div>
          )}

          {/* Guess Input */}
          {!isDrawer && roundActive && (
            <div className="guess-section">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="guess-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && guess.trim()) {
                    send({ type: "GUESS", guess });
                    setGuess("");
                    addToast(`Guessed: "${guess}"`, "info");
                  }
                }}
              />
              <button
                className="guess-button"
                onClick={() => {
                  if (guess.trim()) {
                    send({ type: "GUESS", guess });
                    setGuess("");
                    addToast(`Guessed: "${guess}"`, "info");
                  }
                }}
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Placeholder */}
        <div className="side-panel"></div>
      </div>
    </div>
  );
}

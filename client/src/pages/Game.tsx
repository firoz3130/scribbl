import { useState } from "react";
import Canvas from "../components/Canvas";
import { useSocket } from "../hooks/useSocket";
import type {
  SocketMessage,
  DrawMessage,
} from "../types/socket";

const WORDS = ["apple", "car", "house"];

export default function Game() {
  const [isDrawer, setIsDrawer] = useState(false);
  const [stroke, setStroke] = useState<DrawMessage | null>(null);
  const [wordLength, setWordLength] = useState(0);
  const [guess, setGuess] = useState("");
  const [time, setTime] = useState(15);
  const [roundActive, setRoundActive] = useState(false);
  const [scores, setScores] = useState<
  { id: string; score: number }[]
>([]);
  const [myId, setMyId] = useState<string>("");



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
        break;

      case "DRAW":
        setStroke(data);
        break;

      case "WORD":
        // server → client
        if ("wordLength" in data) {
          setWordLength(data.wordLength);
          setRoundActive(true);
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
        alert("🎉Huuraye!!!!!! Correct guess!");
        handleRoundEnd();
        break;
      
      case "SCORE":
        setScores(data.scores);
        break;
      case "ROUND_END":
        alert(`⏰ Time's up! The word was: ${data.word}`);
        handleRoundEnd();
        break;
      case "ID":
        setMyId(data.id);
        break;
    }

  });



  return (
    <div style={{ padding: 20 }}>
      <h2>Scribbl</h2>
     <ul>
  {scores.map(s => (
    <li
      key={s.id}
      style={{
        fontWeight: s.id === myId ? "bold" : "normal",
        color: s.id === myId ? "#4caf50" : "white",
      }}
    >
      {s.id === myId ? "You" : s.id.slice(0, 5)} : {s.score}
    </li>
  ))}
</ul>


      <p>⏱ Time left: {time}s</p>

      {/* Word display for guessers */}
      {!isDrawer && roundActive && (
        <p>
          Word: {"_ ".repeat(wordLength)}
        </p>
      )}

      {/* Drawer controls */}
      {isDrawer && !roundActive && (
        <>
          <p>Pick a word</p>
          {WORDS.map((w) => (
            <button
              key={w}
              onClick={() => send({ type: "WORD", word: w })}
              style={{ marginRight: 8 }}
            >
              {w}
            </button>
          ))}
        </>
      )}

      {/* Eraser */}
      {isDrawer && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => send({ type: "CLEAR" })}>
            🧹 Eraser (Clear)
          </button>
        </div>
      )}

      {/* Canvas */}
      <Canvas
        send={send}
        isDrawer={isDrawer}
        incomingStroke={stroke}
      />

      {/* Guess input */}
      {!isDrawer && roundActive && (
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Guess..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && guess.trim()) {
              send({ type: "GUESS", guess });
              setGuess("");
            }
          }}
          style={{ marginTop: 10 }}
        />
      )}
    </div>
  );
}

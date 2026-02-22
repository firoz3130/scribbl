import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  function extractRoomId(value: string) {
    try {
      if (value.includes("/room/")) {
        return value.split("/room/")[1];
      }
      return value.trim();
    } catch {
      return null;
    }
  }

  function joinRoom() {
    const roomId = extractRoomId(input);

    if (!roomId) {
      alert("Invalid room link");
      return;
    }

    // Later: ask server if room exists
    navigate(`/room/${roomId}`);
  }

  return (
    <>
      <input
        placeholder="Paste room link or ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={joinRoom}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          background: "#48bb78",
          color: "white",
          cursor: "pointer",
        }}
      >
        🔗 Join Room
      </button>
    </>
  );
}

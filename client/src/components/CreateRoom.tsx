import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const navigate = useNavigate();

  async function createRoom() {
    // TEMP: Replace with socket or API call later
    const roomId = crypto.randomUUID().slice(0, 6);

    const roomLink = `${window.location.origin}/room/${roomId}`;

    await navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");

    navigate(`/room/${roomId}`);
  }

  return (
    <button
      onClick={createRoom}
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "16px",
        borderRadius: "10px",
        border: "none",
        background: "#667eea",
        color: "white",
        cursor: "pointer",
      }}
    >
      ➕ Create Room
    </button>
  );
}

import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "320px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>🎨 Scribbl</h1>

        <CreateRoom />
        <div style={{ height: "16px" }} />
        <JoinRoom />
      </div>
    </div>
  );
}

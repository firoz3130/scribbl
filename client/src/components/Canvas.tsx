import { useEffect, useRef } from "react";
import type { DrawMessage } from "../types/socket";

type Props = {
  send: (data: any) => void;
  isDrawer: boolean;
  incomingStroke: DrawMessage | null;
};

export default function Canvas({ send, isDrawer, incomingStroke }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  /** Draw strokes coming from OTHER players */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#4caf50";

    if (incomingStroke === null) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      return;
    }

    ctx.lineTo(incomingStroke.x, incomingStroke.y);
    ctx.stroke();
  }, [incomingStroke]);

  /** Local drawing (drawer only) */
  function onMouseDown(e: React.MouseEvent) {
    if (!isDrawer) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawing.current = true;

    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing.current || !isDrawer) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    send({ type: "DRAW", x, y });
  }

  function onMouseUp() {
    drawing.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{
        border: "3px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "15px",
        background: "#1a1a2e",
        cursor: isDrawer ? "crosshair" : "default",
        display: "block",
        margin: "0 auto",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        maxWidth: "100%",
        height: "auto",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}

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

    function clearCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;

      // Reset transform before clearing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Re-apply scale
      ctx.scale(dpr, dpr);
      ctx.beginPath();
  }
  /** Setup Hi-DPI canvas */
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  if (incomingStroke === null) {
    clearCanvas();
    return;
  }

  const ctx = canvas.getContext("2d")!;
  ctx.strokeStyle = "#4caf50";

  ctx.lineTo(incomingStroke.x, incomingStroke.y);
  ctx.stroke();
}, [incomingStroke]);


  /** Draw strokes coming from OTHER players */
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || incomingStroke === null) return;

      const ctx = canvas.getContext("2d")!;
      ctx.strokeStyle = "#4caf50";

      ctx.lineTo(incomingStroke.x, incomingStroke.y);
      ctx.stroke();
    }, [incomingStroke]);


  /** Utility: get correct X/Y for mouse + touch */
  function getPos(
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  /** Pointer events (works for mouse + touch + pen) */
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawer) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e);

    drawing.current = true;

    ctx.strokeStyle = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !isDrawer) return;

    const { x, y } = getPos(e);
    send({ type: "DRAW", x, y });
  }

  function onPointerUp() {
    drawing.current = false;
  }



  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "600px",
        height: "400px",
        border: "3px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "15px",
        background: "#1a1a2e",
        cursor: isDrawer ? "crosshair" : "default",
        display: "block",
        margin: "0 auto",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        maxWidth: "100%",
        touchAction: "none", // 🔥 REQUIRED for mobile
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}

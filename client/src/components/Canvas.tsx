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
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

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
        border: "1px solid gray",
        background: "#222",
        marginTop: 10,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}

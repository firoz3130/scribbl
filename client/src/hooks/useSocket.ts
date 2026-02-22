import { useEffect, useRef } from "react";
import type { SocketMessage } from "../types/socket";

export function useSocket(onMessage: (data: SocketMessage) => void) {
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket(
			"https://stream-interval-rug-italiano.trycloudflare.com",
		);
		socketRef.current = ws;

		ws.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			onMessage(data);
		};

		ws.onclose = () => {
			console.log("WebSocket disconnected");
		};

		return () => ws.close();
	}, []);

	const send = (data: SocketMessage) => {
		socketRef.current?.send(JSON.stringify(data));
	};

	return { send };
}

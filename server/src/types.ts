export type DrawMessage = {
  type: "DRAW";
  x: number;
  y: number;
};

export type WordMessage = {
  type: "WORD";
  word: string;
};

export type SocketMessage = DrawMessage | WordMessage;

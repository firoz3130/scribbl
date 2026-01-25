export type DrawMessage = {
	type: "DRAW";
	x: number;
	y: number;
};

export type ClearMessage = {
	type: "CLEAR";
};

export type WordMessage =
	| { type: "WORD"; word: string }
	| { type: "WORD"; wordLength: number };

export type TimerMessage = {
	type: "TIMER";
	time: number;
};

export type CorrectMessage = {
	type: "CORRECT";
};

export type GuessMessage = {
	type: "GUESS";
	guess: string;
};

export type RoleMessage = {
	type: "ROLE";
	role: "DRAWER" | "GUESSER";
};

export type RoundEndMessage = {
	type: "ROUND_END";
	word: string;
};

export type ScoreMessage = {
	type: "SCORE";
	scores: { id: string; score: number }[];
};

export type SocketMessage =
 	| { type: "ID"; id: string }
	| DrawMessage
	| ClearMessage
	| WordMessage
	| TimerMessage
	| CorrectMessage
	| GuessMessage
	| RoleMessage
	| RoundEndMessage
	| ScoreMessage;

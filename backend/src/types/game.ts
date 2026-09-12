export type Player = "X" | "O";

export type CellValue = Player | null;

export type GameStatus = "waiting" | "playing" | "finished";
    
export interface GameState{
    board: CellValue[],
    turn: Player,
    winner: Player | null,
    status: GameStatus
};

export type RoomPlayers = {
    X: string | null,
    O: string | null
}

export type RoomState = {
    players: RoomPlayers,
    game: GameState
}
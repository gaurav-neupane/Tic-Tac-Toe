export type Player = "X" | "O";
export type CellValue = Player | null;
export interface GameState{
    board: CellValue[];
    turn: Player;
    winner: Player | "draw" | null;
}
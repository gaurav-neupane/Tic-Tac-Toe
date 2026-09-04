import { useState } from "react"
import Board from "../components/Board";
import { type GameState } from "../types/game";

export default function Game() {
    const [gameState, setGameState] = useState<GameState>({
        board: [null, null, null, null, null, null, null, null, null],
        turn: "X",
        winner: null
      });
    
      function handleCellClick(id: number) {
        setGameState((prevState) => {
          const newBoard = [...prevState.board];
          newBoard[id] = prevState.turn;
          const nextTurn = prevState.turn === "X" ? "O" : "X";
          return {
            ...prevState,
            board: newBoard,
            turn: nextTurn
          }
        })
      }
    
      return (
        <div className="w-full h-screen flex flex-col justify-evenly items-center bg-black">
          <h1 className="text-white text-5xl">{gameState.turn} Turn</h1>
          <Board board={gameState.board} makeMove={handleCellClick} />
          <div>

          </div>
        </div>
     
      )
}

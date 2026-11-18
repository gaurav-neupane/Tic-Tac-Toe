import { useEffect, useRef, useState } from "react";
import Board from "../components/Board";
import { type Player, type GameState } from "../types/game";
import { useNavigate } from "react-router";
import Modal from "../components/Modal";
import { toast } from "sonner";

export default function Game() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const token = localStorage.getItem("playerToken");
  const roomCode = localStorage.getItem("roomCode");
  useEffect(() => {
    if (!token || !roomCode) {
      navigate("/");
      return;
    }
    const ws = new WebSocket(
      `ws://localhost:8787/room/${roomCode}/ws?token=${token}`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Websocket connected");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "player_assigned") {
        setPlayer(data.player);
        return;
      }
      if (data.type === "game_status") {
        setGameState(data.game);
        console.log(gameState);
        return;
      }
      if (data.type === "error") {
        toast.error(data.message);
        return;
      }
    };
    ws.onerror = (error) => {
      console.log(error);
    };
    ws.onclose = () => {
      console.log("Websocket disconnected");
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [navigate]);

  function handleCellClick(id: number) {
    if (!wsRef.current) {
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "move",
        position: id,
      }),
    );
  }

  if (!gameState) {
    return (
      <div className="w-full h-screen flex flex-col justify-evenly items-center bg-black">
        <Modal isOpen={true}>
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-white">Loading...</h2>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col justify-evenly items-center bg-black">
      {gameState.turn === player ? (
        <h1 className="text-white text-5xl">Your Turn</h1>
      ) : (
        <h1 className="text-white text-5xl">Opponent's Turn</h1>
      )}
      <Board board={gameState.board} makeMove={handleCellClick} />
      <Modal isOpen={gameState.status === "waiting"}>
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
          <h2 className="text-white text-lg md:text-xl">
            The code is: {<span className="font-bold">{roomCode}</span>}
          </h2>
          <h3 className="text-white text-lg md:text-xl">
            Waiting for other player to join...
          </h3>
        </div>
      </Modal>
      <Modal isOpen={gameState.status === "finished"}>
        <div className="w-full h-full flex flex-col justify-evenly items-center gap-2">
          {gameState.winner === "draw" ? (
            <h2 className="text-white text-lg md:text-2xl">It's a Draw</h2>
          ) : gameState.winner === player ? (
            <h2 className="text-white text-lg md:text-2xl">You Won!</h2>
          ) : (
            <h2 className="text-white text-lg md:text-2xl">Your Opponent Won.</h2>
          )}
          <div className="flex flex-col justify-center items-center gap-4">
            <button className="bg-white w-42 h-12 text-lg md:text-xl active:scale-95 hover:scale-105">Play again</button>
            <button className="bg-white w-42 h-12 text-lg md:text-xl active:scale-95 hover:scale-105">Exit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

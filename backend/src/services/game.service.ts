import { GameState, Player} from "../types/game";

export function handleMove(player: Player, position: number, gameState: GameState) {
    if (gameState.status !== "playing") {
        return {
            success: false,
            error: "Game is not active",
        };
    }
    if (gameState.turn !== player) {
        return {
            success: false,
            error: "It's not your turn",
        };
    }
    if (!Number.isInteger(position) || position < 0 || position > 8) {
        return {
            success: false,
            error: "Invalid position",
        };
    }
    if (gameState.board[position] !== null) {
        return {
            success: false,
            error: "Cell is already occupied",
        };
    }

    gameState.board[position] = player;

    const winner = checkWinner(gameState.board);

    if (winner) {
        gameState.winner = winner;
        gameState.status = "finished";

        return {
            success: true,
            gameState,
        };
    }

    if (checkDraw(gameState.board)) {
        gameState.winner = "draw";
        gameState.status = "finished";

        return {
            success: true,
            gameState,
        };
    }

    gameState.turn = player === "X" ? "O" : "X";

    return {
        success: true,
        gameState
    };
}

function checkWinner(board: (Player | null)[]): Player | null{
    const winningPositions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6],
    ]

    for (const [a, b, c] of winningPositions) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkDraw(board: (Player | null)[]): boolean {
    return board.every(cell => cell !== null);
}
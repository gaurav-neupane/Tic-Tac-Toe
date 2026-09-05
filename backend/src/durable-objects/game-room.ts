import { GameState, Player } from "../types/game"

export class GameRoom implements DurableObject{

    private players: Map<Player, WebSocket> = new Map();

    private game: GameState = {
        board: Array(9).fill(null),
        turn: "X",
        winner: null,
        status: "waiting"
    }

    constructor(private ctx: DurableObjectState, private env: Env) {
        this.ctx = ctx;
        this.env = env;
     }

    async fetch(request: Request): Promise<Response> {
        const upgradeHeader = request.headers.get("Upgrade");

        if (upgradeHeader !== "websocket") {
            return new Response("Expected Websocket", { status: 426 });
        }

        const { 0: client, 1: server } = new WebSocketPair();

        server.accept();

        this.players.set("X", server);

        server.send(
            JSON.stringify({
                type: "player_assigned",
                player: "X"
            })
        );

        server.send(
            JSON.stringify({
                type: "game_status",
                game: this.game
            })
        );

        server.addEventListener("message", (event) => {
            
        });

        server.addEventListener("close", () => {
            this.players.delete("X");
        });


        return new Response(null, {
            status: 101,
            webSocket: client
        });


    }
}
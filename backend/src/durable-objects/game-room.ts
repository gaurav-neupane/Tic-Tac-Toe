import { createNewRoom, joinExistingRoom } from "../services/room.service";
import { Player, RoomState } from "../types/game"

export class GameRoom implements DurableObject{

    private connections: Map<Player, WebSocket> = new Map();

    private roomState: RoomState = {
        players: {
            X: null,
            O: null
        },
        game: {
            board: Array(9).fill(null),
            turn: "X",
            winner: null,
            status: "waiting"
        }
    }

    private async loadGame() {
        const savedRoom = await this.ctx.storage.get<RoomState>("room");
        if (savedRoom) {
            this.roomState = savedRoom;
        }
    }

    constructor(private ctx: DurableObjectState, private env: Env) {
        this.ctx = ctx;
        this.env = env;
     }

    async fetch(request: Request): Promise<Response> {

        const url = new URL(request.url);

        if (url.pathname === "/create") {
            return this.createRoom();
        }

        if (url.pathname === "/join") {
            return this.joinRoom(request);
        }

        if (url.pathname === "/ws") {
            return this.handleWebSocket(request);
        }

        return new Response("404 Not Found", { status: 404 });

    };

    private async createRoom(): Promise<Response> {
        const result = await createNewRoom(this.roomState);
        this.roomState = result.roomState
        await this.ctx.storage.put("room", this.roomState);
        return Response.json({
            token: result.token,
            player: result.player
        })
    }

    private async joinRoom(request: Request): Promise<Response>{
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const result = await joinExistingRoom(this.roomState, token!);
        if ("error" in result) {
            return Response.json({
                error: result.error,
            }, { status: 400 });
        }
        this.roomState = result.roomState;
        await this.ctx.storage.put("room", this.roomState);
        return Response.json({
            token: result.token,
            player: result.player
        });
    }

    private async handleWebSocket(request: Request): Promise<Response>{
        await this.loadGame();

        const upgradeHeader = request.headers.get("Upgrade");

        if (upgradeHeader !== "websocket") {
            return new Response("Expected Websocket", { status: 426 });
        }

        const { 0: client, 1: server } = new WebSocketPair();

        server.accept();

        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return new Response("Token required", { status: 401 });
        }

        let player: Player | null = null;

        if (this.roomState.players.X === token) {
            player = "X";
        } else if (this.roomState.players.O === token) {
            player = "O";
        };

        if (!player) {
            return new Response("Invalid token", { status: 401 });
        }
        
        this.connections.set(player, server);

        server.send(
            JSON.stringify({
                type: "player_assigned",
                player: player
            })
        );

        server.send(
            JSON.stringify({
                type: "game_status",
                game: this.roomState.game
            })
        );

        server.addEventListener("message", (event) => {
            
        });

        server.addEventListener("close", () => {
            this.connections.delete(player);
        });


        return new Response(null, {
            status: 101,
            webSocket: client
        });

    }


}
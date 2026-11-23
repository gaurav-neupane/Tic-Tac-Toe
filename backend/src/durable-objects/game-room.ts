import { handleMove } from "../services/game.service";
import { createNewRoom, joinExistingRoom } from "../services/room.service";
import { Player, RoomState } from "../types/game"

const DISCONNECT_TIMEOUT = 30 * 1000;

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
        },
        disconnect: {
            X: null,
            O: null
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
            return this.joinRoom();
        }

        if (url.pathname.endsWith("/ws")) {
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

    private async joinRoom(): Promise<Response>{
        const result = await joinExistingRoom(this.roomState);
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

        if (this.roomState.game.status === "abandoned") {
            return Response.json(
                { error: "Room has been abandoned" },
                { status: 410 }
            );
        };

        const deadline = this.roomState.disconnect[player];

        if (this.roomState.disconnect[player] !== null) {
            this.roomState.disconnect[player] = null;
            await this.ctx.storage.put("room", this.roomState);
            await this.scheduleNextAlarm();
        }

        const { 0: client, 1: server } = new WebSocketPair();

        server.accept();

        this.connections.set(player, server);

        if (deadline !== null) {
            this.broadcast({
                type: "player_reconnected",
                player
            });
        }

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

        if(this.hasBothPlayers() && this.roomState.game.status === "waiting"){
            this.roomState.game.status = "playing";
            await this.ctx.storage.put("room", this.roomState);
            this.broadcast({
                type: "game_status",
                game: this.roomState.game
            });
        }

        if(this.hasBothPlayers() && this.roomState.game.status )

        server.addEventListener("message", (event) => {
            this.handleMessage(player,event.data);
        });

        server.addEventListener("close", async () => {
            
            if (this.connections.get(player) !== server) {
                return;
            }

            this.connections.delete(player);
            if (this.roomState.game.status !== "playing") {
                return;
            }
            this.roomState.disconnect[player] = Date.now() + DISCONNECT_TIMEOUT;
            await this.ctx.storage.put("room", this.roomState);

            this.broadcast({
                type: "player_disconnected",
                player,
                expiresAt: this.roomState.disconnect[player]
            });

            await this.scheduleNextAlarm();
        });

        return new Response(null, {
            status: 101,
            webSocket: client
        });

    }

    private broadcast(message: unknown) {
        const data = JSON.stringify(message);
        for (const socket of this.connections.values()) {
            socket.send(data);
        }
    };

    private hasBothPlayers(): boolean{
        return this.connections.has("X") && this.connections.has("O");
    };

    private handleMessage(player: Player, data: string | ArrayBuffer) {
        try {
            const message = JSON.parse(data.toString());
            if (message.type === "move") {
                this.handlePlayerMove(player, message.position);
            };
            
        } catch {
            const socket = this.connections.get(player);
            socket?.send(JSON.stringify({
                type: "error",
                message: "Invalid message",
            }));
        }
    }

    private async handlePlayerMove(player: Player, position: number) {
        const result = handleMove(player, position, this.roomState.game);
        if (!result.success) {
            this.sendError(player, result.error!);
            return;
        }
        this.roomState.game = result.gameState!;
        await this.ctx.storage.put("room", this.roomState);

        this.broadcast({
            type: "game_status",
            game: this.roomState.game
        });
    }

    private sendError(player: Player, message: string) {
        const socket = this.connections.get(player);
        socket?.send(JSON.stringify({
            type: "error",
            message
        }))
    }

    private async scheduleNextAlarm() {
        const deadlines = Object.values(this.roomState.disconnect).filter((deadline): deadline is number => deadline != null);

        if (deadlines.length === 0) {
            await this.ctx.storage.deleteAlarm();
            return;
        }

        await this.ctx.storage.setAlarm((Math.min(...deadlines)));
    }

    async alarm() {
        await this.loadGame();
        
        if (this.roomState.game.status !== "playing") {
            return;
        }

        const now = Date.now();

        const expiredPlayer = (Object.entries(this.roomState.disconnect) as [Player, number | null][]).find(([_, deadline]) => deadline !== null && deadline <= now);

        if (expiredPlayer) {
            const [player] = expiredPlayer;
            this.roomState.game.status = "abandoned";
            await this.ctx.storage.put("room", this.roomState);

            this.broadcast({
                type: "room_abandoned",
                player,
                message: `Room has been abandoned due to disconnection timeout of player ${player}`
            });

            await this.ctx.storage.deleteAlarm();

            return;
        }

        await this.scheduleNextAlarm();
    }
}
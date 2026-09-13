import { Context } from "hono";
import { generateRoomCode } from "../utils/generate-code";
import { env } from "cloudflare:workers";

export async function createRoom(c: Context) {
    const code = generateRoomCode();
    const id = env.GAME_ROOM.idFromName(code);
    const room = env.GAME_ROOM.get(id);
    const response = await room.fetch(new Request("https://internal/create", {
        method: "POST",
    }));
    const data = await response.json() as {};
    return c.json({
        roomCode: code,
        ...data
    });
}

export async function joinRoom(c: Context) {
    const code = c.req.param("code");
    if (!code) {
        return c.json({
            error: "Code not found",
        }, 400);
    };
    if (code.length < 6 || code.length > 6) {
        return c.json({
            error: "Invalid code",
        }, 400);
    }
    const id = env.GAME_ROOM.idFromName(code);
    const room = env.GAME_ROOM.get(id);
    const response = await room.fetch(new Request("https://internal/join", {
        method: "POST",
    }));

    const data = await response.json() as {};

    return c.json({
        ...data
    });

 
}

export async function wsConnect(c:Context) {
    const code = c.req.param("code");
    if (!code) {
        return c.json({
            error: "Code not found",
        }, 400);
    };
    if (code.length < 6 || code.length > 6) {
        return c.json({
            error: "Invalid code",
        }, 400);
    }

    const id = env.GAME_ROOM.idFromName(code);
    const room = env.GAME_ROOM.get(id);

    return room.fetch(c.req.raw);
}
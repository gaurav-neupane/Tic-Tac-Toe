import { Context } from "hono";
import { createNewRoom, joinExistingRoom } from "../services/room.service";


export async function createRoom(c: Context) {
    const room = await createNewRoom();
    return c.json({
        roomCode: room.code
    })
}

export async function joinRoom(c:Context) {
    const code = c.req.param("code");
    if (!code) {
        return c.json({
            error: "Room code is required"
        },400);
    }
    const result = await joinExistingRoom(code);
    if (!result) {
        return c.json({
            result
        },400);
    };
    return c.json(
        result
    )

}

export async function wsConnect(c:Context) {
    const code = c.req.param("code");
}
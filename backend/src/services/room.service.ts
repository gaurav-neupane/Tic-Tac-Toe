import { env } from "cloudflare:workers";
import { generateRoomCode } from "../utils/generate-code";


export async function createNewRoom() {
    const code = generateRoomCode();
    const id = env.GAME_ROOM.idFromName(code);
    const room = env.GAME_ROOM.get(id);
    return {
        code
    };
}

export async function joinExistingRoom(code: string) {
    //Room entering logic

    return {
        success: true
    };
}
import { Hono } from "hono";
import { createRoom, joinRoom, wsConnect } from "../controllers/room.controller";

const roomRoutes = new Hono();

roomRoutes.post("/create", createRoom);

roomRoutes.post("/:code/join", joinRoom);

roomRoutes.get("/:code/ws", wsConnect)

export default roomRoutes;
